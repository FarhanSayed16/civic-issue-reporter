// File: E:/civic-reporter/apps/web/src/features/issue-list/IssueDetailsPanel.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// Import the specific hooks we need from our API and UI slices
import { useGetIssueQuery } from '@/features/api';
import { setSelectedIssue } from '@/store/slices/uiSlice';
import { Loader } from '.';
import { Button } from './ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, X, MapPin, Clock, User, ThumbsUp, Image as ImageIcon, AlertTriangle, CheckCircle, Building2, Calendar, ChevronLeft } from 'lucide-react';

export function IssueDetailsPanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const selectedIssueId = parseInt(id, 10);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const {
    data: issue,
    isLoading,
    isError,
    isFetching,
  } = useGetIssueQuery(selectedIssueId, {
    skip: !selectedIssueId,
  });

  const handleClose = () => {
    dispatch(setSelectedIssue(null));
    navigate('/issues');
  };

  const handleShareReport = async () => {
    if (!issue) return;
    
    const shareData = {
      title: `Environmental Report #${issue.id} - ${issue.category}`,
      text: `${issue.description}\n\nCategory: ${issue.category}\nStatus: ${issue.status === 'new' ? 'Reported' : issue.status === 'in_progress' ? 'Cleanup In Progress' : issue.status === 'resolved' ? 'Cleaned Up' : issue.status}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        alert('Report link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        const shareText = `${shareData.title}\n${shareData.text}\n${window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        alert('Report link copied to clipboard!');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      new: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Reported' },
      in_progress: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Cleanup In Progress' },
      resolved: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Cleaned Up' },
      spam: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Spam' },
    };
    const config = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', label: status || '' };
    
    return (
      <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAddressString = (issue) => {
    const parts = [];
    if (issue.address_line1) parts.push(issue.address_line1);
    if (issue.address_line2) parts.push(issue.address_line2);
    if (issue.street) parts.push(issue.street);
    if (issue.landmark) parts.push(`Near ${issue.landmark}`);
    if (issue.pincode) parts.push(issue.pincode);
    return parts.length > 0 ? parts.join(', ') : `${issue.lat?.toFixed(4)}, ${issue.lng?.toFixed(4)}`;
  };

  // Show a placeholder if no issue is selected
  if (!selectedIssueId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center h-full">
        <p className="text-gray-500">Select an environmental report from the map or list to see details.</p>
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
        <Button variant="link" onClick={handleClose}>Close</Button>
      </div>
    );
  }

  const mediaUrls = issue.media_urls || [];
  const hasMedia = mediaUrls.length > 0;

  // Display the issue details once data is loaded
  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white">Environmental Report #{issue.id}</h2>
            <p className="text-white/80 text-sm">{issue.category}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleShareReport}
          className="text-white hover:bg-white/20"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* LEFT: Media Gallery */}
        <div className="bg-gray-50 p-6 border-r border-gray-200">
          {hasMedia ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Media Gallery</h3>
                <span className="text-sm text-gray-500">({mediaUrls.length} {mediaUrls.length === 1 ? 'image' : 'images'})</span>
              </div>
              
              {/* Main Image */}
              <div className="relative bg-white rounded-lg overflow-hidden shadow-md aspect-video">
                <img 
                  src={mediaUrls[selectedImageIndex]} 
                  alt={`Report media ${selectedImageIndex + 1}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div 
                  className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm"
                  style={{ display: 'none' }}
                >
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Failed to load image</p>
                  </div>
                </div>
              </div>

              {/* Thumbnail Grid */}
              {mediaUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {mediaUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-blue-600 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={url} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="w-full h-full bg-gray-100 flex items-center justify-center"
                        style={{ display: 'none' }}
                      >
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No media attached</p>
              <p className="text-sm text-gray-400 mt-1">This report doesn't have any images</p>
            </div>
          )}
        </div>

        {/* RIGHT: Information Sections */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="space-y-6">
            {/* Status & Assignment Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Status & Assignment</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                  {getStatusBadge(issue.status)}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Priority</label>
                    <p className="text-sm font-semibold text-gray-800">{issue.priority || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Department</label>
                    <p className="text-sm font-semibold text-gray-800">{issue.assigned_department || 'Not assigned'}</p>
                  </div>
                </div>
                {issue.assigned_admin_name && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Assigned Admin</label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-800">{issue.assigned_admin_name}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Verification</label>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    issue.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {issue.is_verified ? '✓ Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Location</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-relaxed">{getAddressString(issue)}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 pl-6">
                  Coordinates: {issue.lat?.toFixed(6)}, {issue.lng?.toFixed(6)}
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Description</h3>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{issue.description}</p>
            </div>

            {/* Meta Information Section */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Report Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Reporter</p>
                    <p className="text-sm font-semibold text-gray-800">{issue.reporter_name || 'Anonymous'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Upvotes</p>
                    <p className="text-sm font-semibold text-gray-800">{issue.upvote_count || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Reported</p>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(issue.created_at)}</p>
                  </div>
                </div>
                {issue.updated_at && issue.updated_at !== issue.created_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm font-semibold text-gray-800">{formatDate(issue.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
