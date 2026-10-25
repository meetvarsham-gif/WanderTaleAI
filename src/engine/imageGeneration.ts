import { hashString } from './seed';

export type ImageSource = 'openai' | 'pollinations';

const CACHE_PREFIX = 'wandertale-img-v1-';
const BACKEND_TIMEOUT_MS = 30000;

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

/** A free, keyless, real text-to-image service used when no paid API key is configured. */
export function pollinationsUrlFor(prompt: string, width = 1024, height = 640): string {
  const seed = hashString(prompt) % 1_000_000;
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&nofeed=true`;
}

export interface BackendImageResult {
  imageDataUrl: string;
}

export type BackendImageOutcome =
  | { status: 'ok'; imageDataUrl: string }
  | { status: 'not_configured' }
  | { status: 'error'; message: string };

/**
 * Attempts to generate an image via the server-side OpenAI proxy
 * (vite-plugins/imageApiPlugin.ts). Returns `not_configured` when no
 * OPENAI_API_KEY is set server-side, so the caller can fall back to the free
 * Pollinations provider instead of showing a fake success.
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

    if (res.status === 501) {
      return { status: 'not_configured' };
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: `Request failed with status ${res.status}` }));
      return { status: 'error', message: body.message ?? `Image request failed (${res.status}).` };
    }

    const body = (await res.json()) as BackendImageResult;
    if (!body.imageDataUrl) {
      return { status: 'error', message: 'Server response did not include image data.' };
    }
    return { status: 'ok', imageDataUrl: body.imageDataUrl };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { status: 'error', message: 'Image generation timed out.' };
    }
    // In production (no dev/preview middleware), or if the route simply
    // doesn't exist, this is the expected path — treat it the same as
    // "not configured" rather than surfacing a scary network error.
    return { status: 'not_configured' };
  } finally {
    window.clearTimeout(timeout);
  }
}
