import type { Connect, Plugin, ViteDevServer, PreviewServer } from 'vite';

interface ImageApiPluginOptions {
  apiKey: string | undefined;
}

/**
 * Dev/preview-server-only middleware that proxies image generation to OpenAI's
 * Images API. The API key is read from server-side process env (via Vite's
 * `loadEnv`) and never passed to client code, so it can never end up in the
 * browser bundle. If no key is configured, it responds with a clear
 * "not_configured" error so the frontend can fall back to the free,
 * keyless Pollinations.ai image service instead of pretending to succeed.
 */
export function imageApiPlugin({ apiKey }: ImageApiPluginOptions): Plugin {
  const handler: Connect.NextHandleFunction = (req, res) => {
    void handleRequest(req, res, apiKey);
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

async function handleRequest(req: any, res: any, apiKey: string | undefined): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'method_not_allowed' }));
    return;
  }

  if (!apiKey) {
    res.statusCode = 501;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'not_configured',
        message: 'OPENAI_API_KEY is not set on the server. Falling back to the free image provider.',
      })
    );
    return;
  }

  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const raw = Buffer.concat(chunks).toString('utf-8');
    const body = raw ? JSON.parse(raw) : {};
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 900) : '';

    if (!prompt) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'invalid_request', message: 'A non-empty "prompt" string is required.' }));
      return;
    }

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
      res.statusCode = openaiRes.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'provider_error',
          message: `OpenAI image request failed (${openaiRes.status}): ${errBody.slice(0, 300)}`,
        })
      );
      return;
    }

    const data = (await openaiRes.json()) as { data?: Array<{ b64_json?: string }> };
    const b64 = data.data?.[0]?.b64_json;

    if (!b64) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'provider_error', message: 'OpenAI response did not include image data.' }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ imageDataUrl: `data:image/png;base64,${b64}`, source: 'openai' }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'server_error',
        message: err instanceof Error ? err.message : 'Unknown error generating image.',
      })
    );
  }
}
