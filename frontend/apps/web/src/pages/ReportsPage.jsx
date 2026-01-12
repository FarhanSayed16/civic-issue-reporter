import React, { useState, useEffect } from 'react';
import { useGetAnalyticsStatsQuery, useGetAnalyticsHeatmapQuery } from '@/features/api';
import { isDemoMode } from '@/utils/demoMode';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Icons from lucide-react (a popular icon library)
import {
  Loader2,
  List,
  CheckCircle2,
  Hourglass,
  Clock,
  Archive,
  Star,
  Building,
  MapPin,
  Tag,
} from 'lucide-react';

// A redesigned, cleaner StatCard component with subtitle support
const StatCard = ({ title, subtitle, value, icon, className = '', trend }) => (
  <Card className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="flex-1">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {icon}
    </CardHeader>
    <CardContent>
      {value === null || value === undefined ? (
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      ) : (
        <div>
          <div className="text-4xl font-bold text-slate-800">{value}</div>
          {trend && <div className="text-xs text-slate-500 mt-1">{trend}</div>}
        </div>
      )}
    </CardContent>
  </Card>
);

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showDemoBanner, setShowDemoBanner] = useState(false);

  useEffect(() => {
    setShowDemoBanner(isDemoMode());
  }, []);

  const { data: stats, isLoading: isLoadingStats } = useGetAnalyticsStatsQuery();
  const { data: heatmapData, isLoading: isLoadingHeatmap } = useGetAnalyticsHeatmapQuery({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
  });
  
  const categoryOptions = ["Open Garbage Dump", "Plastic Pollution", "Open Burning", "Water Body Pollution", "Construction Waste", "Electronic Waste (E-Waste)", "Biomedical Waste", "Green Space Degradation", "Drainage Blockage", "Water Pollution / Contaminated Water", "Garbage Overflow", "Illegal Dumping / Litter", "Other Environmental Issues"];

  // Centralizing status styles for consistency
  const statusStyles = {
    new: { color: 'blue', Icon: Hourglass },
    in_progress: { color: 'yellow', Icon: Clock },
    resolved: { color: 'green', Icon: CheckCircle2 },
    default: { color: 'slate', Icon: Archive },
  };

  // Storing stat card data in an array for cleaner rendering - Reordered for maximum impact
  const statsItems = [
    { title: "Cleanups Completed Today", subtitle: "Issues resolved in last 24h", value: stats?.resolved_today, icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, trend: "↑ Active today" },
    { title: "Avg Response Time", subtitle: "Time to action", value: stats ? `${stats.avg_resolution_time_hours}h` : undefined, icon: <Clock className="h-5 w-5 text-purple-500" />, trend: "Avg cleanup time" },
    { title: "Action Required", subtitle: "Reports awaiting cleanup", value: stats?.pending, icon: <Hourglass className="h-5 w-5 text-yellow-500" />, trend: "Needs attention" },
    { title: "Cleanup In Progress", subtitle: "Active cleanups", value: stats?.in_progress, icon: <Clock className="h-5 w-5 text-blue-500" />, trend: "Currently working" },
    { title: "Total Reports Filed", subtitle: "Citizens monitoring environment", value: stats?.total_issues, icon: <List className="h-5 w-5 text-slate-400" />, className: "lg:col-span-2", trend: "All time" },
    { title: "Cleanups This Week", subtitle: "Weekly progress", value: stats?.resolved_this_week, icon: <Archive className="h-5 w-5 text-green-400" /> },
    { title: "Top Category", subtitle: "Most reported issue", value: stats?.top_category, icon: <Star className="h-5 w-5 text-amber-500" /> },
    { title: "Top Authority", subtitle: "Fastest responding", value: stats?.top_ward, icon: <Building className="h-5 w-5 text-indigo-500" />, className: "lg:col-span-2" },
  ];

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Demo Mode Banner */}
      {showDemoBanner && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-4 rounded-md shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎥</span>
              <div>
                <p className="font-semibold text-yellow-800">DEMO MODE - Using simulated analytics data</p>
                <p className="text-sm text-yellow-700">Analytics are using precomputed data for smooth demo experience.</p>
              </div>
            </div>
            <button
              onClick={() => setShowDemoBanner(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Environmental Analytics Dashboard</h1>
        <p className="text-slate-600 mt-1">Track environmental impact and cleanup effectiveness</p>
      </div>
      
      {/* Stat cards grid, now mapped from an array for cleaner code - Reordered for impact */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {statsItems.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            subtitle={item.subtitle}
            value={isLoadingStats ? null : item.value}
            icon={item.icon}
            className={item.className}
            trend={item.trend}
          />
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl text-slate-800">Environmental Hotspots Map</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Red = High pollution areas, Green = Cleaned areas</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">Reported</SelectItem>
                  <SelectItem value="in_progress">Cleanup In Progress</SelectItem>
                  <SelectItem value="resolved">Cleaned Up</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingHeatmap ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : !heatmapData || heatmapData.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium mb-2">No environmental reports found for the selected filters.</p>
              <p className="text-sm">Try adjusting your filters to see more data, or be the first to report environmental issues in this area! 🍃</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {heatmapData.map((issue) => {
                const statusInfo = statusStyles[issue.status] || statusStyles.default;
                return (
                  <Card key={issue.id} className={`overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 border-t-4 border-${statusInfo.color}-500`}>
                    <CardHeader className="flex-row gap-4 items-center space-y-0 pb-2">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-${statusInfo.color}-100`}>
                        <statusInfo.Icon className={`h-5 w-5 text-${statusInfo.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">Environmental Report #{issue.id}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-2">
                       <div className="text-sm text-slate-500 flex items-center gap-2">
                         <Tag size={14} />
                         <span>{issue.category}</span>
                       </div>
                       <div className="text-xs text-slate-400 flex items-center gap-2">
                         <MapPin size={14} />
                         <span>{`${issue.latitude}, ${issue.longitude}`}</span>
                       </div>
                       <div className="pt-2">
                         <Badge variant={issue.status === 'resolved' ? 'default' : 'outline'} className={`capitalize border-${statusInfo.color}-300 text-${statusInfo.color}-700 bg-${statusInfo.color}-50`}>
                            {issue.status === 'new' ? 'Reported' : 
                             issue.status === 'in_progress' ? 'Cleanup In Progress' : 
                             issue.status === 'resolved' ? 'Cleaned Up' : 
                             issue.status.replace('_', ' ')}
                         </Badge>
                       </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}