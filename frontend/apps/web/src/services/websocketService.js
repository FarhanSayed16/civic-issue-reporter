// File: src/services/websocketService.js

class WebSocketService {
  constructor() {
    this.ws = null;
    this.userId = null;
    this.token = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnecting = false;
    
    // Simple event emitter implementation
    this.events = {};
  }

  // Simple event emitter methods
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args));
    }
  }

  // Initialize WebSocket connection
  async connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      // Get token from localStorage
      this.token = localStorage.getItem('accessToken');
      if (!this.token) {
        console.error('No access token found');
        this.isConnecting = false;
        return;
      }

      // Extract user ID from JWT token
      this.userId = this.extractUserIdFromToken(this.token);
      if (!this.userId) {
        console.error('Could not extract user ID from token');
        this.isConnecting = false;
        return;
      }

      // Create WebSocket connection
      const wsUrl = `ws://localhost:8585/notifications/ws/updates/${this.userId}?token=${this.token}`;
      console.log('Connecting to WebSocket:', wsUrl);
      console.log('User ID:', this.userId);
      console.log('Token length:', this.token.length);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.error('WebSocket readyState:', this.ws.readyState);
        this.isConnecting = false;
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.isConnecting = false;
    }
  }

  // Extract user ID from JWT token
  extractUserIdFromToken(token) {
    try {
      console.log('Extracting user ID from token:', token.substring(0, 20) + '...');
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT token format');
        return null;
      }
      
      const payload = parts[1];
      const paddedPayload = payload.padEnd((payload.length + 3) & ~3, '=');
      const decodedPayload = atob(paddedPayload);
      const payloadJson = JSON.parse(decodedPayload);
      
      console.log('JWT payload:', payloadJson);
      const userId = payloadJson.sub ? parseInt(payloadJson.sub) : null;
      console.log('Extracted user ID:', userId);
      
      return userId;
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
      return null;
    }
  }

  // Handle incoming WebSocket messages
  handleMessage(data) {
    console.log('WebSocket message received:', data);
    
    // Handle different message types
    if (data.type === 'new_message') {
      this.emit('new_message', data);
    } else if (data.type === 'notification') {
      this.emit('notification', data);
    } else if (data.type === 'issue_update') {
      this.emit('issue_update', data);
    } else {
      // Generic message
      this.emit('message', data);
    }
  }

  // Schedule reconnection
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.ws && this.ws.readyState === WebSocket.CLOSED) {
        this.connect();
      }
    }, delay);
  }

  // Send message through WebSocket
  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event callback:', error);
        }
      });
    }
  }

  // Get connection status
  get isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // Get user ID
  get currentUserId() {
    return this.userId;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
