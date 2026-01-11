import React, { useState } from 'react';
import { useGetIssuesQuery } from '@/features/api/issues.api';
import { useSelector } from 'react-redux';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Eye, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AllIssuesAdminPage() {
  const { user } = useSelector((s) => s.auth);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedIssue, setSelectedIssue] = useState(null);

  const { data: issues, isLoading, refetch } = useGetIssuesQuery({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    sort: sortBy,
  });

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

  const categoryOptions = ["Open Garbage Dump", "Plastic Pollution", "Open Burning", "Water Body Pollution", "Construction Waste", "Electronic Waste (E-Waste)", "Biomedical Waste", "Green Space Degradation", "Drainage Blockage", "Water Pollution / Contaminated Water", "Garbage Overflow", "Illegal Dumping / Litter", "Other Environmental Issues"];

  // Filter issues by admin's department
  const filteredIssues = issues?.filter(issue => {
    // Show issues from admin's department
    if (user?.department && issue.assigned_department !== user.department) {
      return false;
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">All Environmental Reports</h1>
          <p className="text-slate-600 mt-1">
            Department: {user?.department}
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Filter Presets */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setStatusFilter('new');
            setPriorityFilter('high');
          }}
          className="text-xs"
        >
          🔴 Urgent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setStatusFilter('');
            setCategoryFilter('');
            setPriorityFilter('');
          }}
          className="text-xs"
        >
          🏢 My Department
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Filter for this week (would need date logic in real implementation)
            setStatusFilter('');
            setCategoryFilter('');
          }}
          className="text-xs"
        >
          📅 This Week
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800">Department Environmental Reports (Read-Only)</CardTitle>
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
                {categoryOptions.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>


            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Sort By" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest</SelectItem>
                <SelectItem value="upvote_count">Upvotes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
              <p>No environmental reports found in your department.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <Card key={issue.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">Environmental Report #{issue.id}</h3>
                        {statusBadge(issue.status)}
                        {issue.assigned_admin_id && (
                          <Badge variant="outline" className="text-xs">
                            Assigned to Admin #{issue.assigned_admin_id}
                          </Badge>
                        )}
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setSelectedIssue(issue)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
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

      {/* Issue Details Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Environmental Report #{selectedIssue.id} Details</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedIssue(null)}>
                Close
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {statusBadge(selectedIssue.status)}
                </div>
                <div><span className="font-medium">Category:</span> {selectedIssue.category}</div>
                <div><span className="font-medium">Department:</span> {selectedIssue.assigned_department}</div>
                <div><span className="font-medium">Reporter:</span> {selectedIssue.reporter_name || 'Anonymous'}</div>
                <div><span className="font-medium">Assigned Admin:</span> {selectedIssue.assigned_admin_name || 'Not assigned'}</div>
                <div><span className="font-medium">Upvotes:</span> {selectedIssue.upvote_count}</div>
                <div><span className="font-medium">Reported:</span> {new Date(selectedIssue.created_at).toLocaleString()}</div>
                {selectedIssue.address_line1 && (
                  <div><span className="font-medium">Address:</span> {selectedIssue.address_line1}
                    {selectedIssue.address_line2 && `, ${selectedIssue.address_line2}`}
                    {selectedIssue.street && `, ${selectedIssue.street}`}
                    {selectedIssue.landmark && ` (${selectedIssue.landmark})`}
                    {selectedIssue.pincode && ` - ${selectedIssue.pincode}`}
                  </div>
                )}
                {selectedIssue.media_urls && selectedIssue.media_urls.length > 0 && (
                  <div><span className="font-medium">Media Files:</span> {selectedIssue.media_urls.length} attached</div>
                )}
              </div>
              <div>
                <span className="font-medium">Description:</span>
                <p className="mt-1 text-sm text-slate-600">{selectedIssue.description}</p>
              </div>
              {selectedIssue.media_urls && selectedIssue.media_urls.length > 0 && (
                <div>
                  <span className="font-medium">Media:</span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {selectedIssue.media_urls.map((url, index) => (
                      <img key={index} src={url} alt={`Issue ${selectedIssue.id} media ${index + 1}`} className="w-full h-32 object-cover rounded" />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
