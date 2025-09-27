// File: E:/civic-reporter/apps/web/src/features/issue-list/IssueList.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedIssue } from '@/store/slices/uiSlice';
import { useNavigate } from 'react-router-dom';

export function IssueList({ issues }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Issues</h2>
      <ul className="space-y-4">
        {issues.map(issue => (
          <li key={issue.id} 
              onClick={() => {dispatch(setSelectedIssue(issue.id)),navigate(`/issueDetailsPanel/${issue.id}`)}} // 👈 Add click handler
              className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
            <p className="font-semibold text-gray-700">{issue.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                issue.status === 'new' ? 'bg-blue-100 text-blue-800' : 
                issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                issue.status === 'spam' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {issue.status}
              </span>
              <span className="text-xs text-gray-500">
                Reporter: {issue.reporter_name || 'Anonymous'}
              </span>
              {issue.assigned_admin_name && (
                <span className="text-xs text-gray-500">
                  Admin: {issue.assigned_admin_name}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}