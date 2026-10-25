import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import type { TripResult } from '../../types';
import type { useNarration } from '../../hooks/useNarration';
import './StoryReader.css';

interface StoryReaderProps {
  trip: TripResult;
  narration: ReturnType<typeof useNarration>;
}

export default function StoryReader({ trip, narration }: StoryReaderProps) {
  const [activeDay, setActiveDay] = useState(1);
  const story = trip.story.find((s) => s.day === activeDay) ?? trip.story[0];
  const isActiveDayPlaying = narration.isPlaying && narration.activeText === story?.text;

  return (
    <section id="story" className="result-section story-reader">
      <div className="container">
        <div className="result-section-header">
          <span className="eyebrow">The Narrative</span>
          <h2>Your Travel Story</h2>
          <p>
            Written to follow the itinerary exactly, day by day — a preview of how this trip could feel, not a
            record of something that already happened.
          </p>
        </div>

        <div className="story-day-tabs" role="tablist" aria-label="Select a day to read">
          {trip.story.map((s) => (
            <button
              key={s.day}
              type="button"
              role="tab"
              aria-selected={s.day === activeDay}
              className={`story-tab ${s.day === activeDay ? 'story-tab-active' : ''}`}
              onClick={() => setActiveDay(s.day)}
            >
              Day {s.day}
            </button>
          ))}
        </div>

        {story && (
          <article className="story-page">
            <div className="story-page-header">
              <h3>{story.title}</h3>
              {narration.support === 'supported' && (
                <button
                  type="button"
                  className="btn btn-secondary story-listen-btn"
                  onClick={() => (isActiveDayPlaying ? narration.stop() : narration.play(story.text))}
                >
                  {isActiveDayPlaying ? <Pause size={15} strokeWidth={1.8} /> : <Play size={15} strokeWidth={1.8} />}
                  {isActiveDayPlaying ? 'Stop' : 'Listen'}
                </button>
              )}
            </div>
            <p className="story-page-text">{story.text}</p>
          </article>
        )}
      </div>
    </section>
  );
}
