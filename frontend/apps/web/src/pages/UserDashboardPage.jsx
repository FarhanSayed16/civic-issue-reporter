import React, { useState } from 'react';
import { useGetMyAssignedIssuesQuery, useUpdateIssueMutation, useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '@/features/api/admin.api';
import { useGetIssueMessagesQuery, useSendMessageMutation, useMarkMessagesAsReadMutation } from '@/features/api/messages.api';
import { useWebSocket, useChatWebSocket, useNotificationWebSocket } from '@/hooks/useWebSocket';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, CheckCircle2, Hourglass, Ban, RefreshCw, Bell, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Chat Modal Component
function ChatModal({ issue, onClose, onSendMessage, newMessage, setNewMessage }) {
  // Use WebSocket for real-time messages
  const { isConnected, addEventListener, removeEventListener } = useWebSocket();
  const { data: initialMessages, isLoading: messagesLoading, error: messagesError } = useGetIssueMessagesQuery(issue.id);
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markMessagesAsRead] = useMarkMessagesAsReadMutation();
  
  // Combined message state (API + WebSocket)
  const [messages, setMessages] = React.useState([]);
  
  // Auto-scroll functionality
  const messagesEndRef = React.useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Auto-scroll when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Debug logging
  React.useEffect(() => {
    console.log('Messages API Debug:', {
      issueId: issue.id,
      initialMessages,
      messagesLoading,
      messagesError,
      messages
    });
  }, [issue.id, initialMessages, messagesLoading, messagesError, messages]);

  // Initialize messages from API
  React.useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      console.log('Loading initial messages:', initialMessages);
      // Sort messages by creation time (oldest first, newest at bottom)
      const sortedMessages = [...initialMessages].sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );
      setMessages(sortedMessages);
    }
  }, [initialMessages]);

  // Handle WebSocket messages
  React.useEffect(() => {
    const handleNewMessage = (data) => {
      console.log('WebSocket message received:', data);
      if (data.type === 'new_message' && data.issue_id === issue.id) {
        const newMessage = {
          id: data.id || Date.now(),
          message: data.message,
          is_admin_message: data.sender === 'admin',
          created_at: data.timestamp || new Date().toISOString(),
          sender_name: data.sender === 'admin' ? 'You' : (issue.reporter_name || 'Anonymous')
        };
        
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          
          // Add new message and sort to maintain chronological order
          const updatedMessages = [...prev, newMessage];
          return updatedMessages.sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
          );
        });
      }
    };

    addEventListener('new_message', handleNewMessage);
    
    return () => {
      removeEventListener('new_message');
    };
  }, [issue.id, addEventListener, removeEventListener]);

  // Mark messages as read when modal opens
  React.useEffect(() => {
    if (issue.id) {
      markMessagesAsRead(issue.id);
    }
  }, [issue.id, markMessagesAsRead]);

  // Clear messages when modal closes
  React.useEffect(() => {
    return () => {
      setMessages([]);
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      // Optimistically add message to local state
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        message: newMessage.trim(),
        is_admin_message: true, // Assuming current user is admin
        created_at: new Date().toISOString(),
        sender_name: 'You'
      };
      setMessages(prev => {
        const updatedMessages = [...prev, optimisticMessage];
        return updatedMessages.sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        );
      });
      
      // Send to server
      await sendMessage({
        issueId: issue.id,
        message: newMessage.trim()
      }).unwrap();
      
      setNewMessage('');
      
      // Call parent callback if provided
      if (onSendMessage) {
        onSendMessage(newMessage.trim());
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      // Remove the optimistically added message on error
      setMessages(prev => {
        const updatedMessages = prev.slice(0, -1);
        return updatedMessages.sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        );
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col">
            <CardTitle>Chat - Environmental Report #{issue.id}</CardTitle>
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Reporter:</span> {issue.reporter_name || 'Anonymous'}
              {issue.reporter_id && (
                <span className="ml-2 text-gray-500">(ID: {issue.reporter_id})</span>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Issue Info Bar */}
          <div className="bg-gray-50 p-3 rounded-lg border">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Issue:</span>
                <span className="text-gray-600 ml-1">{issue.description?.substring(0, 50)}...</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Category:</span>
                <span className="text-gray-600 ml-1">{issue.category}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                  issue.status === 'new' ? 'bg-blue-100 text-blue-800' : 
                  issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                  issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  issue.status === 'spam' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {issue.status === 'new' ? 'Reported' : 
                   issue.status === 'in_progress' ? 'Cleanup In Progress' : 
                   issue.status === 'resolved' ? 'Cleaned Up' : 
                   issue.status === 'spam' ? 'Spam' : issue.status}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Priority:</span>
                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                  issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                  issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  issue.priority === 'low' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {issue.priority}
                </span>
              </div>
            </div>
          </div>

          <div className="h-64 overflow-y-auto border rounded p-3 space-y-2">
            {/* Connection Status */}
            <div className={`text-xs text-center py-1 rounded ${
              isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected - Check console for details'}
            </div>
            
            {messagesLoading ? (
              <div className="flex justify-center items-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.is_admin_message ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs p-3 rounded-lg ${
                    message.is_admin_message 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold opacity-80">
                        {message.is_admin_message ? 'You' : (issue.reporter_name || 'Anonymous')}
                      </span>
                      {!message.is_admin_message && issue.reporter_id && (
                        <span className="text-xs opacity-60">(ID: {issue.reporter_id})</span>
                      )}
                    </div>
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                No messages yet. Start the conversation!
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border rounded-md"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
            />
            <Button onClick={handleSendMessage} disabled={isSending}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UserDashboardPage() {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedIssueForDetails, setSelectedIssueForDetails] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [issueToResolve, setIssueToResolve] = useState(null);

  // Global WebSocket notifications
  const { notifications: wsNotifications, isConnected: wsConnected } = useNotificationWebSocket();
  const [isChatModalOpen, setIsChatModalOpen] = React.useState(false);

  // Show toast notifications for new WebSocket messages only when chat is not open
  React.useEffect(() => {
    if (wsNotifications && wsNotifications.length > 0 && !isChatModalOpen) {
      const latestNotification = wsNotifications[wsNotifications.length - 1];
      if (!latestNotification.read) {
        toast.info(latestNotification.message, {
          action: {
            label: 'View',
            onClick: () => setShowNotificationModal(true)
          }
        });
      }
    }
  }, [wsNotifications, isChatModalOpen]);

  const { data: issues, isLoading, error, refetch } = useGetMyAssignedIssuesQuery({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    priority: priorityFilter || undefined,
  });

  // Debug logging
  React.useEffect(() => {
    console.log('UserDashboardPage - Issues data:', issues);
    console.log('UserDashboardPage - Loading:', isLoading);
    console.log('UserDashboardPage - Error:', error);
  }, [issues, isLoading, error]);
  const { data: notifications, refetch: refetchNotifications } = useGetNotificationsQuery();
  const [updateIssue] = useUpdateIssueMutation();
  const [sendMessage] = useSendMessageMutation();
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead] = useMarkAllNotificationsReadMutation();

  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      await updateIssue({ issueId, issueUpdate: { status: newStatus } }).unwrap();
      toast.success(`Environmental Report #${issueId} status updated to ${newStatus.replace('_', ' ')}`);
      refetch();
    } catch (error) {
      toast.error(`Failed to update environmental report #${issueId}: ${error.data?.detail || error.message}`);
    }
  };

  const handleResolveClick = (issue) => {
    setIssueToResolve(issue);
    setShowResolveConfirm(true);
  };

  const confirmResolve = () => {
    if (issueToResolve) {
      handleStatusUpdate(issueToResolve.id, 'resolved');
      setShowResolveConfirm(false);
      setIssueToResolve(null);
    }
  };

  const statusBadge = (status) => {
    const statusMap = {
      new: 'bg-blue-500 text-white',
      in_progress: 'bg-yellow-500 text-white',
      resolved: 'bg-green-500 text-white',
      spam: 'bg-red-500 text-white',
      default: 'bg-gray-400 text-white',
    };
    const className = statusMap[status] || statusMap.default;
    const statusLabelMap = {
      'new': 'Reported',
      'in_progress': 'Cleanup In Progress',
      'resolved': 'Cleaned Up',
      'spam': 'Spam'
    };
    const formattedStatus = statusLabelMap[status] || (status || '').replace('_', ' ').replace(/^./, c => c.toUpperCase());
    return <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{formattedStatus}</Badge>;
  };

  const priorityBadge = (priority) => {
    const priorityMap = {
      high: 'bg-red-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-green-500 text-white',
      default: 'bg-gray-400 text-white',
    };
    const className = priorityMap[priority] || priorityMap.default;
    const formattedPriority = (priority || 'medium').toUpperCase();
    return <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{formattedPriority}</Badge>;
  };

  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId).unwrap();
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllNotificationsRead().unwrap();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-800">My Assigned Issues</h1>
          {/* WebSocket Connection Status */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
            wsConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`} onClick={() => window.location.reload()}>
            {wsConnected ? '🟢 Live' : '🔴 Offline - Click to reconnect'}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setShowNotificationModal(true)} variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            {unreadNotifications > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Button>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>


      {/* Issues List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800">My Assigned Environmental Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Filter by Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Open Garbage Dump">Open Garbage Dump</SelectItem>
                <SelectItem value="Plastic Pollution">Plastic Pollution</SelectItem>
                <SelectItem value="Open Burning">Open Burning</SelectItem>
                <SelectItem value="Water Body Pollution">Water Body Pollution</SelectItem>
                <SelectItem value="Construction Waste">Construction Waste</SelectItem>
                <SelectItem value="Electronic Waste (E-Waste)">Electronic Waste (E-Waste)</SelectItem>
                <SelectItem value="Biomedical Waste">Biomedical Waste</SelectItem>
                <SelectItem value="Green Space Degradation">Green Space Degradation</SelectItem>
                <SelectItem value="Drainage Blockage">Drainage Blockage</SelectItem>
                <SelectItem value="Water Pollution / Contaminated Water">Water Pollution / Contaminated Water</SelectItem>
                <SelectItem value="Garbage Overflow">Garbage Overflow</SelectItem>
                <SelectItem value="Illegal Dumping / Litter">Illegal Dumping / Litter</SelectItem>
                <SelectItem value="Other Environmental Issues">Other Environmental Issues</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Filter by Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : !issues || issues.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
              <CheckCircle2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">No environmental reports assigned to you</p>
              <p className="text-sm text-gray-500">All clear! No reports need your attention at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {issues.map((issue) => (
                <Card key={issue.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">Environmental Report #{issue.id}</h3>
                        {statusBadge(issue.status)}
                        {priorityBadge(issue.priority)}
                      </div>
                      <p className="text-sm text-slate-600">{issue.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Category: {issue.category}</span>
                        <span>Department: {issue.assigned_department}</span>
                        <span>Reporter: {issue.reporter_name || 'Anonymous'}</span>
                        <span>Upvotes: {issue.upvote_count}</span>
                        <span>Reported: {new Date(issue.created_at).toLocaleDateString()}</span>
                      </div>
                      {issue.address_line1 && (
                        <div className="text-xs text-slate-500">
                          <span className="font-medium">Address:</span> {issue.address_line1}
                          {issue.address_line2 && `, ${issue.address_line2}`}
                          {issue.street && `, ${issue.street}`}
                          {issue.landmark && ` (${issue.landmark})`}
                          {issue.pincode && ` - ${issue.pincode}`}
                        </div>
                      )}
                      {issue.media_urls && issue.media_urls.length > 0 && (
                        <div className="text-xs text-slate-500">
                          <span className="font-medium">Media:</span> {issue.media_urls.length} file(s) attached
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {issue.status === 'new' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(issue.id, 'in_progress')}>
                          <Hourglass className="h-4 w-4 mr-2" /> Start Work
                        </Button>
                      )}
                      {issue.status === 'in_progress' && (
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleResolveClick(issue)}>
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Cleaned Up
                        </Button>
                      )}
                      {issue.status !== 'spam' && (
                        <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(issue.id, 'spam')}>
                          <Ban className="h-4 w-4 mr-2" /> Mark Spam
                        </Button>
                      )}
                      {issue.status === 'resolved' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(issue.id, 'in_progress')}>
                          <RefreshCw className="h-4 w-4 mr-2" /> Reopen
                        </Button>
                      )}
                      {issue.status === 'spam' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(issue.id, 'new')}>
                          <RefreshCw className="h-4 w-4 mr-2" /> Restore
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setSelectedIssue(issue);
                          setIsChatModalOpen(true);
                        }}
                        className="flex items-center gap-1"
                      >
                        <MessageCircle className="h-3 w-3" />
                        Chat
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setSelectedIssueForDetails(issue)}
                        className="flex items-center gap-1"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Modal */}
        {selectedIssue && (
          <ChatModal
            issue={selectedIssue}
            onClose={() => {
              setSelectedIssue(null);
              setIsChatModalOpen(false);
            }}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
          />
        )}

      {/* Details Modal */}
      {selectedIssueForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Issue Details - #{selectedIssueForDetails.id}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedIssueForDetails(null)}>
                Close
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    {statusBadge(selectedIssueForDetails.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Priority:</span>
                    {priorityBadge(selectedIssueForDetails.priority)}
                  </div>
                  <div><span className="font-medium">Category:</span> {selectedIssueForDetails.category}</div>
                  <div><span className="font-medium">Department:</span> {selectedIssueForDetails.assigned_department}</div>
                  <div><span className="font-medium">Reporter:</span> {selectedIssueForDetails.reporter_name || 'Anonymous'}</div>
                  <div><span className="font-medium">Assigned Admin:</span> {selectedIssueForDetails.assigned_admin_name || 'Not assigned'}</div>
                  <div><span className="font-medium">Upvotes:</span> {selectedIssueForDetails.upvote_count}</div>
                  <div><span className="font-medium">Reported:</span> {new Date(selectedIssueForDetails.created_at).toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  {selectedIssueForDetails.address_line1 && (
                    <div><span className="font-medium">Address:</span> {selectedIssueForDetails.address_line1}
                      {selectedIssueForDetails.address_line2 && `, ${selectedIssueForDetails.address_line2}`}
                      {selectedIssueForDetails.street && `, ${selectedIssueForDetails.street}`}
                      {selectedIssueForDetails.landmark && ` (${selectedIssueForDetails.landmark})`}
                      {selectedIssueForDetails.pincode && ` - ${selectedIssueForDetails.pincode}`}
                    </div>
                  )}
                  {selectedIssueForDetails.media_urls && selectedIssueForDetails.media_urls.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-medium">Media Files:</span>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedIssueForDetails.media_urls.map((url, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={url} 
                              alt={`Media ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div 
                              className="w-full h-24 bg-gray-100 rounded border flex items-center justify-center text-gray-500 text-sm"
                              style={{ display: 'none' }}
                            >
                              Failed to load
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div><span className="font-medium">Location:</span> {selectedIssueForDetails.lat}, {selectedIssueForDetails.lng}</div>
                </div>
              </div>
              <div>
                <span className="font-medium">Description:</span>
                <p className="mt-1 text-sm text-slate-600">{selectedIssueForDetails.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resolve Confirmation Dialog */}
      {showResolveConfirm && issueToResolve && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Confirm Resolution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Are you sure you want to mark Environmental Report #{issueToResolve.id} as cleaned up/remediated?</p>
              <p className="text-sm text-slate-600">
                This will notify the user and increase their eco-score by 10 points.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowResolveConfirm(false)}>
                  Cancel
                </Button>
                <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={confirmResolve}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Resolve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                All Notifications
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowNotificationModal(false)}>
                Close
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 overflow-y-auto">
              {notifications && notifications.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">
                      {unreadNotifications} unread notifications
                    </span>
                    {unreadNotifications > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleMarkAllNotificationsRead}
                      >
                        Mark All Read
                      </Button>
                    )}
                  </div>
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-3 rounded-lg border ${
                        notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{notification.message}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleMarkNotificationRead(notification.id)}
                            className="ml-2"
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No notifications yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
