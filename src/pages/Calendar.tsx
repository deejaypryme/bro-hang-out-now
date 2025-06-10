
import React from 'react';
import Header from '../components/Header';
import CalendarSidebar from '../components/CalendarSidebar';
import { mockHangouts, mockUserStats } from '../data/mockData';

const Calendar = () => {
  return (
    <div className="min-h-screen bg-bg-secondary">
      <Header userStats={mockUserStats} />
      
      {/* Mobile-first calendar layout */}
      <div className="p-4">
        <div className="max-w-md mx-auto md:max-w-4xl">
          <h2 className="text-xl font-bold text-primary mb-4">
            Your Social Calendar
          </h2>
          
          {/* Full-width calendar on mobile */}
          <div className="bg-bg-primary rounded-2xl shadow-lg border border-custom">
            <CalendarSidebar hangouts={mockHangouts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
