
export interface UserPattern {
  userId: string;
  preferredDays: number[]; // 0-6 (Sunday-Saturday)
  preferredTimeRanges: TimeRange[];
  averageMeetingDuration: number;
  commonMeetingDays: number[];
  timezone: string;
}

export interface TimeRange {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  frequency: number; // How often this range is used (0-1)
}

export interface HistoricalPattern {
  userId: string;
  friendId: string;
  successfulMeetingTimes: MeetingTime[];
  preferredDuration: number;
  commonDays: number[];
  averageNoticeTime: number; // hours
}

export interface MeetingTime {
  date: string;
  startTime: string;
  duration: number;
  wasSuccessful: boolean;
  dayOfWeek: number;
}

export interface SmartSuggestion {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  confidence: number; // 0-1
  reasoning: string[];
  patternBased: boolean;
  mutualConvenience: number; // 0-1
  userTimezone: string;
  friendTimezone: string;
  suggestionType: 'pattern' | 'preference' | 'availability' | 'optimal';
}

export interface SuggestionWeights {
  historicalPattern: number;
  userPreference: number;
  friendPreference: number;
  timezoneConvenience: number;
  availabilityMatch: number;
  durationOptimal: number;
}

export interface SmartSuggestionRequest {
  userId: string;
  friendId: string;
  startDate: string;
  endDate: string;
  preferredDuration?: number;
  maxSuggestions?: number;
  includeWeekends?: boolean;
  timeOfDayPreference?: 'morning' | 'afternoon' | 'evening' | 'any';
}

export interface SmartSuggestionResponse {
  suggestions: SmartSuggestion[];
  totalAnalyzed: number;
  patternConfidence: number;
  userPatterns: UserPattern;
  friendPatterns: UserPattern;
  mutualHistory?: HistoricalPattern;
}
