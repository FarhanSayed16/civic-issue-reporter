# 🎬 Demo Mode Setup Guide

This document explains how to enable **DEMO MODE** for recording demo videos and testing.

## ⚠️ IMPORTANT WARNINGS

- **DEMO MODE is for TESTING/DEMO ONLY**
- **MUST be disabled in production**
- **Bypasses duplicate issue detection**
- **Allows multiple submissions from same location**

---

## 🎯 What Demo Mode Does

### 1. **Auto-Detect Text Variation (Mobile App)**
- Auto-detect button randomly selects from **7 different environmental descriptions**
- Each click shows a different, realistic description
- Makes demo videos look dynamic and authentic

### 2. **Bypass Duplicate Detection (Backend)**
- When enabled, allows multiple issue submissions from the same location
- Useful for recording demo videos without 409 errors
- Original duplicate detection logic remains intact (just skipped)

---

## 🚀 How to Enable Demo Mode

### Step 1: Edit Backend `.env` File

Navigate to `civic_issue_backend/` and create or edit `.env`:

```bash
# Enable demo mode (allows repeated testing from same location)
DEMO_MODE=true
```

### Step 2: Restart Backend Server

```bash
cd civic_issue_backend
python start.py
```

### Step 3: Verify Demo Mode is Active

Check backend logs for confirmation:
```
✅ Demo Mode: ENABLED (duplicate detection bypassed)
```

---

## 🔄 How to Disable Demo Mode

### Option 1: Set to `false` in `.env`
```bash
DEMO_MODE=false
```

### Option 2: Remove the line entirely
```bash
# Remove or comment out DEMO_MODE line
# DEMO_MODE=true
```

Then restart the backend server.

---

## 📱 Mobile App Auto-Detect Variation

The mobile app's "AI AUTO DETECT" button now randomly selects from **7 environmental descriptions**:

1. **Open Garbage Dump** - Large illegal dump near residential area
2. **Plastic Waste** - Roadside plastic accumulation
3. **Overflowing Bin** - Waste bin spilling onto sidewalk
4. **Open Waste Dumping** - Unauthorized disposal near buildings
5. **Biomedical Waste** - Medical waste and syringes in public area
6. **Construction Waste** - Debris and rubble blocking pathways
7. **E-Waste** - Electronics dumped near water body

Each click randomly selects one description for realistic demo variation.

---

## ✅ Verification Checklist

Before recording demo:
- [ ] `DEMO_MODE=true` in backend `.env`
- [ ] Backend server restarted
- [ ] Test auto-detect button shows different descriptions
- [ ] Test multiple issue submissions from same location (should work)
- [ ] No 409 duplicate errors during testing

After demo:
- [ ] Set `DEMO_MODE=false` in `.env`
- [ ] Restart backend server
- [ ] Verify duplicate detection works normally

---

## 🛠️ Technical Details

### Backend Changes
- **File**: `civic_issue_backend/app/core/config.py`
  - Added `DEMO_MODE` setting (reads from `.env`)

- **File**: `civic_issue_backend/app/services/issue_service.py`
  - Modified `create_issue()` to skip duplicate check when `DEMO_MODE=true`
  - Original duplicate detection logic preserved

### Mobile App Changes
- **File**: `frontend/apps/mobile/lib/features/issues/presentation/report_issue_screen.dart`
  - Added `_demoDescriptionPool` with 7 description variations
  - Updated `_magicWrite()` to randomly select from pool

---

## 📝 Notes

- Demo mode changes are **clearly marked with comments**
- Easy to find and remove after demo
- No permanent changes to core logic
- Production behavior unchanged when disabled

---

## 🎥 Demo Recording Tips

1. **Enable demo mode** before starting recording
2. **Test auto-detect** multiple times to show variation
3. **Submit multiple issues** from same location to show it works
4. **Disable demo mode** immediately after recording
5. **Test normal behavior** to ensure everything still works

---

**Last Updated**: Demo mode implementation for hackathon demo video recording.

