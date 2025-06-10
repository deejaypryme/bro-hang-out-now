
export interface Friend {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen: Date;
  preferredTimes: string[];
  friendshipDate: Date;
}

export interface TimeSlot {
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
  busy: boolean;
}

export interface Hangout {
  id: string;
  friendId: string;
  friendName: string;
  activity: string;
  activityEmoji: string;
  date: Date;
  time: string;
  status: 'confirmed' | 'pending' | 'completed';
}

export interface Achievement {
  name: string;
  emoji: string;
  requirement: string;
  earned: boolean;
  progress?: number;
}

// Mock friends data
export const mockFriends: Friend[] = [
  {
    id: '1',
    name: 'Mike Johnson',
    phone: '+1234567890',
    avatar: 'MJ',
    status: 'online',
    lastSeen: new Date(),
    preferredTimes: ['evenings', 'weekends'],
    friendshipDate: new Date('2023-01-15')
  },
  {
    id: '2',
    name: 'Alex Chen',
    phone: '+1234567891',
    avatar: 'AC',
    status: 'offline',
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    preferredTimes: ['mornings', 'afternoons'],
    friendshipDate: new Date('2023-03-20')
  },
  {
    id: '3',
    name: 'Ryan Davis',
    phone: '+1234567892',
    avatar: 'RD',
    status: 'online',
    lastSeen: new Date(),
    preferredTimes: ['evenings'],
    friendshipDate: new Date('2023-05-10')
  },
  {
    id: '4',
    name: 'Jake Wilson',
    phone: '+1234567893',
    avatar: 'JW',
    status: 'busy',
    lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    preferredTimes: ['weekends'],
    friendshipDate: new Date('2023-07-05')
  }
];

// Mock upcoming hangouts
export const mockHangouts: Hangout[] = [
  {
    id: '1',
    friendId: '1',
    friendName: 'Mike Johnson',
    activity: 'Grab Beers',
    activityEmoji: '🍺',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    time: '6:00 PM',
    status: 'confirmed'
  },
  {
    id: '2',
    friendId: '2',
    friendName: 'Alex Chen',
    activity: 'Coffee Chat',
    activityEmoji: '☕',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    time: '10:00 AM',
    status: 'confirmed'
  },
  {
    id: '3',
    friendId: '3',
    friendName: 'Ryan Davis',
    activity: 'Basketball',
    activityEmoji: '🏀',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    time: '4:00 PM',
    status: 'pending'
  }
];

// Generate time slots for the next 7 days
export const generateTimeSlots = (): TimeSlot[] => {
  const timeSlots: TimeSlot[] = [];
  const today = new Date();
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    
    const times = [
      { start: '12:00 PM', end: '2:00 PM' },
      { start: '2:00 PM', end: '4:00 PM' },
      { start: '4:00 PM', end: '6:00 PM' },
      { start: '6:00 PM', end: '8:00 PM' },
      { start: '8:00 PM', end: '10:00 PM' }
    ];
    
    times.forEach(time => {
      timeSlots.push({
        date,
        startTime: time.start,
        endTime: time.end,
        available: Math.random() > 0.3, // 70% chance of being available
        busy: Math.random() > 0.8 // 20% chance of being busy
      });
    });
  }
  
  return timeSlots;
};

export const mockTimeSlots = generateTimeSlots();

// Mock user stats
export interface UserStats {
  broPoints: number;
  currentStreak: number;
  totalHangouts: number;
  achievements: Achievement[];
}

export const mockUserStats: UserStats = {
  broPoints: 485,
  currentStreak: 7,
  totalHangouts: 23,
  achievements: [
    { name: "Wingman of the Week", emoji: "🤝", requirement: "7 days active streak", earned: true },
    { name: "Social Butterfly", emoji: "🦋", requirement: "5 different friends in a month", earned: true, progress: 80 },
    { name: "Marathon Bro", emoji: "🏃", requirement: "30 day hangout streak", earned: false, progress: 23 },
    { name: "The Connector", emoji: "🌐", requirement: "Introduce 2 friends to each other", earned: false, progress: 50 }
  ]
};
