import { hashString } from './seed';

const CACHE_PREFIX = 'wandertale-img-v2-';
const BACKEND_TIMEOUT_MS = 45000;

function cacheKeyFor(prompt: string): string {
  return `${CACHE_PREFIX}${hashString(prompt)}`;
}

export function getCachedImage(prompt: string): string | null {
  try {
    return window.localStorage.getItem(cacheKeyFor(prompt));
  } catch {
    return null;
  }
}

export function setCachedImage(prompt: string, dataUrl: string): void {
  try {
    window.localStorage.setItem(cacheKeyFor(prompt), dataUrl);
  } catch {
    // Storage full or unavailable (e.g. private browsing) — generation still
    // works, it just won't be cached for next time.
  }
}

export type BackendImageOutcome =
  | { status: 'ok'; imageDataUrl: string }
  | { status: 'rate_limited'; message: string; retryAfterSeconds?: number }
  | { status: 'error'; message: string };

/**
 * Requests one day's photo from the server-side image proxy
 * (vite-plugins/imageApiPlugin.ts), which generates it via OpenAI when
 * OPENAI_API_KEY is configured, or via the free Pollinations.ai service
 * otherwise. Both providers are called server-side so a real result (or a
 * real, specific error) always comes back — never a placeholder presented as
 * a success.
 */
export async function requestBackendImage(prompt: string): Promise<BackendImageOutcome> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

  try {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });

    const body = await res.json().catch(() => ({}));

    if (res.ok && body.imageDataUrl) {
      return { status: 'ok', imageDataUrl: body.imageDataUrl };
    }

    if (res.status === 429 || body.error === 'rate_limited') {
      return {
        status: 'rate_limited',
        message: body.message ?? 'Free image provider rate limit reached.',
        retryAfterSeconds: body.retryAfterSeconds,
      };
    }

    return { status: 'error', message: body.message ?? `Image request failed (${res.status}).` };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { status: 'error', message: 'Image generation timed out.' };
    }
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Could not reach the image generation server.',
    };
  } finally {
    window.clearTimeout(timeout);
  }
}
