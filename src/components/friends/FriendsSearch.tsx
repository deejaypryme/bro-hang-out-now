import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface FriendsSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const FriendsSearch = ({ searchQuery, onSearchChange }: FriendsSearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-bro-md top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
      <Input
        placeholder="Search friends..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-12 h-12 glass-surface border-white/20 focus:border-accent-orange focus:ring-accent-orange/20 text-primary-navy placeholder:text-text-secondary"
      />
    </div>
  );
};

export default FriendsSearch;