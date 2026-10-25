import type { TravelStyle } from '../types';

export const OPENINGS = [
  (destination: string, day: number) =>
    `Day ${day} unfolds gently across ${destination}, with plenty of room to follow your own pace.`,
  (destination: string, day: number) =>
    `By day ${day}, ${destination} starts to feel a little more familiar, and today leans into that.`,
  (destination: string, day: number) =>
    `Picture day ${day} in ${destination} as a loose sketch rather than a fixed plan — here's how it could go.`,
  (destination: string, day: number) =>
    `${destination} offers something different on day ${day}: a shift in rhythm, scenery, and mood.`,
];

export const MORNING_CONNECTORS = [
  'The morning opens with',
  'Things begin gently with',
  'The day starts with',
  'Morning light sets the stage for',
];

export const AFTERNOON_CONNECTORS = [
  'By afternoon, the plan shifts toward',
  'As the day warms up, attention turns to',
  'The afternoon stretch is given over to',
  'Midday brings a change of pace with',
];

export const EVENING_CONNECTORS = [
  'As evening settles in, the day winds toward',
  'Once the light softens, there is time for',
  'Evening belongs to',
  'The day closes out with',
];

export const CLOSERS: Record<TravelStyle, string[]> = {
  relaxed: [
    'Nothing here is meant to be rushed — if a moment is worth lingering in, linger.',
    'The only real rule for today is to let the pace stay slow.',
  ],
  balanced: [
    "It's a day built to mix structure with room to wander off-plan if something catches your eye.",
    'Enough shape to feel purposeful, enough space to improvise.',
  ],
  'fast-paced': [
    "There's a lot packed into today, so comfortable shoes and an early start help.",
    'Keep the momentum going — there is more to see than there is time to see it slowly.',
  ],
  luxury: [
    'Throughout the day, favour comfort and ease — this is a trip meant to feel indulgent, not rushed.',
    'Consider booking ahead where possible so the day stays seamless from start to finish.',
  ],
  budget: [
    'Much of today leans on free or low-cost local favourites rather than anything that demands a big spend.',
    "It's a day proving that a memorable trip doesn't need a large budget.",
  ],
  adventurous: [
    "Today rewards curiosity — the more willing you are to wander off-plan, the better it tends to go.",
    'Expect a little unpredictability; that is usually where the best moments on a trip like this happen.',
  ],
};

export const MOOD_WORDS = [
  'golden',
  'soft amber',
  'cool blue',
  'warm terracotta',
  'misty',
  'crisp',
  'glowing',
];

export const CAPTION_LEADS = [
  'Found this corner of',
  'Still thinking about this view in',
  'A quiet favourite from',
  'This is why we travel —',
  'One of those moments in',
];
