import AsyncStorage from "@react-native-async-storage/async-storage";
import BackendConfig from "../config/backend";

const isReactNative =
  typeof navigator !== "undefined" &&
  (navigator.product === "ReactNative" ||
    navigator.userAgent?.includes("Expo") ||
    typeof window === "undefined");

const isWeb =
  !isReactNative && typeof window !== "undefined" && window.location;

// Use centralized backend configuration
const API_BASE_URL = BackendConfig.API_BASE_URL;

class ApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds cache
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const method = options.method || "GET";
    const cacheKey = `${method}:${url}`;

    // Check cache for GET requests
    if (method === "GET" && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    // Get stored cookies for React Native
    const cookies = isReactNative
      ? await AsyncStorage.getItem("authCookies")
      : null;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(cookies && isReactNative ? { Cookie: cookies } : {}),
        ...options.headers,
      },
      // Include credentials for web, manual cookie handling for React Native
      ...(isWeb ? { credentials: "include" } : {}),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle cookies for React Native
      if (isReactNative && response.headers.get("set-cookie")) {
        const setCookieHeader = response.headers.get("set-cookie");
        await AsyncStorage.setItem("authCookies", setCookieHeader);
      }

      const contentType = response.headers.get("content-type");

      // Check if response is JSON
      let data;
      try {
        data =
          contentType && contentType.indexOf("application/json") !== -1
            ? await response.json()
            : { message: await response.text() };
      } catch (parseError) {
        console.error("API response parse error:", parseError);
        throw new Error("Failed to parse API response");
      }

      if (!response.ok) {
        throw new Error(data.message || "Network request failed");
      }

      // Cache successful GET responses
      if (method === "GET") {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }

      return data;
    } catch (error) {
      // Don't log "Unauthorized" as an error - it's expected when not logged in
      if (!error.message?.includes("Unauthorized")) {
        console.error("API Request Error:", error);
      }
      throw error;
    }
  }

  // Auth endpoints
  async signup(userData) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Cookie-based authentication - no token storage needed
    return data;
  }

  async logout() {
    const data = await this.request("/auth/logout", {
      method: "POST",
    });

    // Clear stored cookies for React Native
    if (isReactNative) {
      await AsyncStorage.removeItem("authCookies");
    }

    return data;
  }

  async resendVerification(email) {
    return this.request("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async checkAuth() {
    return this.request("/auth/check");
  }

  // Friends endpoints
  async getFriends() {
    return this.request("/friends");
  }

  async getFriendsWithMessages() {
    return this.request("/messages/users");
  }

  // Friend request endpoints
  async sendFriendRequest(userId) {
    return this.request("/friends/send-request", {
      method: "POST",
      body: JSON.stringify({ receiverId: userId }),
    });
  }

  async acceptFriendRequest(requestId) {
    return this.request(`/friends/accept/${requestId}`, {
      method: "POST",
    });
  }

  async rejectFriendRequest(requestId) {
    return this.request(`/friends/reject/${requestId}`, {
      method: "POST",
    });
  }

  async cancelFriendRequest(requestId) {
    return this.request(`/friends/cancel/${requestId}`, {
      method: "DELETE",
    });
  }

  async getIncomingRequests() {
    return this.request("/friends/requests/incoming");
  }

  async getOutgoingRequests() {
    return this.request("/friends/requests/outgoing");
  }

  async searchUsers(query) {
    return this.request(`/friends/search?query=${encodeURIComponent(query)}`);
  }

  // Online users are handled via socket, not API
  // This method is removed as it's not needed

  // Chat endpoints
  async getMessages(userId) {
    return this.request(`/messages/${userId}`);
  }

  async sendMessage(userId, messageData) {
    // Handle both text and image messages
    const payload = {};

    if (typeof messageData === "string") {
      // Text message
      payload.text = messageData;
    } else if (messageData && typeof messageData === "object") {
      // Message object
      if (messageData.text) {
        payload.text = messageData.text;
      }
      if (messageData.image) {
        payload.image = messageData.image;
      }
    }

    // Ensure we have either text or image
    if (!payload.text && !payload.image) {
      throw new Error("Message must contain either text or image");
    }

    return this.request(`/messages/send/${userId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Privacy+ - Delete all messages between users
  async deleteAllMessages(userId) {
    return this.request(`/messages/privacy/${userId}`, {
      method: "DELETE",
    });
  }

  // Delete Friend - Remove friend and all messages
  async deleteFriend(userId) {
    return this.request(`/friends/remove/${userId}`, {
      method: "DELETE",
    });
  }

  // Mark messages as read
  async markMessagesAsRead(userId) {
    return this.request(`/messages/read/${userId}`, {
      method: "PUT",
    });
  }

  // Get unread message count from a specific user
  async getUnreadMessageCount(userId) {
    return this.request(`/messages/unread/${userId}`);
  }

  // Profile related endpoints
  async updateProfile(data) {
    return this.request("/auth/update-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Update push notification token
  async updatePushToken(token) {
    return this.request("/auth/push-token", {
      method: "POST",
      body: JSON.stringify({ pushToken: token }),
    });
  }

 async getUserProfile(userId) {
    console.log('🔍 API: getUserProfile called with userId:', userId);
    try {
      const result = await this.request(`/auth/user-profile/${userId}`);
      console.log('🔍 API: getUserProfile result:', result);
      return result;
    } catch (error) {
      console.error('API getUserProfile error:', error);
      throw error;
    }
  }

  async deleteAccount() {
    return this.request("/auth/delete-account", {
      method: "DELETE",
    });
  }

  // Blocking functionality
  async blockUser(userId) {
    return this.request(`/auth/block/${userId}`, {
      method: "POST",
    });
  }

  async unblockUser(userId) {
    return this.request(`/auth/unblock/${userId}`, {
      method: "POST",
    });
  }

  async getBlockedUsers() {
    return this.request("/auth/blocked-users");
  }

  async checkBlockStatus(userId) {
    return this.request(`/auth/block-status/${userId}`);
  }

  // Last seen functionality
  async getLastSeen(userId) {
    return this.request(`/auth/last-seen/${userId}`);
  }

  // Message count functionality
  async getMessageCount(userId) {
    return this.request(`/messages/count/${userId}`);
  }

  // Friend profile with enhanced info
  async getFriendProfile(friendId) {
    return this.request(`/friends/profile/${friendId}`);
  }

  // Notification functionality
  async registerFCMToken(token, platform, deviceId) {
    return this.request("/notifications/fcm-token", {
      method: "POST",
      body: JSON.stringify({ token, platform, deviceId }),
    });
  }

  async removeFCMToken(deviceId, token) {
    return this.request("/notifications/fcm-token", {
      method: "DELETE",
      body: JSON.stringify({ deviceId, token }),
    });
  }

  async getUnreadNotifications() {
    return this.request("/notifications/unread");
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/read/${notificationId}`, {
      method: "PUT",
    });
  }

  async clearAllNotifications() {
    return this.request("/notifications/clear", {
      method: "DELETE",
    });
  }

  async testNotification(type, title, body, data) {
    return this.request("/notifications/test", {
      method: "POST",
      body: JSON.stringify({ type, title, body, data }),
    });
  }

  async getNotificationMetrics() {
    return this.request("/notifications/metrics");
  }

  // Clear cache for specific endpoint
  clearCache(endpoint) {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(endpoint)) {
        this.cache.delete(key);
      }
    });
  }

  // Clear all cache
  clearAllCache() {
    this.cache.clear();
  }
}

export default new ApiService();
