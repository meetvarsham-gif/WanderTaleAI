import type { Connect, Plugin, PreviewServer, ViteDevServer } from 'vite';

interface ImageApiPluginOptions {
  apiKey: string | undefined;
}

/**
 * Dev/preview-server-only middleware that generates each day's travel photo.
 *
 * - If OPENAI_API_KEY is configured server-side, uses OpenAI's Images API.
 * - Otherwise, proxies to Pollinations.ai (free, keyless, real text-to-image).
 *
 * Both providers are called from the server, not the browser: a plain browser
 * `fetch()` to Pollinations is blocked by its bot-protection (Cloudflare
 * Turnstile), while a server-side request is not — this was verified directly
 * before relying on it. Proxying server-side also lets us read Pollinations'
 * real rate-limit response (HTTP 402, `FREE_LIMIT`, with an exact retry-after)
 * instead of letting the browser silently receive a "Free limit reached"
 * placeholder image as if it were a real result.
 *
 * The OpenAI key itself is read from server-side process env only (via Vite's
 * `loadEnv`) and never reaches client code.
 */
export function imageApiPlugin({ apiKey }: ImageApiPluginOptions): Plugin {
  // Tracks Pollinations' documented "1 free image per 45s per IP" limit so we
  // can pre-emptively tell the client how long to wait, instead of wasting a
  // round trip to find out.
  let lastPollinationsRequestAt = 0;
  const POLLINATIONS_MIN_GAP_MS = 46_000;

  const handler: Connect.NextHandleFunction = (req, res) => {
    void handleRequest(req, res, apiKey, {
      getLastRequestAt: () => lastPollinationsRequestAt,
      setLastRequestAt: (t) => {
        lastPollinationsRequestAt = t;
      },
      minGapMs: POLLINATIONS_MIN_GAP_MS,
    });
  };

  return {
    name: 'wandertale-image-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/generate-image', handler);
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use('/api/generate-image', handler);
    },
  };
}

interface PollinationsThrottle {
  getLastRequestAt: () => number;
  setLastRequestAt: (t: number) => void;
  minGapMs: number;
}

async function handleRequest(
  req: any,
  res: any,
  apiKey: string | undefined,
  throttle: PollinationsThrottle
): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'method_not_allowed' });
    return;
  }

  let prompt: string;
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const raw = Buffer.concat(chunks).toString('utf-8');
    const body = raw ? JSON.parse(raw) : {};
    prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 900) : '';
  } catch {
    sendJson(res, 400, { error: 'invalid_request', message: 'Request body must be JSON.' });
    return;
  }

  if (!prompt) {
    sendJson(res, 400, { error: 'invalid_request', message: 'A non-empty "prompt" string is required.' });
    return;
  }

  if (apiKey) {
    await generateWithOpenAI(prompt, apiKey, res);
  } else {
    await generateWithPollinations(prompt, res, throttle);
  }
}

async function generateWithOpenAI(prompt: string, apiKey: string, res: any): Promise<void> {
  try {
    const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1792x1024',
        quality: 'standard',
        response_format: 'b64_json',
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      sendJson(res, openaiRes.status, {
        error: 'provider_error',
        message: `OpenAI image request failed (${openaiRes.status}): ${errBody.slice(0, 300)}`,
      });
      return;
    }

    const data = (await openaiRes.json()) as { data?: Array<{ b64_json?: string }> };
    const b64 = data.data?.[0]?.b64_json;

    if (!b64) {
      sendJson(res, 502, { error: 'provider_error', message: 'OpenAI response did not include image data.' });
      return;
    }

    sendJson(res, 200, { imageDataUrl: `data:image/png;base64,${b64}`, source: 'openai' });
  } catch (err) {
    sendJson(res, 500, {
      error: 'server_error',
      message: err instanceof Error ? err.message : 'Unknown error generating image.',
    });
  }
}

async function generateWithPollinations(prompt: string, res: any, throttle: PollinationsThrottle): Promise<void> {
  const elapsed = Date.now() - throttle.getLastRequestAt();
  if (elapsed < throttle.minGapMs) {
    const retryAfterSeconds = Math.ceil((throttle.minGapMs - elapsed) / 1000);
    sendJson(res, 429, {
      error: 'rate_limited',
      message: `Free image provider allows about 1 image every 45 seconds. Retry in ${retryAfterSeconds}s.`,
      retryAfterSeconds,
    });
    return;
  }

  try {
    // Claim the slot optimistically so concurrent requests (e.g. several days'
    // images requested at once) queue behind each other instead of racing.
    throttle.setLastRequestAt(Date.now());

    const width = 1024;
    const height = 640;
    const seed = simpleHash(prompt) % 1_000_000;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}?width=${width}&height=${height}&seed=${seed}&nologo=true&nofeed=true`;

    const imgRes = await fetch(url);
    const contentType = imgRes.headers.get('content-type') ?? '';

    if (!imgRes.ok || !contentType.startsWith('image/')) {
      // Pollinations returns a JSON error body (e.g. {"error":{"code":"FREE_LIMIT", ...}})
      // when rate-limited, rather than an image — detect that explicitly so we
      // never pass a misleading "error card" image off as a real result.
      const bodyText = await imgRes.text().catch(() => '');
      let message = `Free image provider request failed (${imgRes.status}).`;
      let retryAfterSeconds: number | undefined;
      try {
        const parsed = JSON.parse(bodyText);
        if (parsed?.error?.message) message = parsed.error.message;
        const match = /retry after (\d+)s/i.exec(message);
        if (match) retryAfterSeconds = Number(match[1]);
      } catch {
        // Non-JSON error body — keep the generic message.
      }
      sendJson(res, imgRes.status === 402 ? 429 : 502, {
        error: imgRes.status === 402 ? 'rate_limited' : 'provider_error',
        message,
        retryAfterSeconds,
      });
      return;
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const base64 = buffer.toString('base64');
    sendJson(res, 200, { imageDataUrl: `data:${contentType};base64,${base64}`, source: 'pollinations' });
  } catch (err) {
    sendJson(res, 500, {
      error: 'server_error',
      message: err instanceof Error ? err.message : 'Unknown error generating image.',
    });
  }
}

function simpleHash(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function sendJson(res: any, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}
