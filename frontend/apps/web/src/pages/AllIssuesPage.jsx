import React, { useMemo, useState } from 'react';
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
  
  // ✅ 2. Create a debounced value for the search term
  // It will only update 500ms after the user stops typing
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const wardOptions = ['Ward 1', 'Ward 2', 'Ward 3'];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ 3. Pass the DEBOUNCED search term to the query hook
  // The API call will now only be made when the user pauses typing
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
      new: 'bg-blue-500 text-white',
      in_progress: 'bg-yellow-500 text-white',
      resolved: 'bg-green-500 text-white',
      pending: 'bg-gray-400 text-white',
    };
    const className = statusMap[s] || 'bg-gray-300 text-gray-800';
    const formattedStatus = (s || '').replace('_', ' ').replace(/^./, c => c.toUpperCase());
    
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{formattedStatus}</span>;
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
      // Auto invoke AI detect to suggest category
      setAiSuggestion('Detecting from image...');
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
      // Reset and close
      setIsReportOpen(false);
      setRCategory(''); setRWard(''); setRDescription(''); setRLat(''); setRLng('');
      setAddrLine1(''); setAddrLine2(''); setAddrStreet(''); setAddrLandmark(''); setAddrPincode('');
      setIsAnonymous(false); setImageDataUrl(''); setAiSuggestion(''); setAiSeverity('');
    } catch (err) {
      // Keep sheet open; user can correct
    } finally {
      setSubmitting(false);
    }
  };

  const mapToFrontendCategory = (label) => {
    const l = (label || '').toLowerCase();
    if (l.includes('pothole')) return 'Pothole';
    if (l.includes('manhole')) return 'Broken Streetlight' === 'x' ? 'Manhole' : 'Manhole';
    if (l.includes('garbage')) return 'Garbage';
    if (l.includes('leak') || l.includes('waterlogging') || l.includes('sewer')) return 'Water Issue';
    if (l.includes('crack') || l.includes('road')) return 'Road Problem';
    return 'Other';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-800">All Reported Issues</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-neutral-700">Filter & Search Issues</CardTitle>
          <Button className="bg-accent hover:bg-accent/90" onClick={() => setIsReportOpen(true)}>+ Report New Issue</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by description, ID, etc..."
                // The input still updates the immediate state
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Status Filter */}
            <Select value={status} onValueChange={(value) => setStatus(value === 'all' ? '' : value)}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={category} onValueChange={(value) => setCategory(value === 'all' ? '' : value)}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Pothole">Pothole</SelectItem>
                <SelectItem value="Broken Streetlight">Broken Streetlight</SelectItem>
                <SelectItem value="Illegal Dumping">Illegal Dumping</SelectItem>
              </SelectContent>
            </Select>

            {/* Ward Filter */}
            <Select value={ward} onValueChange={(value) => setWard(value === 'all' ? '' : value)}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Ward/Area" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {wardOptions.map(w => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Sort By" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Newest</SelectItem>
                <SelectItem value="date_asc">Oldest</SelectItem>
                <SelectItem value="upvotes_desc">Most Upvotes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto bg-white rounded-md border">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-100 text-neutral-600">
                <tr>
                  <th className="text-left p-3 font-medium">ID</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-left p-3 font-medium">Reporter</th>
                  <th className="text-left p-3 font-medium">Upvotes</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Date Reported</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={8} className="p-6 text-center text-neutral-500">Loading issues...</td></tr>
                )}
                {isError && (
                  <tr><td colSpan={8} className="p-6 text-center text-red-600">Failed to load issues. Please try again later.</td></tr>
                )}
                {!isLoading && !isError && issues?.length === 0 && (
                  <tr><td colSpan={8} className="p-6 text-center text-neutral-500">No issues found matching your criteria.</td></tr>
                )}
                {paginatedIssues?.map((issue) => (
                  <tr key={issue.id} className="border-t hover:bg-neutral-50">
                    <td className="p-3 text-neutral-500">#{issue.id}</td>
                    <td className="p-3 font-medium">{issue.category}</td>
                    <td className="p-3 max-w-[420px] truncate text-neutral-700">{issue.description}</td>
                    <td className="p-3 font-medium text-neutral-600">{issue.reporter_name || 'Anonymous'}</td>
                    <td className="p-3 font-semibold text-neutral-800">{issue.upvotes ?? 0}</td>
                    <td className="p-3">{statusBadge(issue.status)}</td>
                    <td className="p-3">{issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-3">
                      <Button onClick={() => handleViewDetails(issue)} variant="outline" size="sm">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between px-4">
              <div className="text-sm text-neutral-500">
                Showing {startItem}-{endItem} of {issues.length} issues
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className={`px-3 py-1 text-sm border rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-neutral-300 hover:bg-neutral-50'
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
                  className="px-3 py-1 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isReportOpen} onOpenChange={setIsReportOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Report a New Issue</SheetTitle>
          </SheetHeader>
          <form onSubmit={onSubmitReport} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Category</label>
                <Select value={rCategory} onValueChange={setRCategory}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pothole">Pothole</SelectItem>
                    <SelectItem value="Broken Streetlight">Broken Streetlight</SelectItem>
                    <SelectItem value="Illegal Dumping">Illegal Dumping</SelectItem>
                    <SelectItem value="Water Issue">Water Issue</SelectItem>
                    <SelectItem value="Road Problem">Road Problem</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
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
              <textarea className="w-full border rounded px-3 py-2 min-h-[90px]" value={rDescription} onChange={(e) => setRDescription(e.target.value)} placeholder="Describe the issue in detail..." required />
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
                {submitting ? 'Submitting...' : 'Submit Issue'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}