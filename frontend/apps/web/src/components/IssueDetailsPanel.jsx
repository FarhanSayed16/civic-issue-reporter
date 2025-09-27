// File: E:/civic-reporter/apps/web/src/features/issue-list/IssueDetailsPanel.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
// Import the specific hooks we need from our API and UI slices
import { useGetIssueQuery } from '@/features/api';
import { setSelectedIssue } from '@/store/slices/uiSlice';
import { Loader } from '.';
import { Button } from './ui/button';
import { useParams } from 'react-router-dom';

export function IssueDetailsPanel() {
  const dispatch = useDispatch();
 console.log('IssueDetailsPanel rendered');
  // 1. Get the ID of the selected issue from our UI state
//   const { selectedIssueId } = useSelector((state) => state.ui);
  const { id } = useParams();
    const selectedIssueId = parseInt(id, 10); // Convert to number
  // 2. Fetch the data for that specific issue using its ID.
  //    The 'skip' option prevents this API call from running if no issue is selected.
  const {
    data: issue,
    isLoading,
    isError,
    isFetching,
  } = useGetIssueQuery(selectedIssueId, {
    skip: !selectedIssueId,
  });

  console.log('Selected Issue ID:', selectedIssueId);
  console.log('Fetched Issue Data:', issue);


  const handleClearSelection = () => {
    dispatch(setSelectedIssue(null));
  };


  // === Render Logic ===

  // Show a placeholder if no issue is selected
  if (!selectedIssueId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center h-full">
        <p className="text-gray-500">Select an issue from the map or list to see details.</p>
      </div>
    );
  }

  // Show a loader while the data is being fetched
  if (isLoading || isFetching) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center h-full">
        <Loader />
      </div>
    );
  }

  // Show an error message if the fetch fails
  if (isError || !issue) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-red-500">
        Error loading issue details.
        <Button variant="link" onClick={handleClearSelection}>Clear selection</Button>
      </div>
    );
  }

  // Display the issue details once data is loaded
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Issue #{issue.id}</h2>
        <Button variant="ghost" size="sm" onClick={handleClearSelection}>Close</Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-500">Description</label>
          <p className="text-gray-800">{issue.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-500">Status</label>
            <p>
              <span className={`text-sm font-bold uppercase px-2 py-1 rounded-full ${
                issue.status === 'new' ? 'bg-blue-100 text-blue-800' : 
                issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                issue.status === 'spam' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {issue.status}
              </span>
            </p>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-500">Priority</label>
            <p className="text-gray-800">{issue.priority || 'N/A'}</p>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-500">Category</label>
            <p className="text-gray-800">{issue.category || 'N/A'}</p>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-500">Department</label>
            <p className="text-gray-800">{issue.assigned_department || 'N/A'}</p>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-500">Reporter</label>
            <p className="text-gray-800">{issue.reporter_name || 'Anonymous'}</p>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-500">Assigned Admin</label>
            <p className="text-gray-800">{issue.assigned_admin_name || 'Not assigned'}</p>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-500">Upvotes</label>
            <p className="text-gray-800">{issue.upvote_count || 0}</p>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-500">Location</label>
            <p className="text-gray-800">{issue.lat?.toFixed(4)}, {issue.lng?.toFixed(4)}</p>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-500">Reported</label>
            <p className="text-gray-800">{new Date(issue.created_at).toLocaleString()}</p>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-500">Verified</label>
            <p className="text-gray-800">
              <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                issue.is_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {issue.is_verified ? 'Verified' : 'Not Verified'}
              </span>
            </p>
          </div>
        </div>

        {issue.address_line1 && (
          <div>
            <label className="text-sm font-semibold text-gray-500">Address</label>
            <p className="text-gray-800">
              {issue.address_line1}
              {issue.address_line2 && `, ${issue.address_line2}`}
              {issue.street && `, ${issue.street}`}
              {issue.landmark && ` (${issue.landmark})`}
              {issue.pincode && ` - ${issue.pincode}`}
            </p>
          </div>
        )}

        {issue.media_urls && issue.media_urls.length > 0 && (
          <div>
            <label className="text-sm font-semibold text-gray-500">Media Files</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {issue.media_urls.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url} 
                    alt={`Media ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div 
                    className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center text-gray-500 text-sm"
                    style={{ display: 'none' }}
                  >
                    Failed to load
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}