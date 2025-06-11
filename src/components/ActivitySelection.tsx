
import React, { useState } from 'react';
import { ACTIVITY_CATEGORIES, EMOTIONAL_SIGNALS, type Activity, type EmotionalSignal } from '../data/activities';

interface ActivitySelectionProps {
  selectedActivity: Activity | null;
  selectedSignal: EmotionalSignal | null;
  onSelectActivity: (activity: Activity) => void;
  onSelectSignal: (signal: EmotionalSignal | null) => void;
}

const ActivitySelection: React.FC<ActivitySelectionProps> = ({
  selectedActivity,
  selectedSignal,
  onSelectActivity,
  onSelectSignal
}) => {
  const [activeCategory, setActiveCategory] = useState(ACTIVITY_CATEGORIES[0].name);

  const activeActivities = ACTIVITY_CATEGORIES.find(cat => cat.name === activeCategory)?.activities || [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">What do you want to do?</h3>
        <p className="text-sm text-gray-600">Pick an activity that sounds fun</p>
      </div>
      
      {/* Category Tabs */}
      <div className="space-y-2">
        <div className="flex overflow-x-auto gap-2 pb-2">
          {ACTIVITY_CATEGORIES.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`
                min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200
                ${activeCategory === category.name
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600'
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Activity Grid */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {activeActivities.map((activity) => (
            <button
              key={activity.name}
              onClick={() => onSelectActivity(activity)}
              className={`
                min-h-[80px] p-3 rounded-xl text-center transition-all duration-200 border-2
                ${selectedActivity?.name === activity.name
                  ? 'bg-blue-50 border-blue-500 shadow-md'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }
              `}
            >
              <div className="text-2xl mb-1">{activity.emoji}</div>
              <div className="text-sm font-semibold mb-1 text-gray-900">{activity.name}</div>
              <div className="text-xs text-gray-500">{activity.duration}min</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Emotional Signal Section */}
      <div className="space-y-4 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-gray-900">Vibe check (optional)</h4>
            <p className="text-xs text-gray-600">Let them know how you're feeling</p>
          </div>
          {selectedSignal && (
            <button
              onClick={() => onSelectSignal(null)}
              className="text-xs text-gray-500 hover:text-blue-600 font-medium"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EMOTIONAL_SIGNALS.map((signal) => {
            const isSelected = selectedSignal?.label === signal.label;
            return (
              <button
                key={signal.label}
                onClick={() => onSelectSignal(isSelected ? null : signal)}
                className={`
                  min-h-[60px] p-3 rounded-xl text-left transition-all duration-200 border-2
                  ${isSelected
                    ? 'shadow-md border-2'
                    : 'bg-gray-50 hover:bg-gray-100 border-transparent hover:border-gray-200'
                  }
                `}
                style={{
                  backgroundColor: isSelected ? `${signal.color}10` : undefined,
                  borderColor: isSelected ? signal.color : undefined
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{signal.emoji}</span>
                  <span className="text-sm font-semibold">{signal.label}</span>
                </div>
                <div className="text-xs text-gray-600">{signal.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivitySelection;
