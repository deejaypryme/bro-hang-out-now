
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Plus, Trash2, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { availabilityService, type UserAvailability, type CreateAvailabilitySlot } from '@/services/availabilityService';
import { useToast } from '@/hooks/use-toast';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

interface AvailabilitySlot extends CreateAvailabilitySlot {
  id?: string;
}

const AvailabilitySettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availability, setAvailability] = useState<UserAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local state for editing
  const [editingSlots, setEditingSlots] = useState<{ [dayOfWeek: number]: AvailabilitySlot[] }>({});

  useEffect(() => {
    if (user) {
      loadAvailability();
    }
  }, [user]);

  const loadAvailability = async () => {
    if (!user) return;
    
    try {
      const data = await availabilityService.getUserAvailability(user.id);
      setAvailability(data);
      
      // Group by day of week for editing
      const grouped: { [dayOfWeek: number]: AvailabilitySlot[] } = {};
      data.forEach(slot => {
        if (!grouped[slot.day_of_week]) {
          grouped[slot.day_of_week] = [];
        }
        grouped[slot.day_of_week].push({
          id: slot.id,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_recurring: slot.is_recurring
        });
      });
      setEditingSlots(grouped);
    } catch (error) {
      console.error('Error loading availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = (dayOfWeek: number) => {
    const newSlot: AvailabilitySlot = {
      day_of_week: dayOfWeek,
      start_time: '09:00',
      end_time: '17:00',
      is_recurring: true
    };

    setEditingSlots(prev => ({
      ...prev,
      [dayOfWeek]: [...(prev[dayOfWeek] || []), newSlot]
    }));
  };

  const updateTimeSlot = (dayOfWeek: number, index: number, field: keyof AvailabilitySlot, value: any) => {
    setEditingSlots(prev => ({
      ...prev,
      [dayOfWeek]: prev[dayOfWeek]?.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      ) || []
    }));
  };

  const removeTimeSlot = (dayOfWeek: number, index: number) => {
    setEditingSlots(prev => ({
      ...prev,
      [dayOfWeek]: prev[dayOfWeek]?.filter((_, i) => i !== index) || []
    }));
  };

  const saveAvailability = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Delete all existing availability for the user
      const existingSlots = await availabilityService.getUserAvailability(user.id);
      for (const slot of existingSlots) {
        await availabilityService.deleteAvailabilitySlot(slot.id);
      }

      // Create new availability slots
      for (const [dayOfWeek, slots] of Object.entries(editingSlots)) {
        for (const slot of slots) {
          await availabilityService.createAvailabilitySlot(user.id, {
            day_of_week: parseInt(dayOfWeek),
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_recurring: slot.is_recurring
          });
        }
      }

      await loadAvailability();
      
      toast({
        title: "Success",
        description: "Availability settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Error",
        description: "Failed to save availability settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p>Loading availability settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Availability Settings</h1>
          <p className="text-gray-600">Set your weekly availability for hangouts</p>
        </div>
        <Button 
          onClick={saveAvailability} 
          disabled={saving}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6">
        {DAYS_OF_WEEK.map((dayName, dayOfWeek) => (
          <Card key={dayOfWeek}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>{dayName}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addTimeSlot(dayOfWeek)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Time
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingSlots[dayOfWeek]?.length > 0 ? (
                <div className="space-y-3">
                  {editingSlots[dayOfWeek].map((slot, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`start-${dayOfWeek}-${index}`} className="text-sm font-medium">
                          From:
                        </Label>
                        <Input
                          id={`start-${dayOfWeek}-${index}`}
                          type="time"
                          value={slot.start_time}
                          onChange={(e) => updateTimeSlot(dayOfWeek, index, 'start_time', e.target.value)}
                          className="w-32"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`end-${dayOfWeek}-${index}`} className="text-sm font-medium">
                          To:
                        </Label>
                        <Input
                          id={`end-${dayOfWeek}-${index}`}
                          type="time"
                          value={slot.end_time}
                          onChange={(e) => updateTimeSlot(dayOfWeek, index, 'end_time', e.target.value)}
                          className="w-32"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={slot.is_recurring}
                          onCheckedChange={(checked) => updateTimeSlot(dayOfWeek, index, 'is_recurring', checked)}
                        />
                        <Label className="text-sm">Recurring</Label>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(dayOfWeek, index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No availability set for {dayName}. Click "Add Time" to set your available hours.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AvailabilitySettings;
