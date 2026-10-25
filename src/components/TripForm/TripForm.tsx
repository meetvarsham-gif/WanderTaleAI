import { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import type { InterestTag, TravelStyle, TripInput } from '../../types';
import { INTEREST_OPTIONS, TRAVEL_STYLES } from '../../types';
import { validateTripInput } from '../../engine/validation';
import { SAMPLE_TRIP_INPUT } from '../../engine/sampleTrip';
import './TripForm.css';

interface TripFormProps {
  isGenerating: boolean;
  generationError: string | null;
  onGenerate: (input: TripInput) => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR'];

const EMPTY_FORM: TripInput = {
  destination: '',
  durationDays: 5,
  startDate: '',
  travelers: 2,
  budget: undefined,
  currency: 'USD',
  interests: [],
  travelStyle: 'balanced',
  preferences: '',
};

export default function TripForm({ isGenerating, generationError, onGenerate }: TripFormProps) {
  const [form, setForm] = useState<TripInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof TripInput, string>>>({});

  function update<K extends keyof TripInput>(key: K, value: TripInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleInterest(tag: InterestTag) {
    setForm((prev) => {
      const has = prev.interests.includes(tag);
      return {
        ...prev,
        interests: has ? prev.interests.filter((t) => t !== tag) : [...prev.interests, tag],
      };
    });
  }

  function handleUseSample() {
    setForm(SAMPLE_TRIP_INPUT);
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { valid, errors: nextErrors } = validateTripInput(form);
    setErrors(nextErrors);
    if (!valid) return;

    onGenerate({
      ...form,
      destination: form.destination.trim(),
      startDate: form.startDate ? form.startDate : undefined,
      preferences: form.preferences?.trim() || undefined,
      budget: form.budget || undefined,
    });
  }

  return (
    <div className="trip-form-wrap">
      <div className="trip-form-heading">
        <span className="eyebrow">Plan the trip</span>
        <h2>Tell us where the story begins.</h2>
        <button type="button" className="btn-ghost sample-btn" onClick={handleUseSample}>
          <Wand2 size={15} strokeWidth={1.6} />
          Use a sample trip instead
        </button>
      </div>

      {generationError && <div className="form-banner form-banner-error">{generationError}</div>}

      <form className="trip-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="field field-span-2">
            <label htmlFor="destination">Destination</label>
            <input
              id="destination"
              type="text"
              placeholder="e.g. Lisbon, Portugal"
              value={form.destination}
              onChange={(e) => update('destination', e.target.value)}
            />
            {errors.destination && <span className="field-error">{errors.destination}</span>}
          </div>

          <div className="field">
            <label htmlFor="duration">Trip duration (days)</label>
            <input
              id="duration"
              type="number"
              min={1}
              max={21}
              value={form.durationDays}
              onChange={(e) => update('durationDays', Number(e.target.value))}
            />
            {errors.durationDays && <span className="field-error">{errors.durationDays}</span>}
          </div>

          <div className="field">
            <label htmlFor="startDate">Starting date (optional)</label>
            <input
              id="startDate"
              type="date"
              value={form.startDate ?? ''}
              onChange={(e) => update('startDate', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="travelers">Travellers</label>
            <input
              id="travelers"
              type="number"
              min={1}
              max={20}
              value={form.travelers}
              onChange={(e) => update('travelers', Number(e.target.value))}
            />
            {errors.travelers && <span className="field-error">{errors.travelers}</span>}
          </div>

          <div className="field field-budget">
            <label htmlFor="budget">Budget (optional)</label>
            <div className="budget-row">
              <input
                id="budget"
                type="number"
                min={0}
                placeholder="e.g. 2000"
                value={form.budget ?? ''}
                onChange={(e) => update('budget', e.target.value ? Number(e.target.value) : undefined)}
              />
              <select value={form.currency} onChange={(e) => update('currency', e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {errors.budget && <span className="field-error">{errors.budget}</span>}
          </div>

          <div className="field field-span-2">
            <label>Travel interests</label>
            <div className="interest-grid">
              {INTEREST_OPTIONS.map((opt) => {
                const active = form.interests.includes(opt.tag);
                return (
                  <button
                    key={opt.tag}
                    type="button"
                    className={`interest-chip ${active ? 'interest-chip-active' : ''}`}
                    onClick={() => toggleInterest(opt.tag)}
                    aria-pressed={active}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <span className="field-hint">Optional — leave blank for a balanced mix of culture, food, and nature.</span>
          </div>

          <div className="field field-span-2">
            <label>Travel style</label>
            <div className="style-grid">
              {TRAVEL_STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={`style-chip ${form.travelStyle === s.value ? 'style-chip-active' : ''}`}
                  onClick={() => update('travelStyle', s.value as TravelStyle)}
                  aria-pressed={form.travelStyle === s.value}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {errors.travelStyle && <span className="field-error">{errors.travelStyle}</span>}
          </div>

          <div className="field field-span-2">
            <label htmlFor="preferences">Anything else worth knowing? (optional)</label>
            <textarea
              id="preferences"
              rows={3}
              placeholder="e.g. travelling with kids, prefer early mornings, avoid long transit days..."
              value={form.preferences}
              onChange={(e) => update('preferences', e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isGenerating}>
            <Sparkles size={16} strokeWidth={1.8} />
            {isGenerating ? 'Weaving your story…' : 'Generate My Story'}
          </button>
          <span className="form-mode-note">Runs entirely in local demo mode — no account or payment required.</span>
        </div>
      </form>
    </div>
  );
}
