
import React, { useState } from 'react';
import { ACTIVITY_CATEGORIES, EMOTIONAL_SIGNALS, type Activity, type EmotionalSignal, type ActivityCategory } from '../data/activities';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X, Plus } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customActivityName, setCustomActivityName] = useState('');

  // Map original category names to shorter ones
  const categoryNameMap: { [key: string]: string } = {
    "Chill Vibes": "Let's Chill",
    "Food & Drink": "Get Food", 
    "Competitive & Active": "Get Active",
    "Health & Wellness": "Fitness Time",
    "Big Plans": "Hit the Streets",
    "Short & Sweet": "Quick Hang"
  };

  const handleCategorySelect = (category: ActivityCategory) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleActivitySelect = (activity: Activity) => {
    onSelectActivity(activity);
    setShowCategoryModal(false);
    setSelectedCategory(null);
  };

  const handleBackToCategories = () => {
    setShowCategoryModal(false);
    setSelectedCategory(null);
  };

  const handleCustomActivity = () => {
    setShowCustomModal(true);
  };

  const handleCreateCustomActivity = () => {
    if (customActivityName.trim()) {
      const customActivity: Activity = {
        name: customActivityName.trim(),
        emoji: "✨",
        duration: 60,
        type: "custom",
        customizable: true
      };
      onSelectActivity(customActivity);
      setCustomActivityName('');
      setShowCustomModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">What do you want to do?</h3>
        <p className="text-sm text-gray-600">Pick an activity category that sounds fun</p>
      </div>
      
      {/* Compact Category Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ACTIVITY_CATEGORIES.map((category) => (
          <button
            key={category.name}
            onClick={() => handleCategorySelect(category)}
            className="h-20 p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-center flex flex-col items-center justify-center"
          >
            <div className="text-xl mb-1">
              {category.activities[0]?.emoji || '🎯'}
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {categoryNameMap[category.name] || category.name}
            </div>
          </button>
        ))}
        
        {/* Something Else Option */}
        <button
          onClick={handleCustomActivity}
          className="h-20 p-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-center flex flex-col items-center justify-center"
        >
          <Plus className="w-5 h-5 text-gray-500 mb-1" />
          <div className="text-sm font-semibold text-gray-700">
            Something Else
          </div>
        </button>
      </div>

      {/* Selected Activity Display */}
      {selectedActivity && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedActivity.emoji}</span>
              <div>
                <h4 className="font-semibold text-gray-900">{selectedActivity.name}</h4>
                <p className="text-sm text-gray-600">{selectedActivity.duration} minutes</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectActivity(null as any)}
              className="text-gray-500 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
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

      {/* Category Activities Modal */}
      {showCategoryModal && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {categoryNameMap[selectedCategory.name] || selectedCategory.name}
                  </h3>
                  <p className="text-sm text-gray-600">Choose an activity</p>
                </div>
                <button
                  onClick={handleBackToCategories}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-3">
                {selectedCategory.activities.map((activity) => (
                  <button
                    key={activity.name}
                    onClick={() => handleActivitySelect(activity)}
                    className="min-h-[80px] p-3 rounded-xl text-center transition-all duration-200 border-2 bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="text-2xl mb-1">{activity.emoji}</div>
                    <div className="text-sm font-semibold mb-1 text-gray-900">{activity.name}</div>
                    <div className="text-xs text-gray-500">{activity.duration}min</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <Button
                onClick={handleBackToCategories}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Categories
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Activity Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Custom Activity</h3>
                  <p className="text-sm text-gray-600">What do you want to do?</p>
                </div>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <input
                type="text"
                placeholder="Enter activity name..."
                value={customActivityName}
                onChange={(e) => setCustomActivityName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button
                onClick={() => setShowCustomModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCustomActivity}
                disabled={!customActivityName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Activity
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitySelection;
