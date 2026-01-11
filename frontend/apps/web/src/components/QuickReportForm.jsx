// Quick Report Form Component - Phase 8 Enhancement
// Simplified form for quick environmental issue reporting

import React, { useState } from 'react';
import { useCreateIssueMutation } from '@/features/api/issues.api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Camera, MapPin, Sparkles, X } from 'lucide-react';
import { Trash2, Droplets, Flame, Building2, Cpu, Syringe, TreePine, Gauge, Waves, AlertCircle, CircleAlert, Package } from 'lucide-react';

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

export function QuickReportForm({ open, onOpenChange }) {
  const [category, setCategory] = useState('Open Garbage Dump');
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createIssue] = useCreateIssueMutation();

  // Get current location
  const [location, setLocation] = useState({ lat: null, lng: null, address: 'Getting location...' });

  React.useEffect(() => {
    if (open && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          });
        },
        () => {
          setLocation({ lat: null, lng: null, address: 'Location not available' });
        }
      );
    }
  }, [open]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.lat || !location.lng) {
      toast.error('Please enable location access for quick reporting');
      return;
    }

    setIsSubmitting(true);
    try {
      await createIssue({
        category,
        description: `Quick report: ${category}`,
        lat: location.lat,
        lng: location.lng,
        media_urls: imageDataUrl ? [imageDataUrl] : [],
        is_anonymous: false,
      }).unwrap();
      
      toast.success('Quick report submitted successfully!');
      setCategory('Open Garbage Dump');
      setImageDataUrl(null);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to submit quick report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            <SheetTitle>Quick Environmental Report</SheetTitle>
          </div>
          <p className="text-sm text-gray-500 mt-1">Report environmental issues in seconds</p>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-white">
                <div className="flex items-center gap-2">
                  {React.createElement(getCategoryIcon(category), { className: "h-4 w-4 text-gray-500" })}
                  <SelectValue placeholder="Select Category" />
                </div>
              </SelectTrigger>
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

          {/* Location Display */}
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{location.address}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Auto-detected from your device</p>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Photo (Optional)</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-md hover:border-green-500 transition-colors">
                  <Camera className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {imageDataUrl ? 'Photo selected' : 'Take/Upload Photo'}
                  </span>
                </div>
              </label>
              {imageDataUrl && (
                <button
                  type="button"
                  onClick={() => setImageDataUrl(null)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {imageDataUrl && (
              <img src={imageDataUrl} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-md border" />
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || !location.lat || !location.lng}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quick Report'}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Report will be automatically submitted with your location
            </p>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

