
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
    <div className="space-lg animate-slide-up">
      <div className="space-sm">
        <h3 className="heading-3 text-primary">What do you want to do?</h3>
        <p className="body text-secondary">Pick an activity that sounds fun</p>
      </div>
      
      {/* Category Tabs */}
      <div className="space-sm">
        <div className="flex overflow-x-auto gap-xs pb-xs">
          {ACTIVITY_CATEGORIES.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`
                touch-target px-md py-xs rounded-xl caption font-semibold whitespace-nowrap transition-all duration-200
                ${activeCategory === category.name
                  ? 'bg-primary text-white shadow-custom-sm'
                  : 'bg-bg-secondary text-secondary hover:bg-bg-tertiary hover:text-primary'
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Activity Grid */}
      <div className="space-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-sm">
          {activeActivities.map((activity) => (
            <button
              key={activity.name}
              onClick={() => onSelectActivity(activity)}
              className={`
                touch-target p-sm rounded-xl text-center transition-all duration-200 hover:scale-102
                ${selectedActivity?.name === activity.name
                  ? 'selected bg-primary/10 border-2 border-primary shadow-custom-md'
                  : 'card-interactive bg-bg-primary border border-default hover:border-primary/30 hover:bg-primary/5'
                }
              `}
            >
              <div className="text-2xl mb-xs">{activity.emoji}</div>
              <div className="body font-semibold mb-xs text-primary">{activity.name}</div>
              <div className="caption text-muted">{activity.duration}min</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Emotional Signal Section */}
      <div className="space-md border-t border-default pt-md">
        <div className="flex items-center justify-between mb-sm">
          <div className="space-xs">
            <h4 className="body-large font-semibold text-primary">Vibe check (optional)</h4>
            <p className="caption text-secondary">Let them know how you're feeling</p>
          </div>
          {selectedSignal && (
            <button
              onClick={() => onSelectSignal(null)}
              className="caption text-muted hover:text-primary font-medium"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
          {EMOTIONAL_SIGNALS.map((signal) => {
            const isSelected = selectedSignal?.label === signal.label;
            return (
              <button
                key={signal.label}
                onClick={() => onSelectSignal(isSelected ? null : signal)}
                className={`
                  touch-target p-sm rounded-xl text-left transition-all duration-200 border-2
                  ${isSelected
                    ? 'shadow-custom-md border-2'
                    : 'bg-bg-secondary hover:bg-bg-tertiary border-transparent hover:border-default'
                  }
                `}
                style={{
                  backgroundColor: isSelected ? `${signal.color}10` : undefined,
                  borderColor: isSelected ? signal.color : undefined
                }}
              >
                <div className="flex items-center gap-xs mb-xs">
                  <span className="text-lg">{signal.emoji}</span>
                  <span className="body font-semibold">{signal.label}</span>
                </div>
                <div className="caption text-secondary">{signal.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivitySelection;
