import { Clock, MapPin } from 'lucide-react';
import type { TripResult } from '../../types';
import './ItineraryTimeline.css';

function formatDate(date?: string): string | null {
  if (!date) return null;
  return new Date(date + 'T00:00:00Z').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function ItineraryTimeline({ trip }: { trip: TripResult }) {
  return (
    <section id="itinerary" className="result-section itinerary">
      <div className="container">
        <div className="result-section-header">
          <span className="eyebrow">Day by Day</span>
          <h2>The Itinerary</h2>
          <p>
            A suggested structure for each day — not confirmed bookings. Opening hours, prices, and availability
            should be verified closer to your trip.
          </p>
        </div>

        <div className="timeline">
          {trip.itinerary.map((day) => {
            const formattedDate = formatDate(day.date);
            return (
              <article key={day.day} className="timeline-day">
                <div className="timeline-marker">
                  <span className="timeline-day-number">{day.day}</span>
                  <span className="timeline-line" aria-hidden="true" />
                </div>

                <div className="timeline-content">
                  <header className="timeline-day-header">
                    <h3>
                      Day {day.day}
                      {formattedDate ? ` · ${formattedDate}` : ''}
                    </h3>
                    <span className="pill timeline-theme">{day.theme}</span>
                  </header>

                  <ol className="activity-list">
                    {day.activities.map((activity) => (
                      <li key={activity.id} className="activity-item">
                        <div className="activity-time">
                          <Clock size={14} strokeWidth={1.8} />
                          {activity.time}
                        </div>
                        <div className="activity-body">
                          <h4>{activity.title}</h4>
                          <span className="activity-location">
                            <MapPin size={13} strokeWidth={1.8} />
                            {activity.location}
                          </span>
                          <p>{activity.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <p className="timeline-note">{day.travelNote}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
