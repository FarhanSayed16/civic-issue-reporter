// File: E:/civic-reporter/apps/web/src/features/issue-list/IssueDetailsPanel.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
// Import the specific hooks we need from our API and UI slices
import { useGetIssueQuery, useUpdateIssueStatusMutation } from '@/features/api';
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

  // 3. Prepare the mutation hook for updating the status
  const [updateIssueStatus, { isLoading: isUpdating }] = useUpdateIssueStatusMutation();

  const handleUpdateStatus = (newStatus) => {
    if (issue) {
      updateIssueStatus({ issueId: issue.id, status: newStatus });
    }
  };

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
        <div>
          <label className="text-sm font-semibold text-gray-500">Status</label>
          <p>
            <span className={`text-sm font-bold uppercase px-2 py-1 rounded-full ${
              issue.status === 'new' ? 'bg-blue-100 text-blue-800' : 
              issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {issue.status}
            </span>
          </p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-500">Category</label>
          <p className="text-gray-800">{issue.category || 'N/A'}</p>
        </div>
        {issue.image_url && (
          <div>
            <label className="text-sm font-semibold text-gray-500">Attachment</label>
            <img src={issue.image_url} alt={`Issue ${issue.id}`} className="mt-2 rounded-lg w-full h-auto object-cover" />
          </div>
        )}

        <div className="border-t pt-4">
          <label className="text-sm font-semibold text-gray-500 mb-2 block">Actions</label>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => handleUpdateStatus('in_progress')}
              disabled={isUpdating || issue.status === 'in_progress'}
            >
              Mark In Progress
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleUpdateStatus('resolved')}
              disabled={isUpdating || issue.status === 'resolved'}
            >
              Mark Resolved
            </Button>
          </div>
          {isUpdating && <p className="text-sm text-gray-500 mt-2">Updating status...</p>}
        </div>
      </div>
    </div>
  );
}