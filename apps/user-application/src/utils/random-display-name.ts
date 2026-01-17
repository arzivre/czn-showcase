export function generateRandomDisplayName(options?: {
  adjectives?: string[];
  nouns?: string[];
  includeNumber?: boolean;
}): string {
  const {
    adjectives = [
      "Atomic", "Cosmic", "Digital", "Electric", "Galactic", "Hyper", "Quantum",
      "Retro", "Solar", "Techno", "Virtual", "Wild", "Zen", "Neon", "Crystal"
    ],
    nouns = [
      "Explorer", "Voyager", "Pioneer", "Nomad", "Seeker", "Traveler", "Adventurer",
      "Wanderer", "Dreamer", "Creator", "Builder", "Maker", "Thinker", "Observer"
    ],
    includeNumber = true
  } = options || {};
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = includeNumber ? Math.floor(Math.random() * 999) + 1 : '';
  
  return `${adj}${noun}${num}`;
}