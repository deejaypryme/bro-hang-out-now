
import { format, addDays, parseISO, getDay, startOfDay, isWithinInterval } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { TimeService } from './timeService';
import { availabilityService } from './availabilityService';
import { hangoutService, profileService } from './database';
import type { 
  SmartSuggestion, 
  SmartSuggestionRequest, 
  SmartSuggestionResponse,
  UserPattern,
  HistoricalPattern,
  SuggestionWeights,
  TimeRange,
  MeetingTime
} from '@/types/smartScheduling';

export class SmartSuggestionsService {
  private static readonly DEFAULT_WEIGHTS: SuggestionWeights = {
    historicalPattern: 0.3,
    userPreference: 0.2,
    friendPreference: 0.2,
    timezoneConvenience: 0.15,
    availabilityMatch: 0.1,
    durationOptimal: 0.05
  };

  private static readonly TIME_PERIODS = {
    morning: { start: '07:00', end: '12:00' },
    afternoon: { start: '12:00', end: '17:00' },
    evening: { start: '17:00', end: '22:00' }
  };

  static async generateSmartSuggestions(request: SmartSuggestionRequest): Promise<SmartSuggestionResponse> {
    // Gather all necessary data
    const [userPatterns, friendPatterns, mutualHistory, mutualAvailability] = await Promise.all([
      this.analyzeUserPatterns(request.userId),
      this.analyzeUserPatterns(request.friendId),
      this.analyzeMutualHistory(request.userId, request.friendId),
      this.getMutualAvailability(request)
    ]);

    // Generate candidate suggestions
    const candidates = await this.generateCandidateSuggestions(
      request,
      userPatterns,
      friendPatterns,
      mutualHistory,
      mutualAvailability
    );

    // Score and rank suggestions
    const scoredSuggestions = this.scoreAndRankSuggestions(
      candidates,
      userPatterns,
      friendPatterns,
      mutualHistory
    );

    // Return top suggestions
    const maxSuggestions = request.maxSuggestions || 5;
    const topSuggestions = scoredSuggestions.slice(0, maxSuggestions);

    return {
      suggestions: topSuggestions,
      totalAnalyzed: candidates.length,
      patternConfidence: this.calculatePatternConfidence(userPatterns, friendPatterns, mutualHistory),
      userPatterns,
      friendPatterns,
      mutualHistory
    };
  }

  private static async analyzeUserPatterns(userId: string): Promise<UserPattern> {
    try {
      // Get user profile for timezone and preferences
      const profile = await profileService.getProfile(userId);
      const timezone = profile?.timezone || TimeService.getBrowserTimezone();
      
      // Get user's availability patterns
      const availability = await availabilityService.getUserAvailability(
        userId,
        format(new Date(), 'yyyy-MM-dd'),
        format(addDays(new Date(), 30), 'yyyy-MM-dd')
      );

      // Analyze historical hangouts for patterns
      const hangouts = await hangoutService.getHangouts(userId);
      const completedHangouts = hangouts.filter(h => h.status === 'completed');

      // Extract preferred days and times
      const preferredDays = this.extractPreferredDays(availability, completedHangouts);
      const preferredTimeRanges = this.extractPreferredTimeRanges(availability);
      const averageDuration = this.calculateAverageDuration(completedHangouts);
      const commonMeetingDays = this.extractCommonMeetingDays(completedHangouts);

      return {
        userId,
        preferredDays,
        preferredTimeRanges,
        averageMeetingDuration: averageDuration,
        commonMeetingDays,
        timezone
      };
    } catch (error) {
      console.error('Error analyzing user patterns:', error);
      return this.getDefaultUserPattern(userId);
    }
  }

  private static async analyzeMutualHistory(userId: string, friendId: string): Promise<HistoricalPattern | undefined> {
    try {
      const userHangouts = await hangoutService.getHangouts(userId);
      const mutualHangouts = userHangouts.filter(h => 
        (h.organizer_id === userId && h.friend_id === friendId) ||
        (h.organizer_id === friendId && h.friend_id === userId)
      );

      if (mutualHangouts.length === 0) {
        return undefined;
      }

      const successfulMeetings = mutualHangouts.filter(h => h.status === 'completed');
      const successfulMeetingTimes: MeetingTime[] = successfulMeetings.map(h => ({
        date: format(h.date, 'yyyy-MM-dd'),
        startTime: h.time,
        duration: h.duration_minutes || 120,
        wasSuccessful: true,
        dayOfWeek: getDay(h.date)
      }));

      const preferredDuration = this.calculateAverageDuration(successfulMeetings);
      const commonDays = this.extractCommonDaysFromMeetings(successfulMeetingTimes);
      const averageNoticeTime = this.calculateAverageNoticeTime(mutualHangouts);

      return {
        userId,
        friendId,
        successfulMeetingTimes,
        preferredDuration,
        commonDays,
        averageNoticeTime
      };
    } catch (error) {
      console.error('Error analyzing mutual history:', error);
      return undefined;
    }
  }

