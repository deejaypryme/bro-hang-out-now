// User statistics and achievements types

export interface Achievement {
  name: string;
  emoji: string;
  requirement: string;
  earned: boolean;
  progress?: number;
}

export interface UserStats {
  broPoints: number;
  currentStreak: number;
  totalHangouts: number;
  achievements: Achievement[];
}
