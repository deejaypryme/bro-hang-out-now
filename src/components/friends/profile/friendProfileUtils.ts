export const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'busy': return 'bg-orange-500';
    case 'away': return 'bg-yellow-500';
    default: return 'bg-gray-400';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'online': return 'Online';
    case 'busy': return 'Busy';
    case 'away': return 'Away';
    default: return 'Offline';
  }
};

export const getAvatarFallback = (name: string) => {
  return name ? name.charAt(0).toUpperCase() : '?';
};