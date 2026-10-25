// Core domain types shared across the generation engine, consistency checker, and UI.

export type InterestTag =
  | 'food'
  | 'culture'
  | 'nature'
  | 'adventure'
  | 'art'
  | 'nightlife'
  | 'relaxation'
  | 'shopping'
  | 'photography'
  | 'history';

export interface InterestOption {
  tag: InterestTag;
  label: string;
}

export const INTEREST_OPTIONS: InterestOption[] = [
  { tag: 'food', label: 'Food & Cuisine' },
  { tag: 'culture', label: 'Culture & Heritage' },
  { tag: 'nature', label: 'Nature & Outdoors' },
  { tag: 'adventure', label: 'Adventure & Activity' },
  { tag: 'art', label: 'Art & Design' },
  { tag: 'nightlife', label: 'Nightlife & Entertainment' },
  { tag: 'relaxation', label: 'Relaxation & Wellness' },
  { tag: 'shopping', label: 'Shopping & Markets' },
  { tag: 'photography', label: 'Photography & Scenery' },
  { tag: 'history', label: 'History & Museums' },
];

export type TravelStyle = 'relaxed' | 'balanced' | 'fast-paced' | 'luxury' | 'budget' | 'adventurous';

export const TRAVEL_STYLES: { value: TravelStyle; label: string }[] = [
  { value: 'relaxed', label: 'Relaxed & Unhurried' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'fast-paced', label: 'Fast-Paced & Packed' },
  { value: 'luxury', label: 'Luxury & Indulgent' },
  { value: 'budget', label: 'Budget-Conscious' },
  { value: 'adventurous', label: 'Adventurous & Off-Beat' },
];

export interface TripInput {
  destination: string;
  durationDays: number;
  startDate?: string; // ISO date, optional
  travelers: number;
  budget?: number;
  currency: string;
  interests: InterestTag[];
  travelStyle: TravelStyle;
  preferences?: string;
}

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening';

export interface ItineraryActivity {
  id: string;
  time: TimeOfDay;
  title: string;
  location: string;
  description: string;
  tag: InterestTag;
}

export interface ItineraryDay {
  day: number;
  date?: string; // ISO date, present only if startDate was known
  theme: string;
  activities: ItineraryActivity[];
  travelNote: string;
}

export interface StoryDay {
  day: number;
  title: string;
  text: string;
}

export interface SceneDay {
  day: number;
  sceneDescription: string;
  imagePrompt: string;
  caption: string;
}

export type GenerationMode = 'local-demo';

export interface TripResult {
  input: TripInput;
  generatedAt: string;
  destinationSummary: string;
  itinerary: ItineraryDay[];
  story: StoryDay[];
  scenes: SceneDay[];
  mode: GenerationMode;
}

export type CheckStatus = 'pass' | 'warning' | 'fail' | 'info';

export interface ConsistencyCheck {
  id: string;
  label: string;
  status: CheckStatus;
  details: string;
}

export type IssueSeverity = 'low' | 'medium' | 'high';

export interface ConsistencyIssue {
  id: string;
  checkId: string;
  severity: IssueSeverity;
  day?: number;
  description: string;
  suggestedCorrection: string;
  tag?: InterestTag;
  activityId?: string;
}

export interface ConsistencyReport {
  runAt: string;
  checksPerformed: ConsistencyCheck[];
  issues: ConsistencyIssue[];
  passed: boolean;
  mode: 'local-demo-rules';
  correctionsApplied: number;
  isAfterCorrection: boolean;
}
