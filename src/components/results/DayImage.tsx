import { useEffect, useState } from 'react';
import { ImageIcon, Loader2, RefreshCw } from 'lucide-react';
import HorizonMark from '../shared/HorizonMark';
import { getCachedImage, pollinationsUrlFor, requestBackendImage, setCachedImage } from '../../engine/imageGeneration';

type Status = 'checking' | 'loading' | 'loaded' | 'error';

interface DayImageProps {
  day: number;
  prompt: string;
  altText: string;
  variantClassName: string;
}

/**
 * Renders a real, generated travel photo for one day's scene.
 *
 * Tries the server-side OpenAI proxy first (only available if OPENAI_API_KEY
 * is configured — see vite-plugins/imageApiPlugin.ts); if that isn't
 * configured or fails, falls back to Pollinations.ai, a free, keyless
 * image-generation service, so a real photo is still produced either way.
 * Never shows a placeholder as if it were a real result.
 */
export default function DayImage({ day, prompt, altText, variantClassName }: DayImageProps) {
  const [status, setStatus] = useState<Status>('checking');
  const [src, setSrc] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('checking');
    setSrc(null);

    async function run() {
      const cached = getCachedImage(prompt);
      if (cached) {
        if (!cancelled) {
          setSrc(cached);
          setStatus('loaded');
        }
        return;
      }

      const backendResult = await requestBackendImage(prompt);
      if (cancelled) return;

      if (backendResult.status === 'ok') {
        setCachedImage(prompt, backendResult.imageDataUrl);
        setSrc(backendResult.imageDataUrl);
        setStatus('loaded');
        return;
      }

      // Whether the backend was simply not configured or hit an error, fall
      // back to the free provider — a real image is still generated either way.
      setSrc(pollinationsUrlFor(prompt));
      setStatus('loading');
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [prompt, attempt]);

  return (
    <div className={`scene-visual-placeholder ${variantClassName}`}>
      {src && status !== 'error' && (
        <img
          key={src}
          src={src}
          alt={altText}
          className={`scene-visual-img ${status === 'loaded' ? 'scene-visual-img-visible' : ''}`}
          loading="lazy"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}

      {status !== 'loaded' && <HorizonMark className="scene-visual-mark" />}

      {(status === 'checking' || status === 'loading') && (
        <span className="scene-visual-label">
          <Loader2 size={13} strokeWidth={1.8} className="scene-visual-spin" />
          Generating image…
        </span>
      )}

      {status === 'error' && (
        <span className="scene-visual-label scene-visual-label-error">
          <ImageIcon size={13} strokeWidth={1.8} />
          Image unavailable
          <button type="button" className="scene-visual-retry" onClick={() => setAttempt((a) => a + 1)}>
            <RefreshCw size={12} strokeWidth={2} />
            Retry
          </button>
        </span>
      )}

      <span className="scene-visual-day">Day {day}</span>
    </div>
  );
}
