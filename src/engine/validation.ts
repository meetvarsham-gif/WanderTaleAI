import type { TripInput } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof TripInput, string>>;
}

export function validateTripInput(input: Partial<TripInput>): ValidationResult {
  const errors: Partial<Record<keyof TripInput, string>> = {};

  if (!input.destination || !input.destination.trim()) {
    errors.destination = 'Tell us where this story takes place.';
  } else if (input.destination.trim().length < 2) {
    errors.destination = 'Destination name looks too short.';
  }

  if (!input.durationDays || Number.isNaN(input.durationDays)) {
    errors.durationDays = 'Trip duration is required.';
  } else if (input.durationDays < 1) {
    errors.durationDays = 'A trip needs at least 1 day.';
  } else if (input.durationDays > 21) {
    errors.durationDays = 'Keep it to 21 days or fewer for this preview.';
  }

  if (!input.travelers || Number.isNaN(input.travelers)) {
    errors.travelers = 'Let us know how many travellers.';
  } else if (input.travelers < 1) {
    errors.travelers = 'At least one traveller is required.';
  } else if (input.travelers > 20) {
    errors.travelers = 'For groups over 20, treat this as a rough starting point.';
  }

  if (input.budget !== undefined && input.budget !== null) {
    if (Number.isNaN(input.budget) || input.budget < 0) {
      errors.budget = 'Budget should be a positive number.';
    }
  }

  if (!input.currency || !input.currency.trim()) {
    errors.currency = 'Choose a currency.';
  }

  if (!input.travelStyle) {
    errors.travelStyle = 'Pick a travel style.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
