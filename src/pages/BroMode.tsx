import React from 'react';
import Header from '../components/Header';
import BroModePanel from '../components/BroModePanel';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useHangouts } from '@/hooks/useDatabase';
import type { UserStats } from '@/types/stats';

const BroMode = () => {
  const { data: hangouts = [] } = useHangouts();
  
  // Calculate real stats from database
  const userStats: UserStats = {
    broPoints: hangouts.filter(h => h.status === 'completed').length * 50,
    currentStreak: 0, // TODO: Calculate from hangout dates
    totalHangouts: hangouts.filter(h => h.status === 'completed').length,
    achievements: [
      { name: "Getting Started", emoji: "🚀", requirement: "Complete your first hangout", earned: hangouts.some(h => h.status === 'completed'), progress: hangouts.some(h => h.status === 'completed') ? 100 : 0 },
      { name: "Social Butterfly", emoji: "🦋", requirement: "5 completed hangouts", earned: hangouts.filter(h => h.status === 'completed').length >= 5, progress: Math.min(100, (hangouts.filter(h => h.status === 'completed').length / 5) * 100) },
      { name: "Marathon Bro", emoji: "🏃", requirement: "10 completed hangouts", earned: hangouts.filter(h => h.status === 'completed').length >= 10, progress: Math.min(100, (hangouts.filter(h => h.status === 'completed').length / 10) * 100) },
      { name: "The Connector", emoji: "🌐", requirement: "Schedule 3 hangouts in one week", earned: false, progress: 0 }
    ]
  };

  return (
    <div className="min-h-screen hero-background">
      <Header userStats={userStats} />
      
      {/* Mobile-first bro mode layout */}
      <div className="p-bro-lg">
        <div className="max-w-md mx-auto md:max-w-2xl">
          <div className="text-center mb-bro-2xl">
            <div className="w-16 h-16 bg-gradient-to-r from-accent-orange to-accent-light rounded-bro-lg flex items-center justify-center text-3xl text-white mx-auto mb-bro-lg shadow-lg">
              ⚡
            </div>
            <h2 className="typo-headline-lg text-white mb-bro-sm">
              Bro Mode Dashboard
            </h2>
            <p className="typo-body text-white/80">
              Your availability and hangout coordination hub
            </p>
          </div>
          
          {/* Full-width bro mode panel on mobile */}
          <Card variant="glass" className="shadow-2xl border-white/20">
            <CardContent className="pt-bro-lg">
              <BroModePanel userStats={userStats} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BroMode;
