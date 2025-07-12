// Centralized Backend Configuration
// Automatically detects and uses the appropriate backend URL

import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend endpoints
const ENDPOINTS = {
  PRODUCTION: 'https://talkora-private-chat.up.railway.app',
  LOCALHOST: 'http://localhost:3000',
  LOCAL_IP: 'http://192.168.3.58:3000',
};

// Check if localhost backend is running
const checkLocalhostAvailability = async () => {
  if (!__DEV__) return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(`${ENDPOINTS.LOCALHOST}/api/auth/check`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    // If we get any response (even 401), localhost is running
    return response.status !== undefined;
  } catch (error) {
    // Network error means localhost is not available
    console.log('📡 Localhost backend not available, using fallback');
    return false;
  }
};

// Check if local IP backend is running
const checkLocalIPAvailability = async () => {
  if (!__DEV__) return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(`${ENDPOINTS.LOCAL_IP}/api/auth/check`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    // If we get any response (even 401), local IP is running
    return response.status !== undefined;
  } catch (error) {
    // Network error means local IP is not available
    console.log('📡 Local IP backend not available, using fallback');
    return false;
  }
};

// Smart backend URL detection
const getBackendUrl = async () => {
  // Check for manual preference first
  try {
    const manualPreference = await AsyncStorage.getItem('backend_preference');
    if (manualPreference && manualPreference !== 'auto') {
      console.log('🔧 Using manual backend preference:', manualPreference);
      
      switch (manualPreference) {
        case 'localhost':
          return ENDPOINTS.LOCALHOST;
        case 'local_ip':
          return ENDPOINTS.LOCAL_IP;
        case 'production':
          return ENDPOINTS.PRODUCTION;
        default:
          // Continue with auto-detection
          break;
      }
    }
  } catch (error) {
    console.log('📡 No manual preference found, using auto-detection');
  }
  
  // If in production build, always use production
  if (!__DEV__) {
    console.log('🚀 Production build detected, using production backend');
    return ENDPOINTS.PRODUCTION;
  }
  
  console.log('🔍 Auto-detecting available backend...');
  
  // For web development
  if (typeof window !== 'undefined' && window.location) {
    const currentHost = window.location.hostname;
    
    // If accessing from localhost, prefer localhost backend
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      const isLocalhostAvailable = await checkLocalhostAvailability();
      if (isLocalhostAvailable) {
        console.log('✅ Localhost backend is running, using localhost');
        return ENDPOINTS.LOCALHOST;
      }
    }
  }
  
  // Try localhost first (for mobile development and fallback)
  const isLocalhostAvailable = await checkLocalhostAvailability();
  if (isLocalhostAvailable) {
    console.log('✅ Localhost backend is running, using localhost');
    return ENDPOINTS.LOCALHOST;
  }
  
  // Try local IP next
  const isLocalIPAvailable = await checkLocalIPAvailability();
  if (isLocalIPAvailable) {
    console.log('✅ Local IP backend is running, using local IP');
    return ENDPOINTS.LOCAL_IP;
  }
  
  // Fallback to production
  console.log('📡 No local backend available, falling back to production');
  return ENDPOINTS.PRODUCTION;
};

// Initialize backend URL (async)
let cachedBackendUrl = null;
let isInitializing = false;

const initializeBackendUrl = async () => {
  if (cachedBackendUrl || isInitializing) {
    return cachedBackendUrl || ENDPOINTS.PRODUCTION; // Return cached or fallback
  }
  
  isInitializing = true;
  
  try {
    cachedBackendUrl = await getBackendUrl();
    console.log('🎯 Backend URL initialized:', cachedBackendUrl);
  } catch (error) {
    console.error('❌ Error initializing backend URL:', error);
    cachedBackendUrl = ENDPOINTS.PRODUCTION; // Fallback to production
  } finally {
    isInitializing = false;
  }
  
  return cachedBackendUrl;
};

// Synchronous getter for immediate use (uses cached value or fallback)
const getBackendUrlSync = () => {
  if (cachedBackendUrl) {
    return cachedBackendUrl;
  }
  
  // If not initialized yet, start initialization and return fallback
  initializeBackendUrl();
  
  // Return intelligent fallback based on environment
  if (!__DEV__) {
    return ENDPOINTS.PRODUCTION;
  }
  
  // For development, prefer localhost if we're on web localhost, otherwise production
  if (typeof window !== 'undefined' && window.location) {
    const currentHost = window.location.hostname;
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      return ENDPOINTS.LOCALHOST;
    }
  }
  
  return ENDPOINTS.PRODUCTION; // Safe fallback
};

// Export configuration with both sync and async capabilities
export const BackendConfig = {
  // Synchronous getters (use cached values or intelligent fallbacks)
  get BASE_URL() {
    return getBackendUrlSync();
  },
  
  get API_BASE_URL() {
    return `${this.BASE_URL}/api`;
  },
  
  get SOCKET_URL() {
    return this.BASE_URL;
  },
  
  // Async getters for when you need the most accurate detection
  async getBaseURL() {
    return await initializeBackendUrl();
  },
  
  async getAPIURL() {
    const baseUrl = await this.getBaseURL();
    return `${baseUrl}/api`;
  },
  
  async getSocketURL() {
    return await this.getBaseURL();
  },
  
  // Helper methods
  isLocal() {
    const url = this.BASE_URL;
    return url.includes('localhost') || url.includes('192.168') || url.includes('10.');
  },
  
  isProduction() {
    const url = this.BASE_URL;
    return url.includes('talkora-private-chat.up.railway.app');
  },
  
  // Force refresh backend detection
  async refresh() {
    cachedBackendUrl = null;
    return await initializeBackendUrl();
  },
  
  // Manually set backend preference
  async setPreference(preference) {
    try {
      await AsyncStorage.setItem('backend_preference', preference);
      console.log('🔧 Backend preference set to:', preference);
      // Clear cache to force re-detection
      cachedBackendUrl = null;
    } catch (error) {
      console.error('❌ Error setting backend preference:', error);
    }
  },
  
  // Get available endpoints
  getEndpoints() {
    return ENDPOINTS;
  },
  
  // Test connectivity to all backends
  async testConnectivity() {
    console.log('🔍 Testing connectivity to all backends...');
    
    const results = {
      localhost: false,
      localIP: false,
      production: true, // Assume production is always available
    };
    
    try {
      results.localhost = await checkLocalhostAvailability();
      results.localIP = await checkLocalIPAvailability();
    } catch (error) {
      console.error('❌ Error testing connectivity:', error);
    }
    
    console.log('📊 Connectivity results:', results);
    return results;
  }
};

// Initialize backend detection on app start
initializeBackendUrl().then((url) => {
  console.log('🎯 Backend auto-detection completed:', url);
  console.log('🔧 Backend Configuration initialized:', {
    isDev: __DEV__,
    baseUrl: url,
    apiUrl: `${url}/api`,
    socketUrl: url,
    isLocal: url.includes('localhost') || url.includes('192.168') || url.includes('10.'),
    isProduction: url.includes('talkora-private-chat.up.railway.app')
  });
}).catch((error) => {
  console.error('❌ Failed to initialize backend configuration:', error);
});

export default BackendConfig;
