import type { ConsistencyReport, TripResult } from '../../types';
import { useNarration } from '../../hooks/useNarration';
import SectionNav from '../shared/SectionNav';
import DestinationHero from './DestinationHero';
import TripOverview from './TripOverview';
import ItineraryTimeline from './ItineraryTimeline';
import StoryReader from './StoryReader';
import SceneGallery from './SceneGallery';
import NarrationPanel from './NarrationPanel';
import ConsistencyReportView from './ConsistencyReportView';
import ExportControls from './ExportControls';
import './ResultsView.css';

interface ResultsViewProps {
  trip: TripResult;
  report: ConsistencyReport;
  onRequestCorrection: () => void;
  onNewTrip: () => void;
}

export default function ResultsView({ trip, report, onRequestCorrection, onNewTrip }: ResultsViewProps) {
  const narration = useNarration();

  return (
    <div className="results-view">
      <header className="results-topbar">
        <div className="container results-topbar-inner">
          <span className="brand-mark">WanderTale <em>AI</em></span>
          <button type="button" className="btn btn-secondary" onClick={onNewTrip}>
            Plan Another Trip
          </button>
        </div>
      </header>

      <SectionNav />

      <main>
        <DestinationHero trip={trip} />
        <TripOverview trip={trip} />
        <ItineraryTimeline trip={trip} />
        <StoryReader trip={trip} narration={narration} />
        <SceneGallery trip={trip} />
        <NarrationPanel trip={trip} narration={narration} />
        <ConsistencyReportView report={report} onRequestCorrection={onRequestCorrection} />
        <ExportControls trip={trip} report={report} />
      </main>
    </div>
  );
}
