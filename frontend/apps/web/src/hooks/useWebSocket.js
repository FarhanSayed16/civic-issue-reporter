// File: src/hooks/useWebSocket.js

import { useEffect, useRef, useState } from 'react';
import websocketService from '../services/websocketService';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    console.log('useWebSocket: Initializing WebSocket connection');
    
    // Connect to WebSocket
    websocketService.connect();

    // Set up connection status listeners
    const handleConnected = () => {
      console.log('useWebSocket: Connected');
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnected = (data) => {
      console.log('useWebSocket: Disconnected', data);
      setIsConnected(false);
    };

    const handleError = (error) => {
      console.error('useWebSocket: Error', error);
      setConnectionError(error);
      setIsConnected(false);
    };

    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('error', handleError);

    // Check initial connection status
    setIsConnected(websocketService.isConnected);

    // Cleanup on unmount
    return () => {
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnected', handleDisconnected);
      websocketService.off('error', handleError);
      
      // Remove all custom listeners
      listenersRef.current.forEach((callback, event) => {
        websocketService.off(event, callback);
      });
      listenersRef.current.clear();
    };
  }, []);

  // Add event listener
  const addEventListener = (event, callback) => {
    websocketService.on(event, callback);
    listenersRef.current.set(event, callback);
  };

  // Remove event listener
  const removeEventListener = (event) => {
    const callback = listenersRef.current.get(event);
    if (callback) {
      websocketService.off(event, callback);
      listenersRef.current.delete(event);
    }
  };

  // Send message
  const sendMessage = (message) => {
    websocketService.sendMessage(message);
  };

  return {
    isConnected,
    connectionError,
    addEventListener,
    removeEventListener,
    sendMessage,
    userId: websocketService.currentUserId
  };
};

// Hook specifically for chat messages
export const useChatWebSocket = (issueId) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useWebSocket();

  useEffect(() => {
    if (!issueId) return;

    const handleNewMessage = (data) => {
      // Only handle messages for this specific issue
      if (data.issue_id === issueId) {
        setMessages(prev => [...prev, {
          id: Date.now(), // Temporary ID for new messages
          message: data.message,
          is_admin_message: data.sender === 'admin',
          created_at: data.timestamp || new Date().toISOString(),
          sender: data.sender
        }]);
      }
    };

    const handleConnectionStatus = () => {
      setIsConnected(ws.isConnected);
    };

    // Add listeners
    ws.addEventListener('new_message', handleNewMessage);
    ws.addEventListener('connected', handleConnectionStatus);
    ws.addEventListener('disconnected', handleConnectionStatus);

    // Set initial connection status
    setIsConnected(ws.isConnected);

    // Cleanup
    return () => {
      ws.removeEventListener('new_message');
      ws.removeEventListener('connected');
      ws.removeEventListener('disconnected');
    };
  }, [issueId, ws]);

  // Add a new message to the local state (optimistic update)
  const addMessage = (message) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      message: message,
      is_admin_message: false, // Assuming user is sending
      created_at: new Date().toISOString(),
      sender: 'user'
    }]);
  };

  // Clear messages (useful when switching issues)
  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isConnected,
    addMessage,
    clearMessages,
    setMessages
  };
};

// Hook for global notifications
export const useNotificationWebSocket = () => {
  const [notifications, setNotifications] = useState([]);
  const ws = useWebSocket();

  useEffect(() => {
    const handleNotification = (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: data.message,
        type: data.type,
        issue_id: data.issue_id,
        created_at: data.timestamp || new Date().toISOString(),
        read: false
      }]);
    };

    const handleNewMessage = (data) => {
      // Convert new message to notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: `New message from ${data.sender}: ${data.message}`,
        type: 'message',
        issue_id: data.issue_id,
        created_at: data.timestamp || new Date().toISOString(),
        read: false
      }]);
    };

    ws.addEventListener('notification', handleNotification);
    ws.addEventListener('new_message', handleNewMessage);

    return () => {
      ws.removeEventListener('notification');
      ws.removeEventListener('new_message');
    };
  }, [ws]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  return {
    notifications,
    clearNotifications,
    markAsRead,
    isConnected: ws.isConnected
  };
};