  private static async getMutualAvailability(request: SmartSuggestionRequest) {
    try {
      return await TimeService.findMutualAvailability(
        request.userId,
        request.friendId,
        request.startDate,
        request.endDate,
        request.preferredDuration || 120
      );
    } catch (error) {
      console.error('Error getting mutual availability:', error);
      return { mutualSlots: [], conflictCount: 0, optimalDuration: 120 };
    }
  }

  private static async generateCandidateSuggestions(
    request: SmartSuggestionRequest,
    userPatterns: UserPattern,
    friendPatterns: UserPattern,
    mutualHistory: HistoricalPattern | undefined,
    mutualAvailability: any
  ): Promise<SmartSuggestion[]> {
    const candidates: SmartSuggestion[] = [];

    // Start with mutual availability slots
    mutualAvailability.mutualSlots.forEach((slot: any, index: number) => {
      const suggestion: SmartSuggestion = {
        id: `availability-${index}`,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: this.calculateDuration(slot.startTime, slot.endTime),
        confidence: 0.5, // Will be recalculated
        reasoning: ['Available for both users'],
        patternBased: false,
        mutualConvenience: 0.5,
        userTimezone: userPatterns.timezone,
        friendTimezone: friendPatterns.timezone,
        suggestionType: 'availability'
      };
      candidates.push(suggestion);
    });

    // Add pattern-based suggestions
    if (mutualHistory && mutualHistory.successfulMeetingTimes.length > 0) {
      const patternSuggestions = this.generatePatternBasedSuggestions(
        request,
        userPatterns,
        friendPatterns,
        mutualHistory
      );
      candidates.push(...patternSuggestions);
    }

    // Add preference-based suggestions
    const preferenceSuggestions = this.generatePreferenceBasedSuggestions(
      request,
      userPatterns,
      friendPatterns
    );
    candidates.push(...preferenceSuggestions);

    return candidates;
  }

  private static generatePatternBasedSuggestions(
    request: SmartSuggestionRequest,
    userPatterns: UserPattern,
    friendPatterns: UserPattern,
    mutualHistory: HistoricalPattern
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    
    // Analyze successful meeting patterns
    const commonTimes = this.findCommonMeetingTimes(mutualHistory.successfulMeetingTimes);
    const preferredDays = mutualHistory.commonDays;

    let currentDate = new Date(startDate);
    while (currentDate <= endDate && suggestions.length < 10) {
      const dayOfWeek = getDay(currentDate);
      
      if (preferredDays.includes(dayOfWeek)) {
        commonTimes.forEach(time => {
          const suggestion: SmartSuggestion = {
            id: `pattern-${format(currentDate, 'yyyy-MM-dd')}-${time}`,
            date: format(currentDate, 'yyyy-MM-dd'),
            startTime: time,
            endTime: this.addDurationToTime(time, mutualHistory.preferredDuration),
            duration: mutualHistory.preferredDuration,
            confidence: 0.8, // High confidence for pattern-based
            reasoning: ['Based on your successful meeting history', 'This time worked well before'],
            patternBased: true,
            mutualConvenience: 0.8,
            userTimezone: userPatterns.timezone,
            friendTimezone: friendPatterns.timezone,
            suggestionType: 'pattern'
          };
          suggestions.push(suggestion);
        });
      }
      
      currentDate = addDays(currentDate, 1);
    }

    return suggestions;
  }

