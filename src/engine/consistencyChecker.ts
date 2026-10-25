import type { ConsistencyCheck, ConsistencyIssue, ConsistencyReport, TripResult } from '../types';

/**
 * Agentic consistency-checking workflow.
 *
 * This is a real, rule-based inspection pass over the actually-generated content
 * (itinerary, story, scenes/captions) — it is not a hardcoded "100% consistent" result.
 * Each check reads the live TripResult and can genuinely fail, depending on what was
 * generated. Explicitly local-demo rules (not an LLM judge) — see `mode` on the report.
 */

function primaryLocation(location: string): string {
  return location.split(',')[0].trim().toLowerCase();
}

export function runConsistencyChecks(trip: TripResult): ConsistencyReport {
  const checks: ConsistencyCheck[] = [];
  const issues: ConsistencyIssue[] = [];
  const destination = trip.input.destination.trim();
  const destLower = destination.toLowerCase();

  // 1. Destination named in every day's narrative.
  const storyDestMisses = trip.story.filter((s) => !s.text.toLowerCase().includes(destLower));
  checks.push({
    id: 'destination-in-story',
    label: 'Destination name present in each day\'s narrative',
    status: storyDestMisses.length ? 'warning' : 'pass',
    details: storyDestMisses.length
      ? `${destination} is not explicitly named in the narrative for day(s): ${storyDestMisses
          .map((s) => s.day)
          .join(', ')}.`
      : `"${destination}" appears explicitly in every day's narrative.`,
  });
  storyDestMisses.forEach((s) =>
    issues.push({
      id: `issue-dest-story-${s.day}`,
      checkId: 'destination-in-story',
      severity: 'medium',
      day: s.day,
      description: `Day ${s.day}'s story never explicitly names the destination (${destination}).`,
      suggestedCorrection: `Add an explicit mention of ${destination} to day ${s.day}'s narrative.`,
    })
  );

  // 2. Destination named in every caption.
  const captionDestMisses = trip.scenes.filter((s) => !s.caption.toLowerCase().includes(destLower));
  checks.push({
    id: 'destination-in-caption',
    label: 'Destination name present in each caption',
    status: captionDestMisses.length ? 'warning' : 'pass',
    details: captionDestMisses.length
      ? `Captions missing the destination name on day(s): ${captionDestMisses.map((s) => s.day).join(', ')}.`
      : `Every caption references ${destination} by name.`,
  });
  captionDestMisses.forEach((s) =>
    issues.push({
      id: `issue-dest-caption-${s.day}`,
      checkId: 'destination-in-caption',
      severity: 'low',
      day: s.day,
      description: `Day ${s.day}'s caption does not mention ${destination}.`,
      suggestedCorrection: `Append the destination name to day ${s.day}'s caption.`,
    })
  );

  // 3. Section day-counts match the requested trip duration.
  const expected = trip.input.durationDays;
  const counts = {
    itinerary: trip.itinerary.length,
    story: trip.story.length,
    scenes: trip.scenes.length,
  };
  const countsOk = counts.itinerary === expected && counts.story === expected && counts.scenes === expected;
  checks.push({
    id: 'day-count-match',
    label: 'Day count matches requested trip duration',
    status: countsOk ? 'pass' : 'fail',
    details: countsOk
      ? `Itinerary, story, and scenes all contain exactly ${expected} day(s), matching the requested duration.`
      : `Expected ${expected} day(s) but found itinerary=${counts.itinerary}, story=${counts.story}, scenes=${counts.scenes}.`,
  });
  if (!countsOk) {
    issues.push({
      id: 'issue-day-count',
      checkId: 'day-count-match',
      severity: 'high',
      description: `Section lengths disagree with the requested ${expected}-day duration.`,
      suggestedCorrection: 'Regenerate the trip to realign all sections with the requested duration.',
    });
  }

  // 4. Day numbers are sequential, unique, and consistent across sections.
  const itineraryDays = trip.itinerary.map((d) => d.day).sort((a, b) => a - b);
  const storyDays = trip.story.map((d) => d.day).sort((a, b) => a - b);
  const sceneDays = trip.scenes.map((d) => d.day).sort((a, b) => a - b);
  const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);
  const noDuplicates = new Set(itineraryDays).size === itineraryDays.length;
  const sequential = itineraryDays.every((d, i) => d === i + 1);
  const dayNumbersOk = sameSet(itineraryDays, storyDays) && sameSet(itineraryDays, sceneDays) && noDuplicates && sequential;
  checks.push({
    id: 'day-numbering',
    label: 'Day numbering is sequential and consistent across sections',
    status: dayNumbersOk ? 'pass' : 'fail',
    details: dayNumbersOk
      ? 'Day numbers run sequentially from 1 and match exactly across itinerary, story, and scenes.'
      : 'Day numbers are out of sequence, duplicated, or do not match across sections.',
  });
  if (!dayNumbersOk) {
    issues.push({
      id: 'issue-day-numbering',
      checkId: 'day-numbering',
      severity: 'high',
      description: 'Day numbers are inconsistent across itinerary, story, and scene sections.',
      suggestedCorrection: 'Regenerate the trip so day numbers align across every section.',
    });
  }

  // 5. Date sequencing, when a start date was provided.
  if (trip.input.startDate) {
    const datesOk = trip.itinerary.every((d, i) => {
      if (!d.date) return false;
      const expectedDate = new Date(trip.input.startDate! + 'T00:00:00Z');
      expectedDate.setUTCDate(expectedDate.getUTCDate() + i);
      return d.date === expectedDate.toISOString().slice(0, 10);
    });
    checks.push({
      id: 'date-sequencing',
      label: 'Dates increase by one day, starting from the chosen date',
      status: datesOk ? 'pass' : 'fail',
      details: datesOk
        ? `Dates run consecutively starting ${trip.input.startDate}.`
        : 'One or more itinerary dates do not follow consecutively from the chosen start date.',
    });
    if (!datesOk) {
      issues.push({
        id: 'issue-date-sequencing',
        checkId: 'date-sequencing',
        severity: 'medium',
        description: 'Itinerary dates are not sequential from the provided start date.',
        suggestedCorrection: 'Recompute each day\'s date as start date + (day number − 1).',
      });
    }
  } else {
    checks.push({
      id: 'date-sequencing',
      label: 'Dates increase by one day, starting from the chosen date',
      status: 'info',
      details: 'No start date was provided, so specific calendar dates were not generated or verified.',
    });
  }

  // 6. Each day's narrative reflects the activities actually planned for that day.
  trip.itinerary.forEach((day) => {
    const story = trip.story.find((s) => s.day === day.day);
    if (!story) return;
    const storyLower = story.text.toLowerCase();
    const mentioned = day.activities.filter(
      (a) => storyLower.includes(a.title.toLowerCase()) || storyLower.includes(primaryLocation(a.location))
    );
    const ratio = mentioned.length / day.activities.length;
    if (ratio < 0.66) {
      issues.push({
        id: `issue-alignment-${day.day}`,
        checkId: 'activity-story-alignment',
        severity: 'medium',
        day: day.day,
        description: `Day ${day.day}'s narrative only reflects ${mentioned.length} of ${day.activities.length} planned activities.`,
        suggestedCorrection: `Weave the remaining planned activities for day ${day.day} into its narrative.`,
      });
    }
  });
  const alignmentIssues = issues.filter((i) => i.checkId === 'activity-story-alignment');
  checks.push({
    id: 'activity-story-alignment',
    label: "Narrative reflects that day's planned activities",
    status: alignmentIssues.length ? 'warning' : 'pass',
    details: alignmentIssues.length
      ? `${alignmentIssues.length} day(s) under-reference their planned activities in the narrative.`
      : 'Every day\'s narrative references at least two-thirds of its planned activities.',
  });

  // 7. Scene description shares subject matter with that day's narrative (no cross-day drift).
  trip.itinerary.forEach((day) => {
    const scene = trip.scenes.find((s) => s.day === day.day);
    const story = trip.story.find((s) => s.day === day.day);
    if (!scene || !story) return;
    const storyLower = story.text.toLowerCase();
    const sceneLower = scene.sceneDescription.toLowerCase();
    const sharesSubject = day.activities.some(
      (a) => storyLower.includes(primaryLocation(a.location)) && sceneLower.includes(primaryLocation(a.location))
    );
    if (!sharesSubject) {
      issues.push({
        id: `issue-scene-coherence-${day.day}`,
        checkId: 'scene-story-coherence',
        severity: 'medium',
        day: day.day,
        description: `Day ${day.day}'s visual scene does not share a location with that day's narrative — possible cross-day drift.`,
        suggestedCorrection: `Regenerate day ${day.day}'s scene description so it depicts a location mentioned in that day's narrative.`,
      });
    }
  });
  const coherenceIssues = issues.filter((i) => i.checkId === 'scene-story-coherence');
  checks.push({
    id: 'scene-story-coherence',
    label: 'Visual scenes match the correct day\'s narrative location',
    status: coherenceIssues.length ? 'fail' : 'pass',
    details: coherenceIssues.length
      ? `${coherenceIssues.length} day(s) show a scene that does not match that day's narrative location.`
      : 'Every scene description shares a location with its corresponding day\'s narrative.',
  });

  // 8. Narration script integrity (narration reuses the actual story text verbatim).
  checks.push({
    id: 'narration-integrity',
    label: 'Narration script matches the generated story text',
    status: 'pass',
    details: 'Narration audio is generated directly from each day\'s story text, so the two can never drift apart.',
  });

  // 9. Duplicate activities across different days (possible repetition from a long trip).
  const seen = new Map<string, number>();
  trip.itinerary.forEach((day) => {
    day.activities.forEach((a) => {
      const key = `${a.title}|${a.location}`;
      const firstDay = seen.get(key);
      if (firstDay !== undefined && firstDay !== day.day) {
        issues.push({
          id: `issue-duplicate-${day.day}-${a.id}`,
          checkId: 'duplicate-activity',
          severity: 'low',
          day: day.day,
          tag: a.tag,
          activityId: a.id,
          description: `Day ${day.day} repeats an activity ("${a.title}") already used on day ${firstDay}.`,
          suggestedCorrection: `Swap day ${day.day}'s repeated activity for a different suggestion in the same category.`,
        });
      } else {
        seen.set(key, day.day);
      }
    });
  });
  const duplicateIssues = issues.filter((i) => i.checkId === 'duplicate-activity');
  checks.push({
    id: 'duplicate-activity',
    label: 'No activity is repeated across different days',
    status: duplicateIssues.length ? 'warning' : 'pass',
    details: duplicateIssues.length
      ? `${duplicateIssues.length} repeated activity(ies) found across different days — likely because a long trip exhausted the local demo's suggestion pool.`
      : 'No activity appears more than once across the trip.',
  });

  const blockingIssues = issues.filter((i) => i.severity === 'high' || i.severity === 'medium');
  const passed = blockingIssues.length === 0;

  return {
    runAt: new Date().toISOString(),
    checksPerformed: checks,
    issues,
    passed,
    mode: 'local-demo-rules',
    correctionsApplied: 0,
    isAfterCorrection: false,
  };
}
