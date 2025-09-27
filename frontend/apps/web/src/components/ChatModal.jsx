// File: src/components/ChatModal.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { X, Send, MessageCircle, User, Shield } from 'lucide-react';
import { useGetIssueMessagesQuery, useSendMessageMutation, useMarkMessagesAsReadMutation } from '../features/api/messages.api';

const ChatModal = ({ issue, onClose, onSendMessage, newMessage, setNewMessage }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  const { data: messages = [], refetch: refetchMessages } = useGetIssueMessagesQuery(issue.id);
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markMessagesAsRead] = useMarkMessagesAsReadMutation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when modal opens
  useEffect(() => {
    if (issue.id) {
      markMessagesAsRead(issue.id);
    }
  }, [issue.id, markMessagesAsRead]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    try {
      await sendMessage({
        issueId: issue.id,
        message: message.trim()
      }).unwrap();
      
      setMessage('');
      refetchMessages(); // Refresh messages
      
      // Call parent callback if provided
      if (onSendMessage) {
        onSendMessage(message.trim());
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Chat - Issue #{issue.id}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Category: {issue.category}</span>
                <Badge variant="outline" className="text-xs">
                  {issue.status}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Issue Info Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4 text-gray-500" />
                <span>Reporter: {issue.reporter_name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-gray-500" />
                <span>Admin: {issue.assigned_admin_name || 'Not assigned'}</span>
              </div>
            </div>
            <div className="text-gray-500">
              ID: {issue.reporter_id || 'N/A'}
            </div>
          </div>
        </div>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="p-4 space-y-4">
            {Object.keys(groupedMessages).length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                      {date}
                    </div>
                  </div>
                  
                  {/* Messages for this date */}
                  {dateMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_admin_message ? 'justify-end' : 'justify-start'} mb-3`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.is_admin_message
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {/* Sender name */}
                        <div className={`text-xs font-medium mb-1 ${
                          msg.is_admin_message ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {msg.is_admin_message ? 'Admin' : (issue.is_anonymous ? 'Anonymous' : issue.reporter_name)}
                        </div>
                        
                        {/* Message text */}
                        <div className="text-sm">{msg.message}</div>
                        
                        {/* Timestamp */}
                        <div className={`text-xs mt-1 ${
                          msg.is_admin_message ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isSending}
            />
            <Button type="submit" disabled={!message.trim() || isSending}>
              {isSending ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ChatModal;
