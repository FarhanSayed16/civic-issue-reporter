import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  useGetAdminIssuesQuery,
  useGetNotificationsQuery 
} from '@/features/api/admin.api';
import { 
  useGetAnalyticsStatsQuery,
  useGetAnalyticsHeatmapQuery 
} from '@/features/api';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Bell,
  TrendingUp,
  MapPin,
  Calendar,
  Filter,
  Eye,
  UserCheck,
  BarChart3,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboardPage() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: departmentIssues, isLoading, refetch } = useGetAdminIssuesQuery({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    priority: priorityFilter || undefined,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const { data: analyticsStats } = useGetAnalyticsStatsQuery();
  const { data: heatmapData } = useGetAnalyticsHeatmapQuery();
  const { data: notifications } = useGetNotificationsQuery();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'spam': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      new: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      spam: 'bg-red-100 text-red-800'
    };
    const statusLabelMap = {
      'new': 'Reported',
      'in_progress': 'Cleanup In Progress',
      'resolved': 'Cleaned Up',
      'spam': 'Spam'
    };
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {statusLabelMap[status] || status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return (
      <Badge className={variants[priority] || 'bg-gray-100 text-gray-800'}>
        {priority.toUpperCase()} PRIORITY
      </Badge>
    );
  };

  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Environmental Dashboard</h1>
          <p className="text-gray-600">
            {user?.name ? `Welcome, ${user.name}. ` : ''}Monitor and manage environmental reports in your jurisdiction.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Button 
              variant="outline" 
              onClick={() => setShowNotifications(!showNotifications)}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
              {unreadNotifications > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Quick Actions:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/issues/admin')}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Assign Reports
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/issues/admin')}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Update Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/reports')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Stats */}
      {analyticsStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cleanups Completed Today</p>
                  <p className="text-xs text-gray-500 mt-0.5">Issues resolved in last 24h</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsStats.resolved_today}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-xs text-gray-500 mt-0.5">Time to action</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsStats.avg_resolution_time_hours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Action Required</p>
                  <p className="text-xs text-gray-500 mt-0.5">Reports awaiting cleanup</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsStats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reports Filed</p>
                  <p className="text-xs text-gray-500 mt-0.5">Citizens monitoring environment</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsStats.total_issues}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Department Environmental Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">Reported</SelectItem>
                  <SelectItem value="in_progress">Cleanup In Progress</SelectItem>
                  <SelectItem value="resolved">Cleaned Up</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Department Environmental Reports ({departmentIssues?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading environmental reports...</p>
            </div>
          ) : departmentIssues?.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">No environmental reports found</p>
              <p className="text-sm text-gray-500">No reports match your current filters, or be the first to report environmental issues in your area! 🍃</p>
            </div>
          ) : (
            <div className="space-y-4">
              {departmentIssues?.map((issue) => (
                <div key={issue.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(issue.status)}
                          <span className="font-semibold text-lg">Environmental Report #{issue.id}</span>
                        </div>
                        {getStatusBadge(issue.status)}
                        {getPriorityBadge(issue.priority)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Category</p>
                          <p className="font-medium">{issue.category}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Department</p>
                          <p className="font-medium">{issue.assigned_department}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Reporter</p>
                          <p className="font-medium">{issue.reporter_name || 'Anonymous'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Assigned Admin</p>
                          <p className="font-medium">{issue.assigned_admin_name || 'Not assigned'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Location</p>
                          <p className="font-medium">{issue.lat.toFixed(4)}, {issue.lng.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Upvotes</p>
                          <p className="font-medium">{issue.upvote_count}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Description</p>
                        <p className="text-gray-900">{issue.description}</p>
                      </div>

                      {issue.address_line1 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">Address</p>
                          <p className="text-gray-900">
                            {issue.address_line1}
                            {issue.address_line2 && `, ${issue.address_line2}`}
                            {issue.street && `, ${issue.street}`}
                            {issue.landmark && ` (Near ${issue.landmark})`}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Updated: {new Date(issue.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedIssue(issue)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issue Details Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Issue Details - #{selectedIssue.id}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedIssue(null)}>
                Close
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    {getStatusBadge(selectedIssue.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Priority:</span>
                    {getPriorityBadge(selectedIssue.priority)}
                  </div>
                  <div><span className="font-medium">Category:</span> {selectedIssue.category}</div>
                  <div><span className="font-medium">Department:</span> {selectedIssue.assigned_department}</div>
                  <div><span className="font-medium">Reporter:</span> {selectedIssue.reporter_name || 'Anonymous'}</div>
                  <div><span className="font-medium">Assigned Admin:</span> {selectedIssue.assigned_admin_name || 'Not assigned'}</div>
                  <div><span className="font-medium">Upvotes:</span> {selectedIssue.upvote_count}</div>
                  <div><span className="font-medium">Reported:</span> {new Date(selectedIssue.created_at).toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  {selectedIssue.address_line1 && (
                    <div><span className="font-medium">Address:</span> {selectedIssue.address_line1}
                      {selectedIssue.address_line2 && `, ${selectedIssue.address_line2}`}
                      {selectedIssue.street && `, ${selectedIssue.street}`}
                      {selectedIssue.landmark && ` (${selectedIssue.landmark})`}
                      {selectedIssue.pincode && ` - ${selectedIssue.pincode}`}
                    </div>
                  )}
                  {selectedIssue.media_urls && selectedIssue.media_urls.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-medium">Media Files:</span>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedIssue.media_urls.map((url, index) => (
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
                  <div><span className="font-medium">Location:</span> {selectedIssue.lat}, {selectedIssue.lng}</div>
                </div>
              </div>
              <div>
                <span className="font-medium">Description:</span>
                <p className="mt-1 text-sm text-slate-600">{selectedIssue.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                All Notifications
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowNotifications(false)}>
                Close
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              {notifications && notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-3 rounded-lg border ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{notification.message}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No notifications found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}