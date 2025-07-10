// Centralized Backend Configuration
// Automatically detects and uses the appropriate backend URL

const getBackendUrl = () => {
  // Production URL - always use this in production builds
  const PRODUCTION_URL = 'https://talkora-private-chat.up.railway.app';
  
  // Development URLs
  const LOCAL_IP = '192.168.3.58'; // Your local IP - update this as needed
  const LOCALHOST = 'localhost';
  const LOCAL_PORT = '3000';
  
  // Check if we're in production mode
  if (!__DEV__) {
    return PRODUCTION_URL;
  }
  
  // In development mode, try to detect the best URL
  if (typeof window !== 'undefined' && window.location) {
    // Web development
    const currentHost = window.location.hostname;
    
    // If accessing from localhost, use localhost backend
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      return `http://localhost:${LOCAL_PORT}`;
    }
    
    // If accessing from local IP, use local IP backend
    if (currentHost.startsWith('192.168.') || currentHost.startsWith('10.')) {
      return `http://${currentHost}:${LOCAL_PORT}`;
    }
  }
  
  // Mobile development - use local IP by default
  return `http://${LOCAL_IP}:${LOCAL_PORT}`;
};

// Get base URLs
const BASE_URL = getBackendUrl();
const API_BASE_URL = `${BASE_URL}/api`;
const SOCKET_URL = BASE_URL;

// Export configuration
export const BackendConfig = {
  BASE_URL,
  API_BASE_URL,
  SOCKET_URL,
  
  // Helper to check if using local backend
  isLocal: () => {
    return BASE_URL.includes('localhost') || BASE_URL.includes('192.168') || BASE_URL.includes('10.');
  },
  
  // Helper to check if using production backend
  isProduction: () => {
    return BASE_URL.includes('talkora-private-chat.up.railway.app');
  },
  
  // Update local IP if needed (for dynamic IP changes)
  updateLocalIP: (newIP) => {
    if (__DEV__) {
      console.log(`Updating local IP from ${LOCAL_IP} to ${newIP}`);
      // This would require a app restart to take effect
      // You could store this in AsyncStorage for persistence
    }
  }
};

// Log current configuration
console.log('🔧 Backend Configuration:', {
  isDev: __DEV__,
  baseUrl: BASE_URL,
  apiUrl: API_BASE_URL,
  socketUrl: SOCKET_URL,
  isLocal: BackendConfig.isLocal(),
  isProduction: BackendConfig.isProduction()
});

export default BackendConfig;
