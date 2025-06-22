
import React from 'react';
import Header from '../components/Header';
import BroModePanel from '../components/BroModePanel';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const BroMode = () => {
  const userStats = {
    broPoints: 485,
    currentStreak: 3,
    totalHangouts: 12,
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
