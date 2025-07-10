/**
 * Format last seen time for ChatHeader based on requirements:
 * - If offline for less than 1 hour: show "last seen X mins ago"
 * - If offline for 1-6 hours: show "last seen X hours ago"
 * - If offline for 6-24 hours: show "last seen at X:XX PM/AM"
 * - If offline for more than 24 hours: show "last seen at Month Day, XX:XX PM/AM"
 */
export const formatLastSeenForHeader = (lastSeen) => {
  if (!lastSeen) return 'offline';

  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

  // If less than 1 minute, show "just now"
  if (diffInMinutes < 1) {
    return 'last seen just now';
  }

  // If offline for less than 1 hour (less than 60 minutes)
  if (diffInMinutes < 60) {
    return `last seen ${diffInMinutes} mins ago`;
  }

  // If offline for 1-6 hours
  if (diffInMinutes < 360) { // 6 hours = 360 minutes
    const hours = Math.floor(diffInMinutes / 60);
    return `last seen ${hours} hours ago`;
  }

  // If offline for more than 6 hours but less than 24 hours
  if (diffInMinutes < 1440) { // 24 hours = 1440 minutes
    const hours = lastSeenDate.getHours();
    const minutes = lastSeenDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `last seen at ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  // If offline for more than 24 hours
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[lastSeenDate.getMonth()];
  const day = lastSeenDate.getDate();
  const hours = lastSeenDate.getHours();
  const minutes = lastSeenDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `last seen at ${month} ${day}, ${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

/**
 * Original formatLastSeen function (preserved for other uses)
 */
export const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return null;

  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'just now';
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} mins ago`;
  }

  if (diffInMinutes < 360) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hours ago`;
  }

  if (diffInMinutes < 1440) {
    const hours = lastSeenDate.getHours();
    const minutes = lastSeenDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[lastSeenDate.getMonth()];
  const day = lastSeenDate.getDate();
  const hours = lastSeenDate.getHours();
  const minutes = lastSeenDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${month} ${day}, ${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};