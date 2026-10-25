import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import type { TripResult } from '../../types';
import type { useNarration } from '../../hooks/useNarration';
import './NarrationPanel.css';

interface NarrationPanelProps {
  trip: TripResult;
  narration: ReturnType<typeof useNarration>;
}

export default function NarrationPanel({ trip, narration }: NarrationPanelProps) {
  const fullText = trip.story.map((s) => `Day ${s.day}. ${s.text}`).join(' ... ');
  const isFullPlaying = narration.isPlaying && narration.activeText === fullText;

  return (
    <section id="narration" className="result-section narration-panel">
      <div className="container">
        <div className="result-section-header">
          <span className="eyebrow">Hear It</span>
          <h2>Audio Narration</h2>
          <p>
            Narration is read directly from your story text using your browser's built-in speech synthesis — no
            paid audio API involved.
          </p>
        </div>

        {narration.support === 'unsupported' ? (
          <div className="narration-unsupported">
            <VolumeX size={18} strokeWidth={1.7} />
            <p>
              This browser doesn't support speech synthesis, so narration playback isn't available here. The story
              text itself is still fully readable above, and export files include the full script.
            </p>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-primary narration-play-all"
              onClick={() => (isFullPlaying ? narration.stop() : narration.play(fullText))}
            >
              {isFullPlaying ? <Pause size={16} strokeWidth={1.8} /> : <Volume2 size={16} strokeWidth={1.8} />}
              {isFullPlaying ? 'Stop Narration' : 'Play Entire Story'}
            </button>

            <ul className="narration-day-list">
              {trip.story.map((s) => {
                const isThisPlaying = narration.isPlaying && narration.activeText === s.text;
                return (
                  <li key={s.day} className="narration-day-row">
                    <span className="narration-day-label">
                      Day {s.day} — {s.title}
                    </span>
                    <button
                      type="button"
                      className="btn-ghost narration-row-btn"
                      onClick={() => (isThisPlaying ? narration.stop() : narration.play(s.text))}
                    >
                      {isThisPlaying ? <Pause size={15} strokeWidth={1.8} /> : <Play size={15} strokeWidth={1.8} />}
                      {isThisPlaying ? 'Stop' : 'Play'}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
