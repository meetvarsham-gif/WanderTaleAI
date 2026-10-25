import { MessageSquareQuote } from 'lucide-react';
import type { TripResult } from '../../types';
import DayImage from './DayImage';
import './SceneGallery.css';

const PANEL_VARIANTS = ['variant-a', 'variant-b', 'variant-c'];

export default function SceneGallery({ trip }: { trip: TripResult }) {
  return (
    <section id="scenes" className="result-section scene-gallery">
      <div className="container">
        <div className="result-section-header">
          <span className="eyebrow">Visual Scenes</span>
          <h2>Scenes &amp; Captions</h2>
          <p>
            A visual description and image-generation prompt for each day, plus a matching caption and a real,
            generated photo for that day's scene.
          </p>
        </div>

        <div className="scene-grid">
          {trip.scenes.map((scene, idx) => (
            <article key={scene.day} className="scene-card">
              <DayImage
                day={scene.day}
                prompt={scene.imagePrompt}
                altText={scene.sceneDescription}
                variantClassName={PANEL_VARIANTS[idx % PANEL_VARIANTS.length]}
              />

              <div className="scene-card-body">
                <h4>Scene description</h4>
                <p className="scene-description">{scene.sceneDescription}</p>

                <h4>Image-generation prompt</h4>
                <p className="scene-prompt">{scene.imagePrompt}</p>

                <div className="scene-caption">
                  <MessageSquareQuote size={15} strokeWidth={1.7} />
                  <p>{scene.caption}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
