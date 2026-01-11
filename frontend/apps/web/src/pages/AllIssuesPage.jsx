import React, { useMemo, useState, useEffect } from 'react';
// ✅ 1. Import the new useDebounce hook
import { useDebounce } from '@/hooks/debounce';
import { useCreateIssueMutation, useGetIssuesQuery } from '@/features/api/issues.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSelectedIssue } from '@/store/slices/uiSlice';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { isDemoMode } from '@/utils/demoMode';
import { 
  AlertTriangle, Trash2, Droplets, Flame, Building2, Cpu, Syringe, TreePine, Gauge, Waves, Package, 
  AlertCircle, CircleAlert, Search, Filter, X, MapPin, Clock, User, ThumbsUp, Image as ImageIcon,
  Calendar, ChevronRight
} from 'lucide-react';

export default function AllIssuesPage() {
  // State for the immediate input value
  const [searchTerm, setSearchTerm] = useState(''); 
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [ward, setWard] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Report sheet state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [rCategory, setRCategory] = useState('');
  const [rWard, setRWard] = useState('');
  const [rDescription, setRDescription] = useState('');
  const [rLat, setRLat] = useState('');
  const [rLng, setRLng] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiSeverity, setAiSeverity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const apiBase = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:8585', []);
  const [createIssue] = useCreateIssueMutation();
  const [showDemoBanner, setShowDemoBanner] = useState(false);
  
  useEffect(() => {
    setShowDemoBanner(isDemoMode());
  }, []);
  
  // ✅ 2. Create a debounced value for the search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const wardOptions = ['Ward 1', 'Ward 2', 'Ward 3'];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ 3. Pass the DEBOUNCED search term to the query hook
  const { data, isLoading, isError } = useGetIssuesQuery({
    status: status || undefined,
    category: category || undefined,
    ward: ward || undefined,
    search: debouncedSearchTerm || undefined,
    sort: sortBy,
  });

  const issues = data || [];

  // Pagination logic
  const totalPages = Math.ceil(issues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIssues = issues.slice(startIndex, endIndex);
  const startItem = startIndex + 1;
  const endItem = Math.min(endIndex, issues.length);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [status, category, ward, sortBy, debouncedSearchTerm]);

  const statusBadge = (s) => {
    const statusMap = {
      new: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Reported' },
      in_progress: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Cleanup In Progress' },
      resolved: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Cleaned Up' },
      pending: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', label: 'Pending' },
    };
    const config = statusMap[s] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', label: s || '' };
    
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  const handleViewDetails = (issue) => {
    dispatch(setSelectedIssue(issue));
    navigate(`/issueDetailsPanel/${issue.id}`);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setRLat(lat.toFixed(6));
      setRLng(lng.toFixed(6));
      try {
        const addr = await reverseGeocode(lat, lng);
        if (addr) fillAddressFields(addr, true);
      } catch (_) {}
    }, () => {}, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  };

  const reverseGeocode = async (lat, lng) => {
    const build = (a, displayName) => {
      const house = a.house_number || '';
      const road = a.road || a.street || a.residential || a.pedestrian || '';
      const neighbourhood = a.neighbourhood || a.suburb || a.locality || '';
      const city = a.city || a.town || a.village || a.county || '';
      const state = a.state || '';
      const poi = a.public_building || a.school || a.hospital || a.shop || a.poi || '';
      const line1 = [house, road].filter(Boolean).join(' ').trim() || displayName || '';
      const line2 = [neighbourhood, city, state].filter(Boolean).join(', ');
      const street = road;
      const landmark = poi || neighbourhood;
      const pincode = a.postcode || '';
      return { line1, line2, street, landmark, pincode };
    };
    try {
      const url1 = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;
      const res1 = await fetch(url1, { headers: { 'Accept': 'application/json' } });
      if (res1.ok) {
        const data1 = await res1.json();
        if (data1 && data1.address) return build(data1.address, data1.display_name);
      }
    } catch (_) {}
    try {
      const url2 = `https://geocode.maps.co/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
      const res2 = await fetch(url2, { headers: { 'Accept': 'application/json' } });
      if (res2.ok) {
        const data2 = await res2.json();
        const a2 = (data2 && data2.address) || {};
        return build(a2, data2.display_name);
      }
    } catch (_) {}
    return null;
  };

  const fillAddressFields = (addr, force = false) => {
    if (force || !addrLine1) setAddrLine1(addr.line1 || '');
    if (force || !addrLine2) setAddrLine2(addr.line2 || '');
    if (force || !addrStreet) setAddrStreet(addr.street || '');
    if (force || !addrLandmark) setAddrLandmark(addr.landmark || '');
    if (force || !addrPincode) setAddrPincode(addr.pincode || '');
  };

  const onFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const toDataUrl = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    try {
      const dataUrl = await toDataUrl(file);
      setImageDataUrl(dataUrl);
      setAiSuggestion('Detecting from image...');
      
      const { isDemoMode, getMockAIDetection } = await import('@/utils/demoMode');
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockData = await getMockAIDetection();
        const label = mockData?.detections?.[0]?.label || '';
        const mapped = mapToFrontendCategory(label);
        if (mapped) setRCategory(mapped);
        setAiSuggestion(label ? `Detected: ${mapped} (Demo Mode)` : 'No detection from image');
        return;
      }
      
      const res = await fetch(`${apiBase}/ai/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_data_url: dataUrl })
      });
      if (res.ok) {
        const resp = await res.json();
        const label = resp?.detections?.[0]?.label || '';
        const mapped = mapToFrontendCategory(label);
        if (mapped) setRCategory(mapped);
        setAiSuggestion(label ? `Detected: ${mapped}` : 'No detection from image');
      } else {
        setAiSuggestion('Image detection failed');
      }
    } catch (err) {
      setAiSuggestion('Image processing failed');
    }
  };

  const onAnalyzeText = async () => {
    setAiSuggestion('Analyzing text...');
    try {
      const { isDemoMode, getMockTextAnalysis } = await import('@/utils/demoMode');
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockData = await getMockTextAnalysis();
        const kw = mockData?.keywords?.[0] || '';
        const mapped = mapToFrontendCategory(kw);
        if (mapped) setRCategory(mapped);
        setAiSuggestion(kw ? `Analyzed: ${mapped} (Demo Mode)` : 'No suggestion from text');
        return;
      }
      
      const res = await fetch(`${apiBase}/ai/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rDescription || '' })
      });
      if (res.ok) {
        const data = await res.json();
        const kw = data?.keywords?.[0] || '';
        const mapped = mapToFrontendCategory(kw);
        if (mapped) setRCategory(mapped);
        setAiSuggestion(kw ? `Analyzed: ${mapped}` : 'No suggestion from text');
      } else {
        setAiSuggestion('Text analysis failed');
      }
    } catch (_) {
      setAiSuggestion('Text analysis error');
    }
  };

  const onEstimateSeverity = async () => {
    setAiSeverity('Estimating...');
    try {
      const payload = { text: rDescription || '' };
      if (imageDataUrl) payload.image_data_url = imageDataUrl;
      const res = await fetch(`${apiBase}/ai/severity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setAiSeverity(`Severity: ${data.level} (score ${data.score})`);
      } else {
        setAiSeverity('Severity estimation failed');
      }
    } catch (_) {
      setAiSeverity('Severity estimation error');
    }
  };

  const onSubmitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        category: rCategory,
        description: rDescription,
        lat: parseFloat(rLat),
        lng: parseFloat(rLng),
        ward: rWard,
        media_urls: imageDataUrl ? [imageDataUrl] : [],
        is_anonymous: !!isAnonymous,
        address_line1: addrLine1,
        address_line2: addrLine2,
        street: addrStreet,
        landmark: addrLandmark,
        pincode: addrPincode,
      };
      await createIssue(body).unwrap();
      toast.success('Environmental report submitted successfully! Authorities will review it soon.', {
        duration: 4000,
      });
      setIsReportOpen(false);
      setRCategory(''); setRWard(''); setRDescription(''); setRLat(''); setRLng('');
      setAddrLine1(''); setAddrLine2(''); setAddrStreet(''); setAddrLandmark(''); setAddrPincode('');
      setIsAnonymous(false); setImageDataUrl(''); setAiSuggestion(''); setAiSeverity('');
    } catch (err) {
      toast.error(err?.data?.detail || 'Failed to submit environmental report. Please try again.', {
        duration: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to get icon for category
  const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('garbage') || cat.includes('dump') || cat.includes('overflow') || cat.includes('litter') || cat.includes('dumping')) return Trash2;
    if (cat.includes('plastic')) return Package;
    if (cat.includes('burning') || cat.includes('fire')) return Flame;
    if (cat.includes('water') || cat.includes('body') || cat.includes('pollution') || cat.includes('contaminated')) return Droplets;
    if (cat.includes('construction')) return Building2;
    if (cat.includes('electronic') || cat.includes('e-waste')) return Cpu;
    if (cat.includes('biomedical') || cat.includes('medical')) return Syringe;
    if (cat.includes('green space') || cat.includes('degradation')) return TreePine;
    if (cat.includes('drainage') || cat.includes('drain')) return Gauge;
    if (cat.includes('other')) return CircleAlert;
    return AlertCircle;
  };

  const mapToFrontendCategory = (label) => {
    const l = (label || '').toLowerCase();
    if (l.includes('garbage') || l.includes('waste') || l.includes('dump')) return 'Open Garbage Dump';
    if (l.includes('plastic')) return 'Plastic Pollution';
    if (l.includes('burning') || l.includes('fire') || l.includes('smoke')) return 'Open Burning';
    if (l.includes('water body') || l.includes('lake') || l.includes('river') || l.includes('pond')) return 'Water Body Pollution';
    if (l.includes('construction') || l.includes('demolition')) return 'Construction Waste';
    if (l.includes('e-waste') || l.includes('electronic')) return 'Electronic Waste (E-Waste)';
    if (l.includes('biomedical') || l.includes('medical') || l.includes('hospital')) return 'Biomedical Waste';
    if (l.includes('green space') || l.includes('deforestation') || l.includes('tree')) return 'Green Space Degradation';
    if (l.includes('drainage') || l.includes('drain') || l.includes('blocked')) return 'Drainage Blockage';
    if (l.includes('water pollution') || l.includes('contaminated water') || l.includes('sewage')) return 'Water Pollution / Contaminated Water';
    if (l.includes('garbage overflow') || l.includes('overflowing')) return 'Garbage Overflow';
    if (l.includes('illegal dumping') || l.includes('litter') || l.includes('trash')) return 'Illegal Dumping / Litter';
    if (l.includes('garbage')) return 'Garbage';
    if (l.includes('leak') || l.includes('waterlogging') || l.includes('sewer')) return 'Water Issue';
    if (l.includes('crack') || l.includes('road')) return 'Road Problem';
    return 'Other';
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

  const getAddressString = (issue) => {
    const parts = [];
    if (issue.address_line1) parts.push(issue.address_line1);
    if (issue.address_line2) parts.push(issue.address_line2);
    if (issue.street) parts.push(issue.street);
    if (issue.landmark) parts.push(`Near ${issue.landmark}`);
    if (issue.pincode) parts.push(issue.pincode);
    return parts.length > 0 ? parts.join(', ') : `${issue.lat?.toFixed(4)}, ${issue.lng?.toFixed(4)}`;
  };

  // Count issues for filter chips
  const getStatusCount = (statusValue) => {
    if (!issues) return 0;
    if (statusValue === '') return issues.length;
    return issues.filter(issue => issue.status === statusValue).length;
  };

  const getCategoryCount = (categoryValue) => {
    if (!issues) return 0;
    if (categoryValue === '') return issues.length;
    return issues.filter(issue => issue.category === categoryValue).length;
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'new', label: 'Reported' },
    { value: 'in_progress', label: 'Cleanup In Progress' },
    { value: 'resolved', label: 'Cleaned Up' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Open Garbage Dump', label: 'Open Garbage Dump' },
    { value: 'Plastic Pollution', label: 'Plastic Pollution' },
    { value: 'Open Burning', label: 'Open Burning' },
    { value: 'Water Body Pollution', label: 'Water Body Pollution' },
    { value: 'Construction Waste', label: 'Construction Waste' },
    { value: 'Electronic Waste (E-Waste)', label: 'E-Waste' },
    { value: 'Biomedical Waste', label: 'Biomedical Waste' },
    { value: 'Green Space Degradation', label: 'Green Space' },
    { value: 'Drainage Blockage', label: 'Drainage' },
    { value: 'Water Pollution / Contaminated Water', label: 'Water Pollution' },
    { value: 'Garbage Overflow', label: 'Garbage Overflow' },
    { value: 'Illegal Dumping / Litter', label: 'Illegal Dumping' },
    { value: 'Other Environmental Issues', label: 'Other' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      {/* Demo Mode Banner */}
      {showDemoBanner && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎥</span>
              <div>
                <p className="font-semibold text-yellow-800">DEMO MODE - Using simulated AI data</p>
                <p className="text-sm text-yellow-700">AI detection and text analysis are using precomputed results for smooth demo experience.</p>
              </div>
            </div>
            <button
              onClick={() => setShowDemoBanner(false)}
              className="text-yellow-600 hover:text-yellow-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Enhanced Page Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                All Environmental Reports
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Monitor and track environmental issues across your city
              </p>
            </div>
            <Button 
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
              onClick={() => setIsReportOpen(true)}
            >
              + Report New Issue
            </Button>
          </div>
        </div>

        {/* Sticky Filter Bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500">Status:</span>
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatus(option.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    status === option.value
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                  {option.value && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                      status === option.value ? 'bg-white/20' : 'bg-white'
                    }`}>
                      {getStatusCount(option.value)}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <Select value={category} onValueChange={(value) => setCategory(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-[180px] bg-white border-gray-200">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value === '' ? 'all' : opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] bg-white border-gray-200">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Newest First</SelectItem>
                <SelectItem value="date_asc">Oldest First</SelectItem>
                <SelectItem value="upvotes_desc">Most Upvotes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Report Cards Grid */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading environmental reports...</p>
            </div>
          </div>
        )}

        {isError && (
          <Card className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <div>
                <p className="text-red-600 font-semibold text-lg">Failed to load environmental reports</p>
                <p className="text-sm text-gray-500 mt-1">Please check your connection and try again.</p>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </div>
          </Card>
        )}

        {!isLoading && !isError && issues?.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <AlertCircle className="h-16 w-16 mx-auto opacity-50" />
              </div>
              <p className="text-gray-600 font-medium text-lg">No environmental reports found</p>
              <p className="text-sm text-gray-500 mt-2">Be the first to report environmental issues in your area! 🍃</p>
            </div>
          </Card>
        )}

        {!isLoading && !isError && paginatedIssues?.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {paginatedIssues.map((issue, index) => {
              const CategoryIcon = getCategoryIcon(issue.category);
              const mediaCount = issue.media_urls?.length || 0;
              
              return (
                <Card
                  key={issue.id}
                  className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleViewDetails(issue)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Main Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <CategoryIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-gray-500">#{issue.id}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm font-semibold text-gray-800">{issue.category}</span>
                              {issue.assigned_department && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                                    {issue.assigned_department}
                                  </span>
                                </>
                              )}
                            </div>
                            {statusBadge(issue.status)}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-800 font-medium mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {issue.description}
                        </p>

                        {/* Meta Row */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[200px]">{getAddressString(issue)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            <span>{issue.reporter_name || 'Anonymous'}</span>
                          </div>
                          {issue.assigned_admin_name && (
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">Admin:</span>
                              <span>{issue.assigned_admin_name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Icons & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          {mediaCount > 0 && (
                            <div className="flex items-center gap-1">
                              <ImageIcon className="h-4 w-4" />
                              <span className="font-medium">{mediaCount}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span className="font-medium">{issue.upvotes ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(issue.created_at)}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 font-medium">
              Showing {startItem}-{endItem} of {issues.length} environmental reports
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

      {/* Report Form Sheet (unchanged) */}
      <Sheet open={isReportOpen} onOpenChange={setIsReportOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Report a New Environmental Issue</SheetTitle>
          </SheetHeader>
          <form onSubmit={onSubmitReport} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Category</label>
                <Select value={rCategory} onValueChange={setRCategory}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open Garbage Dump">
                      <span className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4 text-gray-500" />
                        Open Garbage Dump
                      </span>
                    </SelectItem>
                    <SelectItem value="Plastic Pollution">
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        Plastic Pollution
                      </span>
                    </SelectItem>
                    <SelectItem value="Open Burning">
                      <span className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-gray-500" />
                        Open Burning
                      </span>
                    </SelectItem>
                    <SelectItem value="Water Body Pollution">
                      <span className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-gray-500" />
                        Water Body Pollution
                      </span>
                    </SelectItem>
                    <SelectItem value="Construction Waste">
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        Construction Waste
                      </span>
                    </SelectItem>
                    <SelectItem value="Electronic Waste (E-Waste)">
                      <span className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-gray-500" />
                        Electronic Waste (E-Waste)
                      </span>
                    </SelectItem>
                    <SelectItem value="Biomedical Waste">
                      <span className="flex items-center gap-2">
                        <Syringe className="h-4 w-4 text-gray-500" />
                        Biomedical Waste
                      </span>
                    </SelectItem>
                    <SelectItem value="Green Space Degradation">
                      <span className="flex items-center gap-2">
                        <TreePine className="h-4 w-4 text-gray-500" />
                        Green Space Degradation
                      </span>
                    </SelectItem>
                    <SelectItem value="Drainage Blockage">
                      <span className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-gray-500" />
                        Drainage Blockage
                      </span>
                    </SelectItem>
                    <SelectItem value="Water Pollution / Contaminated Water">
                      <span className="flex items-center gap-2">
                        <Waves className="h-4 w-4 text-gray-500" />
                        Water Pollution / Contaminated Water
                      </span>
                    </SelectItem>
                    <SelectItem value="Garbage Overflow">
                      <span className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4 text-gray-500" />
                        Garbage Overflow
                      </span>
                    </SelectItem>
                    <SelectItem value="Illegal Dumping / Litter">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-500" />
                        Illegal Dumping / Litter
                      </span>
                    </SelectItem>
                    <SelectItem value="Other Environmental Issues">
                      <span className="flex items-center gap-2">
                        <CircleAlert className="h-4 w-4 text-gray-500" />
                        Other Environmental Issues
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm mb-1">Ward/Area</label>
                <Select value={rWard} onValueChange={setRWard}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Select Ward" /></SelectTrigger>
                  <SelectContent>
                    {['Andheri','Bandra','Dadar','Mumbai Central','Thane'].map(w => (
                      <SelectItem key={w} value={w}>{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Description</label>
              <textarea className="w-full border rounded px-3 py-2 min-h-[90px]" value={rDescription} onChange={(e) => setRDescription(e.target.value)} placeholder="Describe the environmental issue in detail..." required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Address Line 1</label>
                <Input value={addrLine1} onChange={(e) => setAddrLine1(e.target.value)} placeholder="House/Block, Area" />
              </div>
              <div>
                <label className="block text-sm mb-1">Address Line 2</label>
                <Input value={addrLine2} onChange={(e) => setAddrLine2(e.target.value)} placeholder="Apartment, Nearby area" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1">Street</label>
                <Input value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} placeholder="Street/Road" />
              </div>
              <div>
                <label className="block text-sm mb-1">Landmark</label>
                <Input value={addrLandmark} onChange={(e) => setAddrLandmark(e.target.value)} placeholder="Near ..." />
              </div>
              <div>
                <label className="block text-sm mb-1">Pincode</label>
                <Input value={addrPincode} onChange={(e) => setAddrPincode(e.target.value)} placeholder="e.g. 834001" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-sm mb-1">Latitude</label>
                <Input value={rLat} onChange={(e) => setRLat(e.target.value)} placeholder="19.0760" />
              </div>
              <div>
                <label className="block text-sm mb-1">Longitude</label>
                <Input value={rLng} onChange={(e) => setRLng(e.target.value)} placeholder="72.8777" />
              </div>
              <div>
                <Button type="button" variant="outline" onClick={handleUseMyLocation}>Use My Location</Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm">Photo</label>
              <Input type="file" accept="image/*" onChange={onFileChange} />
              {imageDataUrl ? (
                <img src={imageDataUrl} alt="preview" className="w-full max-h-48 object-cover rounded border" />
              ) : null}
              <div className="text-xs text-neutral-600">{aiSuggestion}</div>
              <div className="text-xs text-neutral-600">{aiSeverity}</div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onAnalyzeText}>Analyze Text</Button>
                <Button type="button" variant="outline" onClick={onEstimateSeverity}>Estimate Severity</Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input id="anon" type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
              <label htmlFor="anon" className="text-sm">Report anonymously</label>
            </div>

            <SheetFooter>
              <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Environmental Report'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
