import { useState } from 'react';
import { Check, Download, FileJson, FileText } from 'lucide-react';
import type { ConsistencyReport, TripResult } from '../../types';
import { buildExportJson, buildExportText, downloadTextFile } from '../../engine/exporters';
import './ExportControls.css';

interface ExportControlsProps {
  trip: TripResult;
  report: ConsistencyReport;
}

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'trip';
}

export default function ExportControls({ trip, report }: ExportControlsProps) {
  const [downloaded, setDownloaded] = useState<'json' | 'text' | null>(null);

  function handleDownload(format: 'json' | 'text') {
    const base = slug(trip.input.destination);
    try {
      if (format === 'json') {
        downloadTextFile(`wandertale-${base}.json`, buildExportJson(trip, report), 'application/json');
      } else {
        downloadTextFile(`wandertale-${base}.txt`, buildExportText(trip, report), 'text/plain');
      }
      setDownloaded(format);
      window.setTimeout(() => setDownloaded(null), 2200);
    } catch (err) {
      console.error('Export failed', err);
    }
  }

  return (
    <section id="export" className="result-section result-section-tight export-controls">
      <div className="container">
        <div className="result-section-header">
          <span className="eyebrow">Take It With You</span>
          <h2>Export Your Story</h2>
          <p>Download the full trip — itinerary, story, scenes, captions, and the consistency report.</p>
        </div>

        <div className="export-buttons">
          <button type="button" className="btn btn-secondary" onClick={() => handleDownload('json')}>
            {downloaded === 'json' ? <Check size={16} strokeWidth={1.8} /> : <FileJson size={16} strokeWidth={1.8} />}
            {downloaded === 'json' ? 'Downloaded' : 'Download JSON'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => handleDownload('text')}>
            {downloaded === 'text' ? <Check size={16} strokeWidth={1.8} /> : <FileText size={16} strokeWidth={1.8} />}
            {downloaded === 'text' ? 'Downloaded' : 'Download Plain Text'}
          </button>
        </div>
        <span className="export-hint">
          <Download size={12} strokeWidth={1.8} /> Files are generated locally in your browser — nothing is uploaded.
        </span>
      </div>
    </section>
  );
}
