import { CalendarDays, MapPin, Users, Wallet } from 'lucide-react';
import type { TripResult } from '../../types';
import HorizonMark from '../shared/HorizonMark';
import './DestinationHero.css';

function formatDateRange(trip: TripResult): string | null {
  const first = trip.itinerary[0]?.date;
  const last = trip.itinerary[trip.itinerary.length - 1]?.date;
  if (!first || !last) return null;
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const start = new Date(first + 'T00:00:00Z').toLocaleDateString(undefined, opts);
  const end = new Date(last + 'T00:00:00Z').toLocaleDateString(undefined, { ...opts, year: 'numeric' });
  return `${start} – ${end}`;
}

export default function DestinationHero({ trip }: { trip: TripResult }) {
  const dateRange = formatDateRange(trip);

  return (
    <section id="hero" className="dest-hero">
      <HorizonMark className="dest-hero-mark" />
      <div className="container dest-hero-inner">
        <span className="eyebrow dest-hero-eyebrow">Your Story</span>
        <h1 className="dest-hero-title">{trip.input.destination}</h1>
        <p className="dest-hero-summary">{trip.destinationSummary}</p>

        <div className="dest-hero-meta">
          <span className="dest-hero-meta-item">
            <CalendarDays size={16} strokeWidth={1.6} />
            {dateRange ?? `${trip.input.durationDays} day${trip.input.durationDays > 1 ? 's' : ''}`}
          </span>
          <span className="dest-hero-meta-item">
            <Users size={16} strokeWidth={1.6} />
            {trip.input.travelers} traveller{trip.input.travelers > 1 ? 's' : ''}
          </span>
          {trip.input.budget && (
            <span className="dest-hero-meta-item">
              <Wallet size={16} strokeWidth={1.6} />
              {trip.input.budget.toLocaleString()} {trip.input.currency}
            </span>
          )}
          <span className="dest-hero-meta-item">
            <MapPin size={16} strokeWidth={1.6} />
            {trip.input.travelStyle.replace('-', ' ')}
          </span>
        </div>
      </div>
    </section>
  );
}
