import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import type { FriendWithProfile } from '@/types/database';

interface FriendProfileNotesProps {
  friend: FriendWithProfile;
  notes: string;
  setNotes: (notes: string) => void;
  onSaveNotes: () => void;
  loading: boolean;
}

export const FriendProfileNotes: React.FC<FriendProfileNotesProps> = ({ 
  friend, 
  notes, 
  setNotes, 
  onSaveNotes, 
  loading 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        placeholder="Add personal notes about this friend..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />
      <Button 
        onClick={onSaveNotes} 
        disabled={loading || notes === friend.notes}
        size="sm"
        className="w-full"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Notes
      </Button>
    </div>
  );
};