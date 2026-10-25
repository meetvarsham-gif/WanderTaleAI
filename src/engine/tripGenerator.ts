import type {
  ItineraryActivity,
  ItineraryDay,
  SceneDay,
  StoryDay,
  TimeOfDay,
  TripInput,
  TripResult,
  InterestTag,
} from '../types';
import { ACTIVITY_POOL, DEFAULT_INTERESTS } from './activityPool';
import { hashString, mulberry32, pick } from './seed';
import {
  AFTERNOON_CONNECTORS,
  CAPTION_LEADS,
  CLOSERS,
  EVENING_CONNECTORS,
  MOOD_WORDS,
  MORNING_CONNECTORS,
  OPENINGS,
} from './phraseBanks';
import { INTEREST_OPTIONS } from '../types';

/**
 * Local demo-mode generation engine.
 *
 * This is an explicit, rule-based, template-driven generator — NOT a call to a real
 * language model. It exists so the app is fully demonstrable without any paid API key.
 * It is isolated behind `generateTrip()` so a real LLM-backed implementation could be
 * swapped in later without changing any UI component.
 */

const TIME_SLOTS: TimeOfDay[] = ['Morning', 'Afternoon', 'Evening'];

export function tagLabel(tag: InterestTag): string {
  return INTEREST_OPTIONS.find((o) => o.tag === tag)?.label ?? tag;
}

export function seedFor(input: TripInput): number {
  return hashString(
    `${input.destination.toLowerCase()}|${input.durationDays}|${input.travelStyle}|${input.interests.join(',')}|${
      input.travelers
    }`
  );
}

function toHashtag(text: string): string {
  return text
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');
}

function addDaysIso(startDateIso: string, offset: number): string | undefined {
  const d = new Date(startDateIso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return undefined;
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

function travelNoteFor(style: TripInput['travelStyle']): string {
  const base = 'These activities are AI-suggested ideas, not confirmed bookings — ';
  switch (style) {
    case 'luxury':
      return base + 'reserve ahead where possible so the day stays seamless.';
    case 'budget':
      return base + 'many options below are free or low-cost, but confirm current prices locally.';
    case 'fast-paced':
      return base + 'double-check opening hours, since the schedule leaves little slack.';
    default:
      return base + 'confirm opening hours, availability, and current details before you go.';
  }
}

function buildItinerary(input: TripInput, rng: () => number): ItineraryDay[] {
  const interests = input.interests.length > 0 ? input.interests : DEFAULT_INTERESTS;
  const tagOffsets = new Map<InterestTag, number>();
  interests.forEach((tag) => {
    tagOffsets.set(tag, Math.floor(rng() * ACTIVITY_POOL[tag].length));
  });

  const days: ItineraryDay[] = [];

  const tagUseCount = new Map<InterestTag, number>();

  for (let dayIdx = 0; dayIdx < input.durationDays; dayIdx++) {
    const dayNumber = dayIdx + 1;
    const activities: ItineraryActivity[] = [];
    const dayTags: InterestTag[] = [];

    for (let slot = 0; slot < 3; slot++) {
      const tag = interests[(dayIdx * 3 + slot) % interests.length];
      const pool = ACTIVITY_POOL[tag];
      const offset = tagOffsets.get(tag) ?? 0;
      const timesUsed = tagUseCount.get(tag) ?? 0;
      const useIndex = (offset + timesUsed) % pool.length;
      tagUseCount.set(tag, timesUsed + 1);
      const template = pool[useIndex];

      activities.push({
        id: `d${dayNumber}-${slot}`,
        time: TIME_SLOTS[slot],
        title: template.title,
        location: `${template.location}, ${input.destination}`,
        description: template.description,
        tag,
      });
      dayTags.push(tag);
    }

    const distinctTags = Array.from(new Set(dayTags));
    const theme =
      distinctTags.length >= 2
        ? `${tagLabel(distinctTags[0])} & ${tagLabel(distinctTags[1])}`
        : tagLabel(distinctTags[0]);

    days.push({
      day: dayNumber,
      date: input.startDate ? addDaysIso(input.startDate, dayIdx) : undefined,
      theme,
      activities,
      travelNote: travelNoteFor(input.travelStyle),
    });
  }

  return days;
}

export function buildStoryForDay(input: TripInput, day: ItineraryDay, rng: () => number): StoryDay {
  const opening = pick(rng, OPENINGS)(input.destination, day.day);
  const sentences: string[] = [opening];

  const connectorsBySlot: Record<TimeOfDay, string[]> = {
    Morning: MORNING_CONNECTORS,
    Afternoon: AFTERNOON_CONNECTORS,
    Evening: EVENING_CONNECTORS,
  };

  day.activities.forEach((activity) => {
    const connector = pick(rng, connectorsBySlot[activity.time]);
    sentences.push(
      `${connector} ${activity.title.toLowerCase()} at ${activity.location} — ${activity.description.toLowerCase()}`
    );
  });

  const closer = pick(rng, CLOSERS[input.travelStyle]);
  sentences.push(closer);

  if (input.preferences && input.preferences.trim()) {
    sentences.push(
      `With "${input.preferences.trim()}" in mind, today is shaped to leave room for exactly that.`
    );
  }

  return {
    day: day.day,
    title: `${day.theme} in ${input.destination}`,
    text: sentences.join(' '),
  };
}

function buildStory(input: TripInput, itinerary: ItineraryDay[], rng: () => number): StoryDay[] {
  return itinerary.map((day) => buildStoryForDay(input, day, rng));
}

export function buildSceneForDay(input: TripInput, day: ItineraryDay, rng: () => number): SceneDay {
  const signature = day.activities[day.activities.length - 1];
  const mood = pick(rng, MOOD_WORDS);
  const lead = pick(rng, CAPTION_LEADS);

  const sceneDescription = `A ${mood}-lit scene of ${signature.title.toLowerCase()} at ${signature.location}, with ${input.destination}'s everyday life moving quietly in the background.`;

  const imagePrompt = `Editorial travel photograph of ${signature.title.toLowerCase()} at ${signature.location}, ${mood} natural light, cinematic travel-magazine composition, candid and unposed, no text or watermark.`;

  const caption = `${lead} ${input.destination} — ${signature.location.split(',')[0]}. #${toHashtag(
    input.destination
  )} #${toHashtag(tagLabel(signature.tag))}`;

  return {
    day: day.day,
    sceneDescription,
    imagePrompt,
    caption,
  };
}

function buildScenes(input: TripInput, itinerary: ItineraryDay[], rng: () => number): SceneDay[] {
  return itinerary.map((day) => buildSceneForDay(input, day, rng));
}

export function generateTrip(input: TripInput): TripResult {
  const rng = mulberry32(seedFor(input));

  const itinerary = buildItinerary(input, rng);
  const story = buildStory(input, itinerary, rng);
  const scenes = buildScenes(input, itinerary, rng);

  const interestLabels = (input.interests.length > 0 ? input.interests : DEFAULT_INTERESTS)
    .map(tagLabel)
    .join(', ');

  const destinationSummary = `A ${input.durationDays}-day ${input.travelStyle} journey through ${input.destination} for ${
    input.travelers
  } traveller${input.travelers > 1 ? 's' : ''}, woven around ${interestLabels}.`;

  return {
    input,
    generatedAt: new Date().toISOString(),
    destinationSummary,
    itinerary,
    story,
    scenes,
    mode: 'local-demo',
  };
}
