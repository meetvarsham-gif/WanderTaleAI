import type { InterestTag, TimeOfDay } from '../types';

// Generic, destination-agnostic activity archetypes used by the local demo generator.
// `{destination}` is substituted at generation time. These are intentionally generic
// concepts (not verified real venues) and are always surfaced to the user as suggestions.
export interface ActivityTemplate {
  title: string;
  location: string;
  description: string;
  preferredTime: TimeOfDay;
}

export const ACTIVITY_POOL: Record<InterestTag, ActivityTemplate[]> = {
  food: [
    {
      title: 'Market-to-table breakfast',
      location: 'the central food market',
      description: 'Sampling fresh local produce and regional breakfast staples alongside early-morning vendors.',
      preferredTime: 'Morning',
    },
    {
      title: 'Guided street-food crawl',
      location: 'the old market lanes',
      description: 'Working through a handful of beloved street-food stalls, one small plate at a time.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Regional tasting menu',
      location: 'a locally loved family-run restaurant',
      description: "An unhurried tasting menu built around the region's signature ingredients.",
      preferredTime: 'Evening',
    },
    {
      title: 'Home-style cooking class',
      location: 'a neighbourhood culinary studio',
      description: 'Learning a handful of traditional recipes from a local home cook.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Rooftop dinner with a view',
      location: 'a rooftop terrace overlooking the skyline',
      description: 'A relaxed dinner paired with the glow of the city settling into evening.',
      preferredTime: 'Evening',
    },
    {
      title: 'Coffee and pastry ritual',
      location: 'a quiet corner café',
      description: 'Easing into the day over strong coffee and a regional pastry.',
      preferredTime: 'Morning',
    },
    {
      title: 'Wine or tea tasting',
      location: 'a small-batch tasting room',
      description: 'A guided tasting through a few of the region\'s signature pours.',
      preferredTime: 'Evening',
    },
  ],
  culture: [
    {
      title: 'Wander through the old quarter',
      location: 'the historic old quarter',
      description: 'Getting pleasantly lost among narrow streets, courtyards, and local life.',
      preferredTime: 'Morning',
    },
    {
      title: 'Local artisans workshop visit',
      location: "the artisans' district",
      description: 'Watching craftspeople at work and learning the stories behind their trade.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Traditional performance evening',
      location: 'a community cultural hall',
      description: 'An evening of traditional music or dance performed by local artists.',
      preferredTime: 'Evening',
    },
    {
      title: 'Neighbourhood ritual and customs walk',
      location: 'a residential old town neighbourhood',
      description: 'Observing everyday customs and rituals that shape local life.',
      preferredTime: 'Morning',
    },
    {
      title: 'Language and etiquette primer',
      location: 'a community cultural centre',
      description: 'A light, friendly introduction to local customs, phrases, and etiquette.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Festival square visit',
      location: 'the main public square',
      description: 'Taking in the rhythm of daily life where locals gather and celebrate.',
      preferredTime: 'Evening',
    },
  ],
  nature: [
    {
      title: 'Sunrise viewpoint hike',
      location: 'a nearby lookout trail',
      description: 'An early climb rewarded with sweeping views as the land wakes up.',
      preferredTime: 'Morning',
    },
    {
      title: 'Botanical gardens stroll',
      location: 'the botanical gardens',
      description: 'A slow walk through curated greenery, native flora, and quiet paths.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Coastal or riverside walk',
      location: 'the waterfront promenade',
      description: 'Following the water\'s edge as light shifts across the afternoon.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Golden-hour nature escape',
      location: 'a scenic nature reserve nearby',
      description: 'Catching the last light of day somewhere wide open and green.',
      preferredTime: 'Evening',
    },
    {
      title: 'Local countryside day trip',
      location: 'the surrounding countryside',
      description: 'A short trip beyond the centre to see how the landscape changes.',
      preferredTime: 'Morning',
    },
    {
      title: 'Stargazing session',
      location: 'a quiet spot away from city lights',
      description: 'Letting the sky take over once the sun has fully set.',
      preferredTime: 'Evening',
    },
  ],
  adventure: [
    {
      title: 'Guided outdoor adventure excursion',
      location: 'the adventure sports area outside town',
      description: 'An adrenaline-tilted outing suited to a curious, active traveller.',
      preferredTime: 'Morning',
    },
    {
      title: 'Bike or scooter exploration',
      location: 'the wider city districts',
      description: 'Covering more ground than on foot, discovering pockets off the usual path.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Water-based activity session',
      location: 'the local waterway or coastline',
      description: 'Kayaking, paddleboarding, or a similar activity suited to conditions on the day.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Off-the-beaten-path exploration',
      location: 'a lesser-visited district',
      description: 'Venturing somewhere guidebooks mention only in passing.',
      preferredTime: 'Morning',
    },
    {
      title: 'Evening adventure activity',
      location: 'an outdoor activity hub',
      description: 'Closing the day with one more burst of movement before dinner.',
      preferredTime: 'Evening',
    },
  ],
  art: [
    {
      title: 'Contemporary art gallery circuit',
      location: 'the gallery district',
      description: 'Moving between a few independent galleries showing current local work.',
      preferredTime: 'Morning',
    },
    {
      title: 'Street art and mural walk',
      location: 'the creative quarter',
      description: 'Tracing a trail of murals and public art through side streets.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Design studio visit',
      location: 'an independent design studio',
      description: 'Meeting local designers and seeing work in progress.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Evening art-walk and open studios',
      location: 'the arts quarter',
      description: 'Studios and small galleries opening their doors for an evening browse.',
      preferredTime: 'Evening',
    },
  ],
  nightlife: [
    {
      title: 'Live music evening',
      location: 'a small live-music venue',
      description: 'Catching a local act in an intimate room.',
      preferredTime: 'Evening',
    },
    {
      title: 'Rooftop bar sundown',
      location: 'a rooftop bar',
      description: 'Watching the city shift from day to night, drink in hand.',
      preferredTime: 'Evening',
    },
    {
      title: 'Night market wander',
      location: 'the night market',
      description: 'Browsing stalls, snacks, and street performers after dark.',
      preferredTime: 'Evening',
    },
    {
      title: 'Local social scene evening',
      location: 'a popular evening district',
      description: 'Easing into wherever the evening energy of the city gathers.',
      preferredTime: 'Evening',
    },
  ],
  relaxation: [
    {
      title: 'Spa and wellness morning',
      location: 'a local wellness spa',
      description: 'A slow, restorative start with traditional wellness treatments.',
      preferredTime: 'Morning',
    },
    {
      title: 'Quiet garden or park afternoon',
      location: 'a peaceful public park',
      description: 'Doing very little, deliberately, somewhere green and quiet.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Sunset relaxation by the water',
      location: 'a calm waterfront spot',
      description: 'Winding the day down slowly as the light softens.',
      preferredTime: 'Evening',
    },
    {
      title: 'Leisurely late morning in',
      location: 'the neighbourhood around your stay',
      description: 'No agenda beyond coffee, a good view, and an unhurried pace.',
      preferredTime: 'Morning',
    },
  ],
  shopping: [
    {
      title: 'Local market browse',
      location: 'the central market halls',
      description: 'Browsing stalls of textiles, crafts, and regional goods.',
      preferredTime: 'Morning',
    },
    {
      title: 'Independent boutiques trail',
      location: 'the boutique shopping street',
      description: 'Ducking into small independent shops along a walkable stretch.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Artisan souvenir hunting',
      location: "the craftspeople's quarter",
      description: 'Looking for a keepsake made by hand rather than mass-produced.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Evening market stroll',
      location: 'an evening pop-up market',
      description: 'A last unhurried browse before the day winds down.',
      preferredTime: 'Evening',
    },
  ],
  photography: [
    {
      title: 'Golden-hour photo walk',
      location: 'the most photogenic viewpoint in the old town',
      description: 'Chasing light across rooftops, alleys, and skyline.',
      preferredTime: 'Morning',
    },
    {
      title: 'Architecture and detail hunting',
      location: 'the historic architecture district',
      description: 'Looking closely at doorways, tilework, and facades most visitors rush past.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Blue-hour skyline session',
      location: 'the best elevated viewpoint in town',
      description: 'Capturing the short window between sunset and full dark.',
      preferredTime: 'Evening',
    },
    {
      title: 'Candid street-life walk',
      location: 'a busy local market street',
      description: 'Observing the unscripted rhythm of everyday street life.',
      preferredTime: 'Morning',
    },
  ],
  history: [
    {
      title: 'Guided historic centre walk',
      location: 'the historic centre',
      description: 'Tracing the layers of history visible in streets and structures.',
      preferredTime: 'Morning',
    },
    {
      title: 'Local history museum visit',
      location: 'the regional history museum',
      description: 'A closer look at the stories and artefacts that shaped the area.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Monument and memorial walk',
      location: 'the old monuments quarter',
      description: 'Pausing at landmarks that mark turning points in local history.',
      preferredTime: 'Afternoon',
    },
    {
      title: 'Evening heritage lantern walk',
      location: 'the heritage old town',
      description: 'Seeing historic streets take on a different character after dark.',
      preferredTime: 'Evening',
    },
  ],
};

export const DEFAULT_INTERESTS: InterestTag[] = ['culture', 'food', 'nature'];
