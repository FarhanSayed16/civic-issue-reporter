import React, { useState } from 'react';
import { useGetAnalyticsStatsQuery, useGetAnalyticsHeatmapQuery } from '@/features/api';

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

// A redesigned, cleaner StatCard component
const StatCard = ({ title, value, icon, className = '' }) => (
  <Card className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {value === null || value === undefined ? (
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      ) : (
        <div className="text-4xl font-bold text-slate-800">{value}</div>
      )}
    </CardContent>
  </Card>
);

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: stats, isLoading: isLoadingStats } = useGetAnalyticsStatsQuery();
  const { data: heatmapData, isLoading: isLoadingHeatmap } = useGetAnalyticsHeatmapQuery({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
  });
  
  const categoryOptions = ["Pothole", "Streetlight", "Garbage", "Water Issue", "Road Problem", "Other"];

  // Centralizing status styles for consistency
  const statusStyles = {
    new: { color: 'blue', Icon: Hourglass },
    in_progress: { color: 'yellow', Icon: Clock },
    resolved: { color: 'green', Icon: CheckCircle2 },
    default: { color: 'slate', Icon: Archive },
  };

  // Storing stat card data in an array for cleaner rendering
  const statsItems = [
    { title: "Total Issues", value: stats?.total_issues, icon: <List className="h-5 w-5 text-slate-400" />, className: "lg:col-span-2" },
    { title: "Resolved Today", value: stats?.resolved_today, icon: <CheckCircle2 className="h-5 w-5 text-green-500" /> },
    { title: "Pending", value: stats?.pending, icon: <Hourglass className="h-5 w-5 text-yellow-500" /> },
    { title: "In Progress", value: stats?.in_progress, icon: <Clock className="h-5 w-5 text-blue-500" /> },
    { title: "Resolved This Week", value: stats?.resolved_this_week, icon: <Archive className="h-5 w-5 text-slate-400" /> },
    { title: "Avg Resolution Time", value: stats ? `${stats.avg_resolution_time_hours}h` : undefined, icon: <Clock className="h-5 w-5 text-slate-400" /> },
    { title: "Top Category", value: stats?.top_category, icon: <Star className="h-5 w-5 text-slate-400" /> },
    { title: "Top Ward", value: stats?.top_ward, icon: <Building className="h-5 w-5 text-slate-400" />, className: "lg:col-span-2" },
  ];

  return (
    <div className="space-y-8 p-4 md:p-6">
      <h1 className="text-3xl font-bold text-slate-800">Analytics Dashboard</h1>
      
      {/* Stat cards grid, now mapped from an array for cleaner code */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {statsItems.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={isLoadingStats ? null : item.value}
            icon={item.icon}
            className={item.className}
          />
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl text-slate-800">Issues Heatmap</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
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
              <p>No issues found for the selected filters.</p>
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
                        <CardTitle className="text-lg">Issue #{issue.id}</CardTitle>
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
                            {issue.status.replace('_', ' ')}
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