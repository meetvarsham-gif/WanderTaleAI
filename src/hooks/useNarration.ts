import { useCallback, useEffect, useRef, useState } from 'react';

export type NarrationSupport = 'supported' | 'unsupported';

interface UseNarrationResult {
  support: NarrationSupport;
  isPlaying: boolean;
  activeText: string | null;
  play: (text: string) => void;
  stop: () => void;
}

/**
 * Thin wrapper around the browser's native SpeechSynthesis API (free, no API key).
 * Falls back gracefully by reporting `support: 'unsupported'` so the UI can hide or
 * disable narration controls instead of showing a fake player.
 */
export function useNarration(): UseNarrationResult {
  const support: NarrationSupport = typeof window !== 'undefined' && 'speechSynthesis' in window ? 'supported' : 'unsupported';
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeText, setActiveText] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (support === 'unsupported') return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setActiveText(null);
  }, [support]);

  const play = useCallback(
    (text: string) => {
      if (support === 'unsupported') return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.98;
      utterance.pitch = 1;
      utterance.onend = () => {
        setIsPlaying(false);
        setActiveText(null);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        setActiveText(null);
      };

      utteranceRef.current = utterance;
      setActiveText(text);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    },
    [support]
  );

  useEffect(() => {
    return () => {
      if (support === 'supported') {
        window.speechSynthesis.cancel();
      }
    };
  }, [support]);

  return { support, isPlaying, activeText, play, stop };
}
