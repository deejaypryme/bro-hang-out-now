
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
      <h3 className="text-lg font-semibold text-primary">What do you want to do?</h3>
      
      {/* Category Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {ACTIVITY_CATEGORIES.map((category) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(category.name)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${activeCategory === category.name
                ? 'bg-primary text-white'
                : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
              }
            `}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Activity Grid */}
      <div className="grid grid-cols-2 gap-3">
        {activeActivities.map((activity) => (
          <button
            key={activity.name}
            onClick={() => onSelectActivity(activity)}
            className={`
              p-4 rounded-xl text-center transition-all duration-150 hover:scale-[1.02]
              ${selectedActivity?.name === activity.name
                ? 'bg-primary text-white shadow-md border-2 border-primary'
                : 'bg-bg-secondary hover:bg-bg-tertiary border-2 border-transparent hover:border-primary/20'
              }
            `}
          >
            <div className="text-2xl mb-2">{activity.emoji}</div>
            <div className="font-medium text-sm mb-1">{activity.name}</div>
            <div className="text-xs opacity-75">{activity.duration}min</div>
          </button>
        ))}
      </div>
      
      {/* Emotional Signal Section */}
      <div className="border-t border-custom pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-primary">Vibe check (optional)</h4>
          {selectedSignal && (
            <button
              onClick={() => onSelectSignal(null)}
              className="text-xs text-text-muted hover:text-primary"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {EMOTIONAL_SIGNALS.map((signal) => (
            <button
              key={signal.label}
              onClick={() => onSelectSignal(selectedSignal?.label === signal.label ? null : signal)}
              className={`
                p-3 rounded-lg text-left transition-all duration-150
                ${selectedSignal?.label === signal.label
                  ? 'shadow-md border-2'
                  : 'bg-bg-secondary hover:bg-bg-tertiary border-2 border-transparent'
                }
              `}
              style={{
                backgroundColor: selectedSignal?.label === signal.label ? `${signal.color}15` : undefined,
                borderColor: selectedSignal?.label === signal.label ? signal.color : undefined
              }}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{signal.emoji}</span>
                <span className="font-medium text-sm">{signal.label}</span>
              </div>
              <div className="text-xs text-text-muted">{signal.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivitySelection;
