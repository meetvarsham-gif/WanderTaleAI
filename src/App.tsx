import { useCallback, useState } from 'react';
import type { ConsistencyReport, TripInput, TripResult } from './types';
import { generateTrip } from './engine/tripGenerator';
import { runConsistencyChecks } from './engine/consistencyChecker';
import { applyCorrections } from './engine/correction';
import Landing from './components/Landing/Landing';
import ResultsView from './components/results/ResultsView';
import './App.css';

type Stage = 'plan' | 'generating' | 'results';

function App() {
  const [stage, setStage] = useState<Stage>('plan');
  const [trip, setTrip] = useState<TripResult | null>(null);
  const [report, setReport] = useState<ConsistencyReport | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleGenerate = useCallback((input: TripInput) => {
    setStage('generating');
    setGenerationError(null);

    // A brief, honestly-labelled delay so the UI can show generation progress.
    // The underlying work is a local, rule-based generator — not a real AI call.
    window.setTimeout(() => {
      try {
        const nextTrip = generateTrip(input);
        const nextReport = runConsistencyChecks(nextTrip);
        setTrip(nextTrip);
        setReport(nextReport);
        setStage('results');
      } catch (err) {
        console.error(err);
        setGenerationError(
          'Something went wrong while generating this trip. Please adjust your inputs and try again.'
        );
        setStage('plan');
      }
    }, 650);
  }, []);

  const handleRequestCorrection = useCallback(() => {
    setTrip((currentTrip) => {
      if (!currentTrip || !report) return currentTrip;
      const { trip: correctedTrip, appliedCount } = applyCorrections(currentTrip, report.issues);
      const nextReport = runConsistencyChecks(correctedTrip);
      nextReport.correctionsApplied = appliedCount;
      nextReport.isAfterCorrection = true;
      setReport(nextReport);
      return correctedTrip;
    });
  }, [report]);

  const handleNewTrip = useCallback(() => {
    setTrip(null);
    setReport(null);
    setGenerationError(null);
    setStage('plan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (stage === 'results' && trip && report) {
    return <ResultsView trip={trip} report={report} onRequestCorrection={handleRequestCorrection} onNewTrip={handleNewTrip} />;
  }

  return (
    <Landing
      isGenerating={stage === 'generating'}
      generationError={generationError}
      onGenerate={handleGenerate}
    />
  );
}

export default App;
