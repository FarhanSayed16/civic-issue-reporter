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
            <span className={`text-xs font-bold ...`}>
              {issue.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}