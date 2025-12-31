# 🎥 Demo Mode Guide
## How to Enable/Disable Demo Mode for Smooth Hackathon Demos

**Purpose**: Demo mode uses precomputed/simulated data for heavy operations (AI detection, analytics) to ensure smooth, fast demos without breaking real functionality.

---

## 🚀 Quick Start

### **Enable Demo Mode**

**Frontend (Web)**:
1. Create or edit `.env` file in `frontend/apps/web/`
2. Add: `VITE_DEMO_MODE=true`
3. Restart the development server

**Backend**:
1. Set environment variable: `DEMO_MODE=true`
2. Or add to `.env` file in `civic_issue_backend/`: `DEMO_MODE=true`
3. Restart the backend server

### **Disable Demo Mode**

**Frontend (Web)**:
1. Remove `VITE_DEMO_MODE=true` from `.env` or set to `false`
2. Restart the development server

**Backend**:
1. Remove `DEMO_MODE` env var or set to `false`
2. Restart the backend server

---

## 📋 What Gets Simulated in Demo Mode

| Operation | Real Behavior | Demo Mode Behavior |
|-----------|--------------|-------------------|
| **AI Image Detection** | Calls YOLOv8 model (slow, may fail) | Returns precomputed detection from `mock_data/ai_detections.json` |
| **AI Text Analysis** | Calls NLP service (variable speed) | Returns precomputed keywords from `mock_data/text_analysis.json` |
| **Analytics Stats** | Real-time database queries | Returns precomputed stats from `mock_data/analytics.json` |
| **Reverse Geocoding** | API calls (rate limits) | Uses sample locations (optional) |

---

## ✅ What Stays Real in Demo Mode

- ✅ User Authentication
- ✅ Report Submission
- ✅ Report Listing
- ✅ Status Updates
- ✅ Upvotes/Shares
- ✅ All database operations

**Demo mode only affects read-heavy operations, not core functionality.**

---

## 🎯 Demo Mode Indicators

When demo mode is enabled, you'll see:

1. **Banner on Report Issue Page**: "🎥 DEMO MODE - Using simulated AI data"
2. **Banner on Analytics Page**: "🎥 DEMO MODE - Using simulated analytics data"
3. **AI Suggestions**: Will show "(Demo Mode)" in the suggestion text

---

## 📁 Mock Data Files

Mock data files are located in:
- **Frontend**: `frontend/apps/web/public/mock_data/`
- **Backend**: `civic_issue_backend/mock_data/`

**Files**:
- `ai_detections.json` - Precomputed AI detection results
- `text_analysis.json` - Precomputed text analysis keywords
- `analytics.json` - Precomputed analytics stats
- `sample_locations.json` - Sample location addresses

---

## 🔧 Configuration

### **Frontend Configuration**

**File**: `frontend/apps/web/.env`

```env
VITE_DEMO_MODE=true
VITE_API_URL=http://localhost:8585
```

### **Backend Configuration**

**File**: `civic_issue_backend/.env`

```env
DEMO_MODE=true
```

**Or set environment variable**:
```bash
export DEMO_MODE=true
```

---

## 🧪 Testing Demo Mode

### **Test AI Detection (Demo Mode)**:
1. Enable demo mode
2. Go to "Report Issue" page
3. Upload an image
4. Should see: "Detected: [Category] (Demo Mode)"
5. Response should be instant (< 1 second)

### **Test Analytics (Demo Mode)**:
1. Enable demo mode
2. Go to "Analytics Dashboard"
3. Should see demo banner
4. Stats should load instantly with precomputed values

### **Test Real Mode**:
1. Disable demo mode
2. Upload an image
3. Should see real AI detection (may take 2-5 seconds)
4. Analytics should show real database values

---

## ⚠️ Important Notes

1. **Demo mode is opt-in**: Must explicitly enable via environment variable
2. **Non-destructive**: Demo mode doesn't write any data
3. **Easy to disable**: Just remove env var and restart
4. **Clearly marked**: UI banners indicate when demo mode is active
5. **Real functionality preserved**: When demo mode is off, everything works normally

---

## 🎬 For Hackathon Demo

**Recommended Setup**:
1. Enable demo mode before recording
2. Test all features with demo mode enabled
3. Record demo video with smooth, fast responses
4. Mention in presentation: "We've enabled demo mode for smooth video recording, but the platform works with real AI in production"

**Benefits**:
- ✅ No waiting for slow AI inference
- ✅ No API rate limit issues
- ✅ Consistent, predictable results
- ✅ Professional demo experience

---

## 📝 Troubleshooting

### **Demo mode not working?**
- Check `.env` file exists and has correct variable name
- Restart development server after changing `.env`
- Check browser console for errors
- Verify mock data files exist in `public/mock_data/`

### **Want to customize mock data?**
- Edit JSON files in `frontend/apps/web/public/mock_data/`
- Changes take effect immediately (no restart needed)
- Keep JSON format valid

---

**Document Status**: ✅ Complete  
**Last Updated**: December 2025  
**For**: Hackathon Demo Preparation

