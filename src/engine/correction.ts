import type { ConsistencyIssue, InterestTag, ItineraryActivity, TripResult } from '../types';
import { ACTIVITY_POOL } from './activityPool';
import { buildSceneForDay, buildStoryForDay, seedFor } from './tripGenerator';
import { hashString, mulberry32 } from './seed';

/**
 * Applies targeted fixes for the issues raised by the consistency checker, then
 * returns a corrected TripResult. This is the "agentic correction" step: it reads
 * the specific issue, decides a fix appropriate to that issue type, and edits only
 * what is necessary — it does not regenerate the whole trip from scratch.
 */
export function applyCorrections(trip: TripResult, issues: ConsistencyIssue[]): { trip: TripResult; appliedCount: number } {
  const next: TripResult = structuredCloneTrip(trip);
  let appliedCount = 0;

  for (const issue of issues) {
    switch (issue.checkId) {
      case 'destination-in-story': {
        const story = next.story.find((s) => s.day === issue.day);
        if (story && !story.text.toLowerCase().includes(next.input.destination.toLowerCase())) {
          story.text += ` Through all of it, ${next.input.destination} remains unmistakably the setting for the day.`;
          appliedCount++;
        }
        break;
      }

      case 'destination-in-caption': {
        const scene = next.scenes.find((s) => s.day === issue.day);
        if (scene && !scene.caption.toLowerCase().includes(next.input.destination.toLowerCase())) {
          scene.caption += ` · ${next.input.destination}`;
          appliedCount++;
        }
        break;
      }

      case 'activity-story-alignment': {
        const day = next.itinerary.find((d) => d.day === issue.day);
        const story = next.story.find((s) => s.day === issue.day);
        if (day && story) {
          const storyLower = story.text.toLowerCase();
          const missing = day.activities.filter(
            (a) => !storyLower.includes(a.title.toLowerCase()) && !storyLower.includes(a.location.split(',')[0].toLowerCase())
          );
          if (missing.length) {
            story.text +=
              ' ' +
              missing
                .map((a) => `The plan for the day also makes room for ${a.title.toLowerCase()} at ${a.location}.`)
                .join(' ');
            appliedCount++;
          }
        }
        break;
      }

      case 'scene-story-coherence': {
        const day = next.itinerary.find((d) => d.day === issue.day);
        const scene = next.scenes.find((s) => s.day === issue.day);
        if (day && scene) {
          const signature = day.activities[day.activities.length - 1];
          scene.sceneDescription = `A quietly striking scene of ${signature.title.toLowerCase()} at ${signature.location}, captured as ${next.input.destination} carries on in the background.`;
          scene.imagePrompt = `Editorial travel photograph of ${signature.title.toLowerCase()} at ${signature.location}, soft natural light, cinematic travel-magazine composition, no text or watermark.`;
          appliedCount++;
        }
        break;
      }

      case 'duplicate-activity': {
        const day = next.itinerary.find((d) => d.day === issue.day);
        if (day && issue.activityId && issue.tag) {
          const replaced = replaceDuplicateActivity(next, day.day, issue.activityId, issue.tag);
          if (replaced) {
            const rng = mulberry32(hashString(`${seedFor(next.input)}-fix-${day.day}`));
            const freshStory = buildStoryForDay(next.input, day, rng);
            const freshScene = buildSceneForDay(next.input, day, rng);
            const storyIdx = next.story.findIndex((s) => s.day === day.day);
            const sceneIdx = next.scenes.findIndex((s) => s.day === day.day);
            if (storyIdx >= 0) next.story[storyIdx] = freshStory;
            if (sceneIdx >= 0) next.scenes[sceneIdx] = freshScene;
            appliedCount++;
          }
        }
        break;
      }

      case 'day-count-match':
      case 'day-numbering':
      case 'date-sequencing':
        // Structural issues require a full regeneration rather than a targeted patch;
        // surfaced to the user as "regenerate the trip" via the suggested correction text.
        break;

      default:
        break;
    }
  }

  next.generatedAt = new Date().toISOString();
  return { trip: next, appliedCount };
}

function replaceDuplicateActivity(
  trip: TripResult,
  day: number,
  activityId: string,
  tag: InterestTag
): boolean {
  const itDay = trip.itinerary.find((d) => d.day === day);
  if (!itDay) return false;
  const activityIdx = itDay.activities.findIndex((a) => a.id === activityId);
  if (activityIdx === -1) return false;

  // Count how often each template in this tag's pool is already used across the trip,
  // so a replacement can prefer the least-used option even when every template has been
  // used at least once (a small demo pool exhausted by a long trip).
  const usageCounts = new Map<string, number>();
  trip.itinerary.forEach((d) =>
    d.activities
      .filter((a) => a.tag === tag)
      .forEach((a) => usageCounts.set(a.title, (usageCounts.get(a.title) ?? 0) + 1))
  );

  const pool = ACTIVITY_POOL[tag];
  const destination = trip.input.destination;
  const current = itDay.activities[activityIdx];
  if (pool.length <= 1) return false;

  let best = pool[0];
  let bestCount = Infinity;
  for (const candidate of pool) {
    if (candidate.title === current.title) continue;
    const count = usageCounts.get(candidate.title) ?? 0;
    if (count < bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  if (best.title === current.title) return false;

  const updated: ItineraryActivity = {
    ...current,
    title: best.title,
    location: `${best.location}, ${destination}`,
    description: best.description,
  };
  itDay.activities[activityIdx] = updated;
  return true;
}

function structuredCloneTrip(trip: TripResult): TripResult {
  return JSON.parse(JSON.stringify(trip)) as TripResult;
}