  private static generatePreferenceBasedSuggestions(
    request: SmartSuggestionRequest,
    userPatterns: UserPattern,
    friendPatterns: UserPattern
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const mutualPreferredDays = userPatterns.preferredDays.filter(day => 
      friendPatterns.preferredDays.includes(day)
    );

    const mutualTimeRanges = this.findMutualTimeRanges(
      userPatterns.preferredTimeRanges,
      friendPatterns.preferredTimeRanges
    );

    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate && suggestions.length < 8) {
      const dayOfWeek = getDay(currentDate);
      
      if (mutualPreferredDays.includes(dayOfWeek)) {
        mutualTimeRanges.forEach(range => {
          const suggestion: SmartSuggestion = {
            id: `preference-${format(currentDate, 'yyyy-MM-dd')}-${range.startTime}`,
            date: format(currentDate, 'yyyy-MM-dd'),
            startTime: range.startTime,
            endTime: range.endTime,
            duration: this.calculateDuration(range.startTime, range.endTime),
            confidence: 0.7,
            reasoning: ['Matches both users\' preferred times', 'Optimal day for both users'],
            patternBased: false,
            mutualConvenience: range.frequency,
            userTimezone: userPatterns.timezone,
            friendTimezone: friendPatterns.timezone,
            suggestionType: 'preference'
          };
          suggestions.push(suggestion);
        });
      }
      
      currentDate = addDays(currentDate, 1);
    }

