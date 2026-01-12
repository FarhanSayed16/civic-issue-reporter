// File: E:/civic-reporter/apps/web/src/pages/DashboardPage.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
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
  RefreshCw,
  Info,
  X,
  Leaf,
  TrendingUp,
  Sparkles
} from 'lucide-react';

// Import the hooks from your API slice files
import { useGetIssuesQuery } from '@/features/api/issues.api';
import { useGetAnalyticsStatsQuery } from '@/features/api';

// Import the components
import { MapView } from '@/components/MapView';
import { IssueList } from '@/components';
import { IssueDetailsPanel } from '@/components/IssueDetailsPanel';
import { Loader } from '@/components';
import { QuickReportForm } from '@/components/QuickReportForm';

// Enhanced StatCard with count-up animation and gradients
function StatCard({ title, value, icon, color, bgColor, trend, delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          // Count-up animation
          const targetValue = typeof value === 'number' ? value : parseInt(value) || 0;
          const duration = 1000;
          const steps = 30;
          const increment = targetValue / steps;
          let current = 0;
          
          const timer = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
              setDisplayValue(targetValue);
              clearInterval(timer);
            } else {
              setDisplayValue(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [value, isVisible]);

  return (
    <div 
      ref={cardRef}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient background overlay on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${bgColor.replace('bg-', 'from-')} to-transparent`}></div>
      
      <div className="relative flex items-center">
        <div className={`p-3 rounded-xl ${bgColor} shadow-md group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0 ml-4">
          <div className={`text-2xl font-bold ${color} leading-tight`}>
            {isVisible ? displayValue : 0}
          </div>
          <div className="text-xs font-medium text-gray-600 mt-1">{title}</div>
          {trend && (
            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <TrendingUp size={10} />
              {trend}
            </div>
          )}
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
  delay: PropTypes.number,
};

// Enhanced Filter button with chip style
function FilterButton({ active, onClick, children, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md scale-105'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
      }`}
    >
      <span className="truncate">{children}</span>
      {count !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          active ? 'bg-white/20 text-white' : 'bg-white text-gray-600'
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

// Enhanced Collapsible Filter Section with smooth animation
function FilterSection({ title, children, icon, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mt-2 space-y-2 pl-1">
          {children}
        </div>
      </div>
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
  const { user } = useSelector((s) => s.auth);
  const [showOnboardingTooltip, setShowOnboardingTooltip] = useState(() => {
    const hasSeenTooltip = localStorage.getItem('swachhcity_onboarding_seen');
    return !hasSeenTooltip;
  });
  const [quickReportOpen, setQuickReportOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // State for filters
  const [filters, setFilters] = useState({
    status: 'All Status',
    category: 'All Categories',
    sortBy: 'date'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data
  const { data: issues, isLoading: issuesLoading, isError: issuesError, refetch } = useGetIssuesQuery();
  const { data: stats, isLoading: statsLoading, isError: statsError } = useGetAnalyticsStatsQuery();
  
  // Filter options
  const statusOptions = [
    { label: 'All Status', value: 'All Status' },
    { label: 'Reported', value: 'new' },
    { label: 'Cleanup In Progress', value: 'in_progress' },
    { label: 'Cleaned Up', value: 'resolved' }
  ];
  const categoryOptions = ['All Categories', 'Open Garbage Dump', 'Plastic Pollution', 'Open Burning', 'Water Body Pollution', 'Construction Waste', 'Electronic Waste (E-Waste)', 'Biomedical Waste', 'Green Space Degradation', 'Drainage Blockage', 'Water Pollution / Contaminated Water', 'Garbage Overflow', 'Illegal Dumping / Litter', 'Other Environmental Issues'];
  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' }
  ];

  // Process issues for better map display
  const processIssuesForMap = (issues) => {
    if (!issues) return [];
    
    const locationMap = new Map();
    
    return issues.map((issue, index) => {
      const locationKey = `${issue.latitude}_${issue.longitude}`;
      
      if (locationMap.has(locationKey)) {
        const count = locationMap.get(locationKey);
        locationMap.set(locationKey, count + 1);
        
        const offset = count * 0.0001;
        const angle = (count * 60) * (Math.PI / 180);
        
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
    
    if (filters.status !== 'All Status') {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }
    
    if (filters.category !== 'All Categories') {
      filtered = filtered.filter(issue => issue.category === filters.category);
    }
    
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'status':
          const statusOrder = { 'new': 3, 'in_progress': 2, 'resolved': 1 };
          return (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0);
        default:
          return 0;
      }
    });
    
    return processIssuesForMap(filtered);
  }, [issues, filters]);

  // Paginated issues for display
  const paginatedIssues = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredIssues.slice(startIndex, endIndex);
  }, [filteredIssues, currentPage, itemsPerPage]);

  // Pagination info
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredIssues.length);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Count issues for each filter
  const getStatusCount = (statusValue) => {
    if (!issues) return 0;
    if (statusValue === 'All Status') return issues.length;
    return issues.filter(issue => issue.status === statusValue).length;
  };

  const getCategoryCount = (category) => {
    if (!issues) return 0;
    if (category === 'All Categories') return issues.length;
    return issues.filter(issue => issue.category === category).length;
  };

  // Map load animation
  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Loading state
  if (issuesLoading || statsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex flex-col"> 
      
      {/* Welcome Message / Onboarding Tooltip */}
      {showOnboardingTooltip && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200 px-4 py-3 flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-800">
                Welcome to SwachhCity! Help monitor environmental health in your city.
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Start by reporting environmental issues → Track their status → See your impact
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowOnboardingTooltip(false);
              localStorage.setItem('swachhcity_onboarding_seen', 'true');
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Enhanced Top Header Bar */}
      <div className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md">
            <LayoutDashboard className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Monitor Environmental Health in Your City
            </h1>
            <p className="text-xs text-gray-500">Real-time environmental monitoring dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setQuickReportOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
            title="Quick Report"
          >
            <Sparkles size={16} />
            Quick Report
          </button>
          <button 
            onClick={() => refetch()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:rotate-180"
            title="Refresh data"
          >
            <RefreshCw size={18} />
          </button>
          <div className="text-sm text-gray-600 font-medium px-3 py-1.5 bg-gray-50 rounded-lg">
            {filteredIssues.length} / {issues?.length || 0} reports
          </div>
        </div>
      </div>

      {/* Real-Time Notifications Banner */}
      {stats && stats.resolved_today > 0 && (
        <div className="bg-gradient-to-r from-blue-500 via-green-500 to-teal-500 p-4 border-b border-blue-600/20 shadow-lg animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm animate-pulse">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  🎉 {stats.resolved_today} cleanup{stats.resolved_today > 1 ? 's' : ''} completed today!
                </p>
                <p className="text-white/90 text-xs">Your city is getting cleaner</p>
              </div>
            </div>
            <TrendingUp className="h-6 w-6 text-white animate-bounce" />
          </div>
        </div>
      )}

      {/* Environmental Impact Card */}
      {stats && (
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-5 border-b border-green-600/20 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                <Leaf className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Environmental Impact</h3>
                <p className="text-white/90 text-sm">Collective effort making a difference</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-white text-3xl font-bold">
                  {Math.round((stats?.total_issues || 0) * 0.15)} tons
                </div>
                <div className="text-white/80 text-xs font-medium">Waste Reported</div>
              </div>
              <div className="h-14 w-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-white text-3xl font-bold">
                  {stats?.resolved_today || 0}
                </div>
                <div className="text-white/80 text-xs font-medium">Areas Cleaned</div>
              </div>
              <div className="h-14 w-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-white text-3xl font-bold">
                  {stats?.total_issues ? Math.min(Math.floor(stats.total_issues / 5), 999) : 0}
                </div>
                <div className="text-white/80 text-xs font-medium">Citizens Engaged</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Bar with animations */}
      <div className="h-24 bg-white/60 backdrop-blur-sm border-b border-gray-200/50 p-4 flex-shrink-0 shadow-sm">
        <div className="grid grid-cols-4 gap-4 h-full">
          <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <StatCard 
              title="Active Reports" 
              value={stats?.new_issues || 0} 
              icon={<AlertTriangle size={18} className="text-white" />} 
              color="text-blue-600" 
              bgColor="bg-gradient-to-br from-blue-500 to-blue-600" 
              trend="New reports"
              delay={0}
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <StatCard 
              title="Cleanups Today" 
              value={stats?.resolved_today || 0} 
              icon={<CheckCircle size={18} className="text-white" />} 
              color="text-green-600" 
              bgColor="bg-gradient-to-br from-green-500 to-green-600"
              trend="Completed"
              delay={100}
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <StatCard 
              title="Areas Monitored" 
              value={stats?.total_pending || 0} 
              icon={<Users size={18} className="text-white" />} 
              color="text-purple-600" 
              bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
              trend="Under review"
              delay={200}
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <StatCard 
              title="Cleanup In Progress" 
              value={stats?.in_progress || 0} 
              icon={<Clock size={18} className="text-white" />} 
              color="text-amber-600" 
              bgColor="bg-gradient-to-br from-amber-500 to-amber-600"
              trend="Active"
              delay={300}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left - Enhanced Map Section (Hero Element) */}
        <div className="w-1/2 lg:w-2/5 p-4">
          <div 
            className={`h-full bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden transition-all duration-500 ${
              mapLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            {/* Enhanced Map Header */}
            <div className="h-12 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 flex items-center px-4 shadow-md">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <MapPin className="text-white w-5 h-5" />
                </div>
                <div>
                  <span className="text-white text-sm font-semibold">Environmental Hotspots in Your City</span>
                  <p className="text-white/80 text-xs">Real-time issue tracking</p>
                </div>
              </div>
              {filteredIssues.filter(i => i.hasOffset).length > 0 && (
                <span className="text-white/90 text-xs bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                  {filteredIssues.filter(i => i.hasOffset).length} clustered
                </span>
              )}
            </div>
            <div className="h-[calc(100%-3rem)] relative">
              <MapView issues={filteredIssues} />
            </div>
          </div>
        </div>

        {/* Right - Content */}
        <div className="w-1/2 lg:w-3/5 p-4 pl-0 flex">
          
          {/* Enhanced Filters Sidebar */}
          <div className="w-44 lg:w-52 bg-white/80 backdrop-blur-sm rounded-l-2xl border border-r-0 border-gray-200 shadow-lg p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Filter size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold text-gray-700">Filters</span>
            </div>
            
            {/* Status Filters */}
            <FilterSection 
              title="Status" 
              icon={<AlertTriangle size={14} className="text-blue-500" />}
              defaultOpen={true}
            >
              <div className="space-y-2">
                {statusOptions.map((statusOption) => (
                  <FilterButton
                    key={statusOption.value}
                    active={filters.status === statusOption.value}
                    onClick={() => setFilters({ ...filters, status: statusOption.value })}
                    count={getStatusCount(statusOption.value)}
                  >
                    {statusOption.label}
                  </FilterButton>
                ))}
              </div>
            </FilterSection>

            {/* Category Filters */}
            <FilterSection 
              title="Categories" 
              icon={<LayoutDashboard size={14} className="text-purple-500" />}
            >
              <div className="space-y-2 max-h-64 overflow-y-auto">
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
            <div className="pt-3 mt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpDown size={14} className="text-gray-500" />
                <span className="text-xs font-semibold text-gray-600">Sort By</span>
              </div>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
          <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-r-2xl border border-gray-200 shadow-lg p-5 overflow-y-auto">
            {/* Enhanced Results Header */}
            <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <Calendar size={16} className="text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-blue-900">
                      Recent Environmental Reports
                    </span>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Showing {startItem}-{endItem} of {filteredIssues.length} reports
                    </p>
                  </div>
                </div>
                <div className="text-xs text-blue-600 flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Live</span>
                </div>
              </div>
            </div>

            {/* Issue List */}
            <div className="space-y-3">
              <IssueList issues={paginatedIssues} />
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage <= 2) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 1) {
                        pageNum = totalPages - 2 + i;
                      } else {
                        pageNum = currentPage - 1 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 text-sm font-semibold border rounded-lg transition-all duration-200 ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-md scale-105'
                              : 'border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Report Form */}
      <QuickReportForm open={quickReportOpen} onOpenChange={setQuickReportOpen} />
    </div>
  );
}
