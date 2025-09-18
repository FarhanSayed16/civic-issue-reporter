import React, { useState } from 'react';
// ✅ 1. Import the new useDebounce hook
import { useDebounce } from '@/hooks/debounce';
import { useGetIssuesQuery } from '@/features/api/issues.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSelectedIssue } from '@/store/slices/uiSlice';

export default function AllIssuesPage() {
  // State for the immediate input value
  const [searchTerm, setSearchTerm] = useState(''); 
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [ward, setWard] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  
  // ✅ 2. Create a debounced value for the search term
  // It will only update 500ms after the user stops typing
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const wardOptions = ['Ward 1', 'Ward 2', 'Ward 3'];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ 3. Pass the DEBOUNCED search term to the query hook
  // The API call will now only be made when the user pauses typing
  const { data, isLoading, isError } = useGetIssuesQuery({
    status: status || undefined,
    category: category || undefined,
    ward: ward || undefined,
    search: debouncedSearchTerm || undefined,
    sort: sortBy,
  });

  const issues = data || [];

  const statusBadge = (s) => {
    const statusMap = {
      new: 'bg-blue-500 text-white',
      in_progress: 'bg-yellow-500 text-white',
      resolved: 'bg-green-500 text-white',
      pending: 'bg-gray-400 text-white',
    };
    const className = statusMap[s] || 'bg-gray-300 text-gray-800';
    const formattedStatus = (s || '').replace('_', ' ').replace(/^./, c => c.toUpperCase());
    
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{formattedStatus}</span>;
  };

  const handleViewDetails = (issue) => {
    dispatch(setSelectedIssue(issue));
    navigate(`/issueDetailsPanel/${issue.id}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-800">All Reported Issues</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-neutral-700">Filter & Search Issues</CardTitle>
          <Button className="bg-accent hover:bg-accent/90">+ Report New Issue</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by description, ID, etc..."
                // The input still updates the immediate state
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Status Filter */}
            <Select value={status} onValueChange={(value) => setStatus(value === 'all' ? '' : value)}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={category} onValueChange={(value) => setCategory(value === 'all' ? '' : value)}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Pothole">Pothole</SelectItem>
                <SelectItem value="Broken Streetlight">Broken Streetlight</SelectItem>
                <SelectItem value="Illegal Dumping">Illegal Dumping</SelectItem>
              </SelectContent>
            </Select>

            {/* Ward Filter */}
            <Select value={ward} onValueChange={(value) => setWard(value === 'all' ? '' : value)}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Ward/Area" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {wardOptions.map(w => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Sort By" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Newest</SelectItem>
                <SelectItem value="date_asc">Oldest</SelectItem>
                <SelectItem value="upvotes_desc">Most Upvotes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto bg-white rounded-md border">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-100 text-neutral-600">
                <tr>
                  <th className="text-left p-3 font-medium">ID</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-left p-3 font-medium">Upvotes</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Date Reported</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={7} className="p-6 text-center text-neutral-500">Loading issues...</td></tr>
                )}
                {isError && (
                  <tr><td colSpan={7} className="p-6 text-center text-red-600">Failed to load issues. Please try again later.</td></tr>
                )}
                {!isLoading && !isError && issues?.length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-neutral-500">No issues found matching your criteria.</td></tr>
                )}
                {issues?.map((issue) => (
                  <tr key={issue.id} className="border-t hover:bg-neutral-50">
                    <td className="p-3 text-neutral-500">#{issue.id}</td>
                    <td className="p-3 font-medium">{issue.category}</td>
                    <td className="p-3 max-w-[420px] truncate text-neutral-700">{issue.description}</td>
                    <td className="p-3 font-semibold text-neutral-800">{issue.upvotes ?? 0}</td>
                    <td className="p-3">{statusBadge(issue.status)}</td>
                    <td className="p-3">{issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-3">
                      <Button onClick={() => handleViewDetails(issue)} variant="outline" size="sm">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}