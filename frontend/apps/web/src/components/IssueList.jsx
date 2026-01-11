// File: E:/civic-reporter/apps/web/src/features/issue-list/IssueList.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedIssue } from '@/store/slices/uiSlice';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, User } from 'lucide-react';

export function IssueList({ issues }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!issues || issues.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <MapPin size={48} className="mx-auto opacity-50" />
        </div>
        <p className="text-gray-500 font-medium">No environmental reports found</p>
        <p className="text-sm text-gray-400 mt-1">Be the first to report an issue in your area</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'new': { label: 'Reported', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      'in_progress': { label: 'Cleanup In Progress', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
      'resolved': { label: 'Cleaned Up', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
      'spam': { label: 'Spam', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    };
    
    const config = statusConfig[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-3">
      {issues.map((issue, index) => (
        <div
          key={issue.id}
          onClick={() => {
            dispatch(setSelectedIssue(issue.id));
            navigate(`/issueDetailsPanel/${issue.id}`);
          }}
          className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg cursor-pointer transition-all duration-200 animate-fade-in-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Category & Status Row */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {issue.category}
                </span>
                <span className="text-gray-300">•</span>
                {getStatusBadge(issue.status)}
              </div>
              
              {/* Description */}
              <p className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {issue.description}
              </p>
              
              {/* Meta Information */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User size={12} />
                  <span>{issue.reporter_name || 'Anonymous'}</span>
                </div>
                {issue.assigned_admin_name && (
                  <>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Admin:</span>
                      <span>{issue.assigned_admin_name}</span>
                    </div>
                  </>
                )}
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{formatDate(issue.created_at)}</span>
                </div>
              </div>
            </div>
            
            {/* Arrow indicator */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
