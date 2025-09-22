// File: E:/civic-reporter/apps/web/src/pages/DashboardPage.jsx
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  LayoutDashboard, 
  Filter, 
  Calendar,
  ArrowUpDown,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  ChevronDown,
  Search,
  RefreshCw
} from 'lucide-react';

// Import the hooks from your API slice files
import { useGetIssuesQuery } from '@/features/api/issues.api';
import { useGetStatsQuery } from '@/features/api/analytics.api';

// Import the components
import { MapView } from '@/components/MapView';
import { IssueList } from '@/components';
import { IssueDetailsPanel } from '@/components/IssueDetailsPanel';
import { Loader } from '@/components';

// Compact StatCard component
function StatCard({ title, value, icon, color, bgColor, trend }) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center">
        <div className={`p-2 rounded-md mr-2 ${bgColor}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-lg font-bold ${color} leading-tight`}>{value}</div>
          <div className="text-xs text-gray-500 truncate">{title}</div>
          {trend && <div className="text-xs text-gray-400">{trend}</div>}
        </div>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  bgColor: PropTypes.string.isRequired,
  trend: PropTypes.string,
};

// Compact Filter button component
function FilterButton({ active, onClick, children, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <span className="truncate">{children}</span>
      {count !== undefined && (
        <span className={`text-xs px-1 rounded ${
          active ? 'bg-blue-500' : 'bg-white text-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

FilterButton.propTypes = {
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  count: PropTypes.number,
};

// Collapsible Filter Section
function FilterSection({ title, children, icon, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-1.5 text-left text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded transition-colors"
      >
        <div className="flex items-center gap-1.5">
          {icon}
          <span>{title}</span>
        </div>
        <ChevronDown 
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}

FilterSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
};

export default function HomePage() {
  // State for filters
  const [filters, setFilters] = useState({
    status: 'All Status',
    ward: 'All Wards',
    category: 'All Categories',
    sortBy: 'date'
  });

  // Fetch data
  const { data: issues, isLoading: issuesLoading, isError: issuesError, refetch } = useGetIssuesQuery();
  const { data: stats, isLoading: statsLoading, isError: statsError } = useGetStatsQuery();
  console.log('Fetched issues:', issues);
  console.log('Fetched stats:', stats);
  
  // Filter options
  const statusOptions = ['All Status', 'New', 'In Progress', 'Resolved'];
  const wardOptions = ['All Wards', 'Andheri', 'Bandra', 'Dadar', 'Mumbai Central', 'Thane'];
  const categoryOptions = ['All Categories', 'Pothole', 'Streetlight', 'Garbage', 'Water Issue', 'Road Problem', 'Other'];
  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' }
  ];

  // Process issues for better map display (add slight coordinate variations for same locations)
  const processIssuesForMap = (issues) => {
    if (!issues) return [];
    
    const locationMap = new Map();
    
    return issues.map((issue, index) => {
      const locationKey = `${issue.latitude}_${issue.longitude}`;
      
      if (locationMap.has(locationKey)) {
        // Add slight random offset for overlapping markers (0.0001 degrees ≈ 11 meters)
        const count = locationMap.get(locationKey);
        locationMap.set(locationKey, count + 1);
        
        const offset = count * 0.0001;
        const angle = (count * 60) * (Math.PI / 180); // 60 degrees apart
        
        return {
          ...issue,
          latitude: parseFloat(issue.latitude) + (Math.cos(angle) * offset),
          longitude: parseFloat(issue.longitude) + (Math.sin(angle) * offset),
          originalLatitude: issue.latitude,
          originalLongitude: issue.longitude,
          hasOffset: true
        };
      } else {
        locationMap.set(locationKey, 1);
        return {
          ...issue,
          latitude: parseFloat(issue.latitude),
          longitude: parseFloat(issue.longitude),
          hasOffset: false
        };
      }
    });
  };

  // Filtered and sorted issues
  const filteredIssues = useMemo(() => {
    if (!issues) return [];
    
    let filtered = [...issues];
    
    // Apply filters
    if (filters.status !== 'All Status') {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }
    
    if (filters.ward !== 'All Wards') {
      filtered = filtered.filter(issue => issue.ward === filters.ward);
    }
    
    if (filters.category !== 'All Categories') {
      filtered = filtered.filter(issue => issue.category === filters.category);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'status':
          const statusOrder = { 'New': 3, 'In Progress': 2, 'Resolved': 1 };
          return (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0);
        default:
          return 0;
      }
    });
    
    return processIssuesForMap(filtered);
  }, [issues, filters]);

  // Count issues for each filter
  const getStatusCount = (status) => {
    if (!issues) return 0;
    if (status === 'All Status') return issues.length;
    return issues.filter(issue => issue.status === status).length;
  };

  const getWardCount = (ward) => {
    if (!issues) return 0;
    if (ward === 'All Wards') return issues.length;
    return issues.filter(issue => issue.ward === ward).length;
  };

  const getCategoryCount = (category) => {
    if (!issues) return 0;
    if (category === 'All Categories') return issues.length;
    return issues.filter(issue => issue.category === category).length;
  };

  // Loading state
  if (issuesLoading || statsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col"> 
      
      {/* Top Header Bar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-600 rounded-md">
            <LayoutDashboard className="text-white" size={16} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Civic Reporter Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => refetch()}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={16} />
          </button>
          <div className="text-sm text-gray-500">
            {filteredIssues.length} / {issues?.length || 0} issues
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="h-20 bg-white border-b border-gray-200 p-3 flex-shrink-0">
        <div className="grid grid-cols-4 gap-3 h-full">
          <StatCard 
            title="New Issues" 
            value={stats?.new_issues || 0} 
            icon={<AlertTriangle size={14} className="text-white" />} 
            color="text-blue-600" 
            bgColor="bg-blue-500" 
            trend="+12%"
          />
          <StatCard 
            title="In Progress" 
            value={stats?.in_progress || 0} 
            icon={<Clock size={14} className="text-white" />} 
            color="text-amber-600" 
            bgColor="bg-amber-500"
            trend="Active"
          />
          <StatCard 
            title="Resolved" 
            value={stats?.resolved_today || 0} 
            icon={<CheckCircle size={14} className="text-white" />} 
            color="text-green-600" 
            bgColor="bg-green-500"
            trend="Today"
          />
          <StatCard 
            title="Pending" 
            value={stats?.total_pending || 0} 
            icon={<Users size={14} className="text-white" />} 
            color="text-red-600" 
            bgColor="bg-red-500"
            trend="Total"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left - Map */}
        <div className="w-2/5 p-3">
          <div className="h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-8 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center px-3">
              <MapPin className="text-white w-4 h-4 mr-2" />
              <span className="text-white text-sm font-medium">Issues Map</span>
              <span className="ml-auto text-white text-xs opacity-75">
                {filteredIssues.filter(i => i.hasOffset).length > 0 && 
                  `${filteredIssues.filter(i => i.hasOffset).length} clustered`}
              </span>
            </div>
            <div className="h-[calc(100%-2rem)]">
              <MapView issues={filteredIssues} />
            </div>
          </div>
        </div>

        {/* Right - Content */}
        <div className="w-3/5 p-3 pl-0 flex">
          
          {/* Filters Sidebar */}
          <div className="w-48 bg-white rounded-l-lg border border-r-0 border-gray-200 shadow-sm p-3 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={14} className="text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">Filters</span>
            </div>
            
            {/* Status Filters */}
            <FilterSection 
              title="Status" 
              icon={<AlertTriangle size={12} className="text-gray-400" />}
              defaultOpen={true}
            >
              <div className="space-y-1">
                {statusOptions.map((status) => (
                  <FilterButton
                    key={status}
                    active={filters.status === status}
                    onClick={() => setFilters({ ...filters, status })}
                    count={getStatusCount(status)}
                  >
                    {status}
                  </FilterButton>
                ))}
              </div>
            </FilterSection>

            {/* Ward Filters */}
            <FilterSection 
              title="Wards" 
              icon={<MapPin size={12} className="text-gray-400" />}
            >
              <div className="space-y-1">
                {wardOptions.map((ward) => (
                  <FilterButton
                    key={ward}
                    active={filters.ward === ward}
                    onClick={() => setFilters({ ...filters, ward })}
                    count={getWardCount(ward)}
                  >
                    {ward}
                  </FilterButton>
                ))}
              </div>
            </FilterSection>

            {/* Category Filters */}
            <FilterSection 
              title="Categories" 
              icon={<LayoutDashboard size={12} className="text-gray-400" />}
            >
              <div className="space-y-1">
                {categoryOptions.map((category) => (
                  <FilterButton
                    key={category}
                    active={filters.category === category}
                    onClick={() => setFilters({ ...filters, category })}
                    count={getCategoryCount(category)}
                  >
                    {category}
                  </FilterButton>
                ))}
              </div>
            </FilterSection>

            {/* Sort Options */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <ArrowUpDown size={12} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-600">Sort</span>
              </div>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-r-lg border border-gray-200 shadow-sm p-4 overflow-y-auto">
            {/* Results Header */}
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">
                    Recent Issues ({filteredIssues.length})
                  </span>
                </div>
                <div className="text-xs text-blue-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Live
                </div>
              </div>
            </div>

            {/* Issue List */}
            <div className="space-y-3">
              <IssueList issues={filteredIssues} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}