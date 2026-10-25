import { useEffect, useState } from 'react';
import { Clock, ImageIcon, Loader2, RefreshCw } from 'lucide-react';
import HorizonMark from '../shared/HorizonMark';
import { getCachedImage, requestBackendImage, setCachedImage } from '../../engine/imageGeneration';

type Status = 'checking' | 'loaded' | 'rate_limited' | 'error';

const MAX_AUTO_RETRIES = 5;

interface DayImageProps {
  day: number;
  prompt: string;
  altText: string;
  variantClassName: string;
}

/**
 * Renders a real, generated travel photo for one day's scene via the
 * server-side image proxy (OpenAI if configured, otherwise the free
 * Pollinations.ai service — see vite-plugins/imageApiPlugin.ts).
 *
 * The free provider allows roughly one image every 45 seconds; when that
 * limit is hit, this shows an honest "retrying in Ns" countdown and retries
 * automatically, rather than ever presenting a placeholder as if it were a
 * real result.
 */
export default function DayImage({ day, prompt, altText, variantClassName }: DayImageProps) {
  const [status, setStatus] = useState<Status>('checking');
  const [src, setSrc] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [autoRetryCount, setAutoRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('checking');
    setSrc(null);
    setSecondsLeft(null);

    async function run() {
      const cached = getCachedImage(prompt);
      if (cached) {
        if (!cancelled) {
          setSrc(cached);
          setStatus('loaded');
        }
        return;
      }

      const outcome = await requestBackendImage(prompt);
      if (cancelled) return;

      if (outcome.status === 'ok') {
        setCachedImage(prompt, outcome.imageDataUrl);
        setSrc(outcome.imageDataUrl);
        setStatus('loaded');
        setAutoRetryCount(0);
        return;
      }

      if (outcome.status === 'rate_limited') {
        setMessage(outcome.message);
        setStatus('rate_limited');
        setSecondsLeft(outcome.retryAfterSeconds ?? 20);
        return;
      }

      setMessage(outcome.message);
      setStatus('error');
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [prompt, attempt]);

  // Countdown + bounded auto-retry while rate-limited.
  useEffect(() => {
    if (status !== 'rate_limited' || secondsLeft === null) return;

    if (secondsLeft <= 0) {
      if (autoRetryCount < MAX_AUTO_RETRIES) {
        setAutoRetryCount((c) => c + 1);
        setAttempt((a) => a + 1);
      }
      return;
    }

    const id = window.setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [status, secondsLeft, autoRetryCount]);

  const canManuallyRetry = status === 'error' || (status === 'rate_limited' && autoRetryCount >= MAX_AUTO_RETRIES);

  function handleRetry() {
    setAutoRetryCount(0);
    setAttempt((a) => a + 1);
  }

  return (
    <div className={`scene-visual-placeholder ${variantClassName}`}>
      {src && status === 'loaded' && (
        <img src={src} alt={altText} className="scene-visual-img scene-visual-img-visible" loading="lazy" />
      )}

      {status !== 'loaded' && <HorizonMark className="scene-visual-mark" />}

      {status === 'checking' && (
        <span className="scene-visual-label">
          <Loader2 size={13} strokeWidth={1.8} className="scene-visual-spin" />
          Generating image…
        </span>
      )}

      {status === 'rate_limited' && (
        <span className="scene-visual-label scene-visual-label-error">
          <Clock size={13} strokeWidth={1.8} />
          {canManuallyRetry ? 'Free image limit reached' : `Free limit reached — retrying in ${secondsLeft}s`}
          {canManuallyRetry && (
            <button type="button" className="scene-visual-retry" onClick={handleRetry}>
              <RefreshCw size={12} strokeWidth={2} />
              Retry
            </button>
          )}
        </span>
      )}

      {status === 'error' && (
        <span className="scene-visual-label scene-visual-label-error" title={message}>
          <ImageIcon size={13} strokeWidth={1.8} />
          Image unavailable
          <button type="button" className="scene-visual-retry" onClick={handleRetry}>
            <RefreshCw size={12} strokeWidth={2} />
            Retry
          </button>
        </span>
      )}

      <span className="scene-visual-day">Day {day}</span>
    </div>
  );
}
