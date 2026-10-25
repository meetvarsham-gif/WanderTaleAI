import { Compass, Feather, Volume2 } from 'lucide-react';
import type { TripInput } from '../../types';
import HorizonMark from '../shared/HorizonMark';
import TripForm from '../TripForm/TripForm';
import './Landing.css';

interface LandingProps {
  isGenerating: boolean;
  generationError: string | null;
  onGenerate: (input: TripInput) => void;
}

export default function Landing({ isGenerating, generationError, onGenerate }: LandingProps) {
  return (
    <div className="landing">
      <header className="landing-topbar">
        <div className="container landing-topbar-inner">
          <span className="brand-mark">WanderTale <em>AI</em></span>
          <span className="landing-topbar-mode">Local Demo Mode</span>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Intelligent Travel Story Generator</span>
            <h1 className="hero-title">
              Every journey
              <br />
              deserves a story.
            </h1>
            <p className="hero-sub">
              Describe a trip. WanderTale AI builds a day-by-day itinerary, a personal travel narrative, visual
              scenes with captions, and spoken narration — then checks its own work for consistency before handing
              it to you.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#plan">
                Start Your Story
              </a>
              <a className="btn btn-secondary" href="#how-it-works">
                How it works
              </a>
            </div>
          </div>

          <div className="hero-panel">
            <HorizonMark className="hero-mark" />
            <div className="hero-panel-content">
              <p className="hero-panel-quote">
                "The kind of trip you'd actually want to read about afterward — not just a list of places."
              </p>
              <div className="hero-panel-tags">
                <span className="pill">Itinerary</span>
                <span className="pill">Narrative</span>
                <span className="pill">Scenes</span>
                <span className="pill">Narration</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how">
        <div className="container how-grid">
          <div className="how-item">
            <Compass size={22} strokeWidth={1.4} />
            <h3>Plan</h3>
            <p>Tell WanderTale where you're going, for how long, and what you love. Nothing is assumed.</p>
          </div>
          <div className="how-item">
            <Feather size={22} strokeWidth={1.4} />
            <h3>Write</h3>
            <p>
              A day-by-day itinerary and a matching narrative are generated together, so they never contradict each
              other.
            </p>
          </div>
          <div className="how-item">
            <Volume2 size={22} strokeWidth={1.4} />
            <h3>Hear & Verify</h3>
            <p>Play your story aloud, then watch an automated check inspect every section for consistency.</p>
          </div>
        </div>
      </section>

      <section id="plan" className="plan-section">
        <div className="container">
          <TripForm isGenerating={isGenerating} generationError={generationError} onGenerate={onGenerate} />
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container landing-footer-inner">
          <span>WanderTale AI — a local-demo prototype. No account, no paid API, no data leaves your browser.</span>
        </div>
      </footer>
    </div>
  );
}
