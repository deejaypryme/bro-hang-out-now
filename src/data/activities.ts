
export interface Activity {
  name: string;
  emoji: string;
  duration: number; // minutes
  type: string;
  customizable?: boolean;
}

export interface ActivityCategory {
  name: string;
  activities: Activity[];
}

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  {
    name: "Chill Vibes",
    activities: [
      { name: "Grab Coffee", emoji: "☕", duration: 60, type: "food" },
      { name: "Go for a Walk", emoji: "🚶", duration: 45, type: "outdoor" },
      { name: "Backyard BBQ", emoji: "🔥", duration: 180, type: "food" },
      { name: "Hang at Home", emoji: "🏠", duration: 120, type: "indoor" },
      { name: "Park Bench Sit-down", emoji: "🌳", duration: 30, type: "outdoor" }
    ]
  },
  {
    name: "Food & Drink",
    activities: [
      { name: "Lunch/Dinner Out", emoji: "🍽️", duration: 90, type: "food" },
      { name: "Cook Together", emoji: "👨‍🍳", duration: 120, type: "food" },
      { name: "Brewery Visit", emoji: "🍺", duration: 150, type: "food" },
      { name: "Dessert Run", emoji: "🍦", duration: 45, type: "food" }
    ]
  },
  {
    name: "Competitive & Active",
    activities: [
      { name: "Basketball", emoji: "🏀", duration: 90, type: "sports" },
      { name: "Darts", emoji: "🎯", duration: 60, type: "sports" },
      { name: "Pool", emoji: "🎱", duration: 90, type: "sports" },
      { name: "Video Games", emoji: "🎮", duration: 180, type: "entertainment" },
      { name: "Pickleball", emoji: "🏓", duration: 75, type: "sports" },
      { name: "Mini-Golf", emoji: "⛳", duration: 90, type: "sports" }
    ]
  },
  {
    name: "Health & Wellness",
    activities: [
      { name: "Gym Session", emoji: "🏋️", duration: 90, type: "sports" },
      { name: "Sauna", emoji: "🧖", duration: 45, type: "wellness" },
      { name: "Cold Plunge", emoji: "🧊", duration: 30, type: "wellness" },
      { name: "Walk & Talk", emoji: "🚶‍♂️", duration: 60, type: "outdoor" },
      { name: "Recovery Activities", emoji: "🧘", duration: 75, type: "wellness" }
    ]
  },
  {
    name: "Big Plans",
    activities: [
      { name: "Road Trip", emoji: "🚗", duration: 480, type: "outdoor" },
      { name: "Live Show", emoji: "🎤", duration: 180, type: "entertainment" },
      { name: "Fishing", emoji: "🎣", duration: 240, type: "outdoor" },
      { name: "Sports Game", emoji: "🏈", duration: 210, type: "entertainment" },
      { name: "Car Meet", emoji: "🏎️", duration: 120, type: "outdoor" }
    ]
  },
  {
    name: "Short & Sweet",
    activities: [
      { name: "15-min Walk", emoji: "⏱️", duration: 15, type: "outdoor" },
      { name: "Quick Smoothie Run", emoji: "🥤", duration: 20, type: "food" },
      { name: "Meet at Gym", emoji: "💪", duration: 30, type: "sports" },
      { name: "Check-in at Kids' Event", emoji: "👶", duration: 45, type: "social" }
    ]
  }
];

export interface EmotionalSignal {
  emoji: string;
  label: string;
  color: string;
  description: string;
}

export const EMOTIONAL_SIGNALS: EmotionalSignal[] = [
  { 
    emoji: "🎧", 
    label: "Just Need to Talk", 
    color: "#8B5CF6",
    description: "Something heavy on my mind" 
  },
  { 
    emoji: "☕", 
    label: "Let's Catch Up", 
    color: "#F59E0B",
    description: "Life updates and general chat" 
  },
  { 
    emoji: "😎", 
    label: "Just Wanna Chill", 
    color: "#06D6A0",
    description: "No agenda, just hang" 
  },
  { 
    emoji: "⚡", 
    label: "Need to Blow Off Steam", 
    color: "#EF4444",
    description: "Stressed and need active outlet" 
  }
];