    return suggestions;
  }

  private static scoreAndRankSuggestions(
    candidates: SmartSuggestion[],
    userPatterns: UserPattern,
    friendPatterns: UserPattern,
    mutualHistory: HistoricalPattern | undefined
  ): SmartSuggestion[] {
    const weights = this.DEFAULT_WEIGHTS;

    return candidates.map(suggestion => {
      let score = 0;

      // Historical pattern weight
      if (suggestion.patternBased && mutualHistory) {
        score += weights.historicalPattern;
      }

      // User preference weight
      const userPrefScore = this.calculatePreferenceScore(suggestion, userPatterns);
      score += userPrefScore * weights.userPreference;

      // Friend preference weight
      const friendPrefScore = this.calculatePreferenceScore(suggestion, friendPatterns);
      score += friendPrefScore * weights.friendPreference;

      // Timezone convenience
      const timezoneScore = this.calculateTimezoneConvenience(
        suggestion.startTime,
        userPatterns.timezone,
        friendPatterns.timezone
      );
      score += timezoneScore * weights.timezoneConvenience;

      // Duration optimality
      const durationScore = this.calculateDurationScore(
        suggestion.duration,
        userPatterns.averageMeetingDuration,
        friendPatterns.averageMeetingDuration
      );
      score += durationScore * weights.durationOptimal;

      return {
        ...suggestion,
        confidence: Math.min(score, 1.0)
      };
    }).sort((a, b) => b.confidence - a.confidence);
  }

  // Helper methods
  private static extractPreferredDays(availability: any[], hangouts: any[]): number[] {
    const dayFrequency = new Array(7).fill(0);
    
    availability.forEach(slot => {
      if (slot.day_of_week !== null) {
        dayFrequency[slot.day_of_week]++;
      }
    });

    hangouts.forEach(hangout => {
      const dayOfWeek = getDay(hangout.date);
      dayFrequency[dayOfWeek]++;
    });

    return dayFrequency
      .map((freq, day) => ({ day, freq }))
      .filter(item => item.freq > 0)
      .sort((a, b) => b.freq - a.freq)
      .slice(0, 4)
      .map(item => item.day);
  }

  private static extractPreferredTimeRanges(availability: any[]): TimeRange[] {
    return availability.map(slot => ({
      startTime: slot.start_time,
      endTime: slot.end_time,
      frequency: 1.0 // Could be enhanced with usage frequency
    }));
  }

  private static calculateAverageDuration(hangouts: any[]): number {
    if (hangouts.length === 0) return 120;
    const total = hangouts.reduce((sum, h) => sum + (h.duration_minutes || 120), 0);
    return Math.round(total / hangouts.length);
  }

  private static extractCommonMeetingDays(hangouts: any[]): number[] {
    const dayFrequency = new Array(7).fill(0);
    hangouts.forEach(hangout => {
      const dayOfWeek = getDay(hangout.date);
      dayFrequency[dayOfWeek]++;
    });

    return dayFrequency
      .map((freq, day) => ({ day, freq }))
      .filter(item => item.freq > 0)
      .sort((a, b) => b.freq - a.freq)
      .slice(0, 3)
      .map(item => item.day);
  }

  private static findCommonMeetingTimes(meetingTimes: MeetingTime[]): string[] {
    const timeFrequency: { [key: string]: number } = {};
    
    meetingTimes.forEach(meeting => {
      const timeSlot = meeting.startTime.substring(0, 5); // HH:mm format
      timeFrequency[timeSlot] = (timeFrequency[timeSlot] || 0) + 1;
    });

    return Object.entries(timeFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([time]) => time);
  }

  private static findMutualTimeRanges(userRanges: TimeRange[], friendRanges: TimeRange[]): TimeRange[] {
    const mutualRanges: TimeRange[] = [];
    
    userRanges.forEach(userRange => {
      friendRanges.forEach(friendRange => {
        const overlap = this.findTimeRangeOverlap(userRange, friendRange);
        if (overlap) {
          mutualRanges.push(overlap);
        }
      });
    });

    return mutualRanges;
  }

  private static findTimeRangeOverlap(range1: TimeRange, range2: TimeRange): TimeRange | null {
    const start1 = this.timeToMinutes(range1.startTime);
    const end1 = this.timeToMinutes(range1.endTime);
    const start2 = this.timeToMinutes(range2.startTime);
    const end2 = this.timeToMinutes(range2.endTime);

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);

    if (overlapStart < overlapEnd) {
      return {
        startTime: this.minutesToTime(overlapStart),
        endTime: this.minutesToTime(overlapEnd),
        frequency: (range1.frequency + range2.frequency) / 2
      };
    }

    return null;
  }

  private static calculatePreferenceScore(suggestion: SmartSuggestion, patterns: UserPattern): number {
    let score = 0;
    const dayOfWeek = getDay(new Date(suggestion.date));
    
    // Day preference
    if (patterns.preferredDays.includes(dayOfWeek)) {
      score += 0.5;
    }

    // Time preference
    const timeScore = patterns.preferredTimeRanges.some(range => 
      this.timeInRange(suggestion.startTime, range.startTime, range.endTime)
    );
    if (timeScore) {
      score += 0.5;
    }

    return Math.min(score, 1.0);
  }

  private static calculateTimezoneConvenience(time: string, userTz: string, friendTz: string): number {
    if (userTz === friendTz) return 1.0;
    
    const timeMinutes = this.timeToMinutes(time);
    // Prefer times between 9 AM and 6 PM
    if (timeMinutes >= 540 && timeMinutes <= 1080) {
      return 0.8;
    }
    return 0.5;
  }

  private static calculateDurationScore(duration: number, userAvg: number, friendAvg: number): number {
    const targetDuration = (userAvg + friendAvg) / 2;
    const difference = Math.abs(duration - targetDuration);
    return Math.max(0, 1 - (difference / targetDuration));
  }

  private static calculatePatternConfidence(
    userPatterns: UserPattern,
    friendPatterns: UserPattern,
    mutualHistory?: HistoricalPattern
  ): number {
    let confidence = 0.5;
    
    if (mutualHistory && mutualHistory.successfulMeetingTimes.length > 2) {
      confidence += 0.3;
    }
    
    if (userPatterns.preferredDays.length > 0 && friendPatterns.preferredDays.length > 0) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  private static getDefaultUserPattern(userId: string): UserPattern {
    return {
      userId,
      preferredDays: [1, 2, 3, 4, 5], // Weekdays
      preferredTimeRanges: [
        { startTime: '09:00', endTime: '17:00', frequency: 1.0 }
      ],
      averageMeetingDuration: 120,
      commonMeetingDays: [1, 2, 3, 4, 5],
      timezone: TimeService.getBrowserTimezone()
    };
  }

  private static extractCommonDaysFromMeetings(meetings: MeetingTime[]): number[] {
    const dayFreq = new Array(7).fill(0);
    meetings.forEach(m => dayFreq[m.dayOfWeek]++);
    return dayFreq
      .map((freq, day) => ({ day, freq }))
      .filter(item => item.freq > 0)
      .sort((a, b) => b.freq - a.freq)
      .slice(0, 3)
      .map(item => item.day);
  }

  private static calculateAverageNoticeTime(hangouts: any[]): number {
    return 24; // Default 24 hours notice
  }

  private static calculateDuration(startTime: string, endTime: string): number {
    return this.timeToMinutes(endTime) - this.timeToMinutes(startTime);
  }

  private static addDurationToTime(time: string, durationMinutes: number): string {
    const totalMinutes = this.timeToMinutes(time) + durationMinutes;
    return this.minutesToTime(totalMinutes);
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private static timeInRange(time: string, start: string, end: string): boolean {
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }
}
