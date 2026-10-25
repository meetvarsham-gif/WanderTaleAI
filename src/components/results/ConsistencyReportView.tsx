import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldCheck, Wand2, XCircle } from 'lucide-react';
import type { CheckStatus, ConsistencyReport, IssueSeverity } from '../../types';
import './ConsistencyReportView.css';

const STATUS_ICON: Record<CheckStatus, ReactNode> = {
  pass: <CheckCircle2 size={16} strokeWidth={1.8} />,
  warning: <AlertTriangle size={16} strokeWidth={1.8} />,
  fail: <XCircle size={16} strokeWidth={1.8} />,
  info: <Info size={16} strokeWidth={1.8} />,
};

const SEVERITY_LABEL: Record<IssueSeverity, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

interface ConsistencyReportViewProps {
  report: ConsistencyReport;
  onRequestCorrection: () => void;
}

export default function ConsistencyReportView({ report, onRequestCorrection }: ConsistencyReportViewProps) {
  return (
    <section id="consistency" className="result-section consistency">
      <div className="container">
        <div className="result-section-header">
          <span className="eyebrow">Agentic Quality Check</span>
          <h2>Consistency Report</h2>
          <p>
            An automated pass that actually re-reads the itinerary, story, scenes, and captions generated above and
            cross-checks them against each other — it is not a hardcoded result.
          </p>
        </div>

        <div className={`consistency-banner ${report.passed ? 'consistency-banner-pass' : 'consistency-banner-fail'}`}>
          <ShieldCheck size={22} strokeWidth={1.6} />
          <div>
            <strong>{report.passed ? 'Passes validation' : 'Issues found — review before trusting this trip'}</strong>
            <span>
              {report.issues.length} issue{report.issues.length === 1 ? '' : 's'} found across {report.checksPerformed.length}{' '}
              checks · last run {new Date(report.runAt).toLocaleTimeString()}
            </span>
          </div>
          {report.issues.length > 0 && (
            <button type="button" className="btn btn-sunset consistency-fix-btn" onClick={onRequestCorrection}>
              <Wand2 size={15} strokeWidth={1.8} />
              Request Correction
            </button>
          )}
        </div>

        {report.isAfterCorrection && (
          <p className="consistency-correction-note">
            {report.correctionsApplied > 0
              ? `Last correction pass fixed ${report.correctionsApplied} item${
                  report.correctionsApplied === 1 ? '' : 's'
                }, then re-ran every check above.`
              : "Correction pass ran and re-checked everything, but found no safe automatic fix for the remaining issue(s) — this can happen when a long trip has exhausted this demo's suggestion pool for the chosen interests. Try fewer days or more interests for a cleaner result."}
          </p>
        )}

        <div className="consistency-columns">
          <div className="consistency-col">
            <h4>Checks performed</h4>
            <ul className="check-list">
              {report.checksPerformed.map((check) => (
                <li key={check.id} className={`check-item check-${check.status}`}>
                  <span className="check-icon">{STATUS_ICON[check.status]}</span>
                  <div>
                    <span className="check-label">{check.label}</span>
                    <span className="check-details">{check.details}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="consistency-col">
            <h4>Issues found</h4>
            {report.issues.length === 0 ? (
              <p className="no-issues">No issues were found in this run.</p>
            ) : (
              <ul className="issue-list">
                {report.issues.map((issue) => (
                  <li key={issue.id} className="issue-item">
                    <span className={`severity-badge severity-${issue.severity}`}>{SEVERITY_LABEL[issue.severity]}</span>
                    <div>
                      <p className="issue-description">{issue.description}</p>
                      <p className="issue-correction">Suggested fix: {issue.suggestedCorrection}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <p className="consistency-limitations">
          <strong>Limitations:</strong> this checker runs explicit, rule-based text comparisons (keyword overlap,
          day-number matching, date arithmetic) — it is local-demo logic, not a language model judging meaning. It
          can miss subtler contradictions and can occasionally flag a correct passage that happens to phrase things
          differently than expected.
        </p>
      </div>
    </section>
  );
}
