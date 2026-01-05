# 🎯 Refactoring Plan: Civic Issue Reporter → SwachhCity (Environment/Waste Monitoring)

**Project Transformation Strategy**  
**From**: Nagar Seva / Civic Issue Reporter  
**To**: SwachhCity (Environment & Waste Monitoring Platform)  
**Date**: December 2025  
**Status**: Planning Phase

---

## 📋 Executive Summary

This document outlines a strategic plan to transform the existing **Civic Issue Reporter** platform into **SwachhCity**, an environment-focused waste monitoring and cleanliness management system. The transformation leverages 90% of the existing architecture while rebranding and refocusing the application on environmental issues.

**Key Strategy**: 
- ✅ Reuse entire technical infrastructure (auth, maps, admin flow, analytics, real-time, trust score)
- ✅ Conceptual rebranding with minimal code changes where possible
- ✅ Targeted changes to categories, departments, AI models, and analytics focus
- ✅ Add environment-specific features using existing patterns

---

## 🎯 New Project Identity

### Project Name
**SwachhCity** (Clean City in Hindi/Sanskrit)
- Conveys cleanliness and environmental awareness
- Maintains civic engagement focus
- Easy to remember and brand

### Problem Statement
**SwachhCity** enables citizens, environmental authorities, NGOs, and volunteers to collaboratively monitor, report, and resolve environmental issues including:
- Waste accumulation and illegal dumping
- Open garbage sites and overflowing bins
- Plastic pollution and litter hotspots
- Air quality issues (open burning, construction dust)
- Water pollution (contaminated water bodies, illegal discharge)
- Green space degradation (deforestation, land degradation)
- Community cleanliness and hygiene issues

### Target Users

**Primary Users:**
1. **Citizens** - Report environmental issues, track resolution, build eco-reputation
2. **Environmental Authorities** - Municipal waste departments, pollution control boards
3. **NGOs & Volunteers** - Community cleanup organizers, environmental activists
4. **Waste Management Teams** - Field workers managing waste collection and disposal

**User Roles:**
- `citizen` → Remains the same (reporters of environmental issues)
- `admin` → Rebranded as "Environmental Officer" / "Waste Management Officer"
- New role (optional): `volunteer` → Community cleanup organizers

---

## 🔄 Concept Mapping Table

### Core Entity Mapping

| Old Concept | New Concept | Change Type |
|------------|-------------|-------------|
| **Civic Issue** | **Environmental Issue** | Conceptual rename |
| **Issue Reporter** | **Environmental Reporter** | Conceptual rename |
| **Department** | **Environmental Authority / Waste Management Dept** | Rebrand |
| **Trust Score** | **Eco-Score / Green Points** | Rebrand (same logic) |
| **Upvote** | **Verify / Confirm** | Conceptual (same feature) |
| **Resolution** | **Cleanup / Remediation** | Terminology update |

### Category Mapping

| Old Category | New Category | Logic Change |
|-------------|--------------|--------------|
| **Potholes** | ❌ **REMOVE** | Not environment-focused |
| **Road Cracks** | ❌ **REMOVE** | Not environment-focused |
| **Manholes** | ❌ **REMOVE** (or → **Sewage Leak** if pollution-related) | Conditional |
| **Stagnant Water** | ✅ **Water Pollution / Contaminated Water** | Refocus to pollution |
| **Damaged Signboards** | ❌ **REMOVE** | Not environment-focused |
| **Garbage Overflow** | ✅ **Garbage Overflow** | KEEP (perfect fit) |
| **Trash** | ✅ **Illegal Dumping / Litter** | Refine naming |
| **Other Issues** | ✅ **Other Environmental Issues** | Keep as catch-all |

**New Categories to Add:**
1. **Open Garbage Dump** - Large illegal waste sites
2. **Plastic Pollution** - Plastic waste hotspots
3. **Open Burning** - Waste burning causing air pollution
4. **Water Body Pollution** - Contaminated lakes, rivers, ponds
5. **Construction Waste** - Illegal construction debris dumping
6. **Electronic Waste (E-Waste)** - Improper e-waste disposal
7. **Biomedical Waste** - Medical waste in public areas
8. **Green Space Degradation** - Deforestation, land degradation
9. **Drainage Blockage** - Blocked drains causing waterlogging

### Department Mapping

| Old Department | New Department | Change Type |
|---------------|----------------|-------------|
| **Road Maintenance Department** | ❌ **REMOVE** | Not needed |
| **Sewer Department** | ✅ **Waste Water Management** (if pollution-related) | Refocus or remove |
| **Water Department** | ✅ **Water Quality Department** | Refocus to pollution |
| **Traffic Department** | ❌ **REMOVE** | Not environment-focused |
| **Waste Management Department** | ✅ **Solid Waste Management** | KEEP & enhance |
| **Electrical Department** | ❌ **REMOVE** | Not environment-focused |
| **General Department** | ✅ **Environmental Authority** | Rebrand |

**New Departments to Add:**
1. **Municipal Waste Collection** - Primary waste management
2. **Pollution Control Board** - Air/water quality monitoring
3. **Sanitation Department** - Public cleanliness and hygiene
4. **Hazardous Waste Management** - Specialized waste handling
5. **Green Space Management** - Parks, forests, green areas
6. **Community Cleanup Coordination** - NGO/volunteer coordination

### Status Mapping

| Old Status | New Status | Change Type |
|-----------|------------|-------------|
| **new** | ✅ **reported** | Terminology (more citizen-friendly) |
| **in_progress** | ✅ **cleanup_in_progress** | Environment-specific |
| **resolved** | ✅ **cleaned / remediated** | Terminology |
| **spam** | ✅ **invalid** | Same concept, better name |

### Priority/Urgency Mapping

| Old Priority | New Priority | Change Type |
|-------------|--------------|-------------|
| **high** | ✅ **critical** (health hazard, toxic waste) | Environment-focused |
| **medium** | ✅ **high** (visible pollution, community impact) | Adjusted scale |
| **low** | ✅ **medium** (minor litter, cosmetic issues) | Adjusted scale |
| - | ✅ **low** (minor cleanup needed) | Add new level |

### Analytics Metric Mapping

| Old Metric | New Metric | Focus Change |
|-----------|------------|--------------|
| **Total Issues** | ✅ **Total Environmental Reports** | Rebrand |
| **Resolved Today** | ✅ **Cleanups Completed Today** | Terminology |
| **Pending Issues** | ✅ **Pending Cleanups** | Terminology |
| **Avg Resolution Time** | ✅ **Avg Cleanup Time** | Terminology |
| **Department Performance** | ✅ **Authority Performance** | Rebrand |
| **Issue Heatmap** | ✅ **Pollution/Waste Heatmap** | Refocus |
| - | ✅ **NEW: Waste Volume Trends** | New metric |
| - | ✅ **NEW: Pollution Severity Index** | New metric |
| - | ✅ **NEW: Community Engagement Score** | New metric |
| - | ✅ **NEW: Cleanup Efficiency Rate** | New metric |

---

## ✅ What Stays the Same (No Changes Needed)

### Core Infrastructure (100% Reusable)

1. **Authentication System**
   - JWT-based authentication ✅
   - Encrypted password transmission (AES-GCM) ✅
   - Phone-based registration ✅
   - Role-based access control ✅
   - **Action**: Only update UI text/labels

2. **Database Schema**
   - `users` table structure ✅
   - `issues` table structure ✅ (just category values change)
   - `messages` table ✅
   - `notifications` table ✅
   - `upvotes` table ✅ (works as "verify/confirm")
   - **Action**: No schema changes, only data updates

3. **API Architecture**
   - RESTful endpoints ✅
   - WebSocket for real-time ✅
   - File upload system ✅
   - Presigned URL generation ✅
   - **Action**: Only endpoint documentation updates

4. **Frontend Architecture**
   - React + Redux structure ✅
   - Component hierarchy ✅
   - Routing system ✅
   - State management ✅
   - **Action**: Only text/content updates

5. **Mobile App Architecture**
   - Flutter structure ✅
   - Navigation flow ✅
   - Camera/GPS integration ✅
   - API client ✅
   - **Action**: Only UI text and category options

6. **Real-time Features**
   - WebSocket notifications ✅
   - Chat system ✅
   - Live status updates ✅
   - **Action**: No changes

7. **Trust Score System**
   - Point calculation logic ✅
   - Gamification mechanism ✅
   - User reputation tracking ✅
   - **Action**: Rebrand as "Eco-Score" or "Green Points"

8. **Maps & Location**
   - Interactive map visualization ✅
   - GPS location detection ✅
   - Reverse geocoding ✅
   - Distance calculations ✅
   - **Action**: No changes, perfect fit

9. **File Storage**
   - Image upload system ✅
   - Cloud storage integration ✅
   - Media URL management ✅
   - **Action**: No changes

---

## 🔄 What Changes Conceptually (Renaming & Rebranding)

### Backend Changes

#### 1. **Category Values** (String fields - easy update)
- **Location**: `Issue.category` field, `issue_service.py` category mappings
- **Change**: Update category list from civic categories to environmental categories
- **Files**:
  - `civic_issue_backend/app/services/issue_service.py` - `_analyze_category()`, `_map_department()`
  - `civic_issue_backend/app/services/nlp_service.py` - Keyword detection
  - **Complexity**: LOW - Just string replacements

#### 2. **Department Mapping** (String fields - easy update)
- **Location**: `Issue.assigned_department`, `User.department`
- **Change**: Update department names to environmental authorities
- **Files**:
  - `civic_issue_backend/app/services/issue_service.py` - `_map_department()`
  - `civic_issue_backend/init_db.py` - Sample data
  - **Complexity**: LOW - String updates

#### 3. **Status Values** (String fields - optional update)
- **Location**: `Issue.status` field
- **Change**: Optionally update status names (can keep as-is too)
- **Files**: Same files that use status strings
- **Complexity**: LOW - Optional, can keep "new", "in_progress", "resolved"

#### 4. **Priority Labels** (String fields - optional update)
- **Location**: `Issue.priority` field
- **Change**: Optionally refine priority labels for environmental context
- **Complexity**: LOW - Optional

#### 5. **NLP Keywords** (Configuration - easy update)
- **Location**: `nlp_service.py` keyword detection
- **Change**: Update keywords to detect environmental issues
- **Files**:
  - `civic_issue_backend/app/services/nlp_service.py`
  - **Complexity**: LOW - Keyword list updates

#### 6. **Analytics Labels & Metrics** (Display logic)
- **Location**: Analytics service, dashboard components
- **Change**: Update metric names and labels
- **Files**:
  - `civic_issue_backend/app/services/analytics_service.py`
  - `frontend/apps/web/src/pages/DashboardPage.jsx`
  - **Complexity**: LOW - Text/label updates

### Frontend Changes (Web Dashboard)

#### 1. **UI Text & Labels** (Content updates)
- Page titles, headings, button labels
- **Files**: All JSX files in `frontend/apps/web/src/pages/`
- **Complexity**: LOW - Text replacements

#### 2. **Category Dropdowns** (Configuration)
- Update category options in filters and forms
- **Files**:
  - `frontend/apps/web/src/pages/AllIssuesPage.jsx`
  - `frontend/apps/web/src/components/IssueForm.jsx` (if exists)
- **Complexity**: LOW - Array updates

#### 3. **Department Filters** (Configuration)
- Update department options
- **Complexity**: LOW - Array updates

#### 4. **Analytics Dashboard Labels** (Display)
- Update metric labels and descriptions
- **Complexity**: LOW - Text updates

#### 5. **Map Markers & Popups** (Optional styling)
- Could update marker colors/icons for environmental context
- **Complexity**: LOW - CSS/styling

### Mobile App Changes

#### 1. **Category Selection** (Configuration)
- Update category list in report form
- **Files**:
  - `frontend/apps/mobile/lib/features/issues/presentation/report_issue_screen.dart`
- **Complexity**: LOW - Array updates

#### 2. **UI Text & Labels** (Content)
- Screen titles, button labels, messages
- **Files**: All Dart presentation files
- **Complexity**: LOW - String updates

#### 3. **AI Category Mapping** (Configuration)
- Update AI detection → category mapping
- **Files**:
  - `frontend/apps/mobile/lib/core/services/ai_service.dart` - `_mapToFrontendCategory()`
- **Complexity**: LOW - Mapping updates

---

## 🔧 What Changes Technically (Requires Code Logic Changes)

### Backend Changes

#### 1. **AI Model Replacement** (Medium complexity)
- **Current**: YOLOv8 trained on potholes, manholes, cracks
- **Required**: Retrain or replace with waste/environmental detection model
- **Options**:
  - **Option A**: Retrain YOLOv8 on waste/garbage datasets (garbage, plastic, dump sites)
  - **Option B**: Use pre-trained waste detection models (if available)
  - **Option C**: Keep YOLO infrastructure, update labels only (quick hack)
- **Files**:
  - `civic_issue_backend/app/services/ai_service.py`
  - `Model_training/model_training.py` - Retrain model
  - **Complexity**: MEDIUM - Requires model retraining or replacement
- **Recommendation**: For hackathon, use Option C (update labels) + Option A (retrain) if time permits

#### 2. **Severity Scoring Logic** (Low-Medium complexity)
- **Current**: Generic severity score (0-1)
- **Enhancement**: Environment-specific severity calculation
  - Factor in: health hazard level, waste volume, toxicity, community impact
- **Files**:
  - `civic_issue_backend/app/services/nlp_service.py` - `get_severity_score()`
- **Complexity**: LOW-MEDIUM - Logic enhancement

#### 3. **Department Assignment Logic** (Low complexity)
- **Current**: Maps categories to departments
- **Change**: Update mapping dictionary for new categories/departments
- **Files**:
  - `civic_issue_backend/app/services/issue_service.py` - `_map_department()`
- **Complexity**: LOW - Dictionary update

#### 4. **Analytics Calculations** (Low-Medium complexity)
- **Current**: Generic issue metrics
- **Enhancement**: Add environment-specific metrics
  - Waste volume trends
  - Pollution severity index
  - Cleanup efficiency
- **Files**:
  - `civic_issue_backend/app/services/analytics_service.py`
- **Complexity**: LOW-MEDIUM - Add new calculation methods

### Frontend Changes

#### 1. **Category Filter Options** (Low complexity)
- Update category arrays in filter components
- **Complexity**: LOW

#### 2. **Dashboard Metrics Display** (Low complexity)
- Update metric labels and add new metric cards
- **Complexity**: LOW

#### 3. **Form Validation** (Low complexity)
- Update category validation rules
- **Complexity**: LOW

### Mobile App Changes

#### 1. **Report Form Categories** (Low complexity)
- Update category selection UI
- **Complexity**: LOW

#### 2. **AI Detection Mapping** (Low complexity)
- Update AI label → category mapping
- **Complexity**: LOW

---

## ❌ What is Removed

### Categories to Remove
1. **Potholes** - Not environment-focused
2. **Road Cracks** - Not environment-focused
3. **Damaged Signboards** - Not environment-focused
4. **Manholes** - Remove unless reframed as pollution issue

### Departments to Remove
1. **Road Maintenance Department** - Not needed
2. **Traffic Department** - Not needed
3. **Electrical Department** - Not needed
4. **Sewer Department** - Remove or refocus to pollution

### Features to Remove (Optional - can keep if desired)
1. **Road infrastructure focus** - Shift to environmental focus
2. **Civic infrastructure terminology** - Replace with environmental terms

### AI Model Classes to Remove
1. YOLO classes for potholes, cracks, manholes (if retraining model)
2. Update detection labels to environmental objects

---

## ➕ What is Newly Added (Using Existing Patterns)

### New Categories (Add to system)
1. **Open Garbage Dump** - Large illegal waste sites
2. **Plastic Pollution** - Plastic waste hotspots
3. **Open Burning** - Waste burning causing air pollution
4. **Water Body Pollution** - Contaminated lakes, rivers
5. **Construction Waste** - Illegal construction debris
6. **Electronic Waste (E-Waste)** - Improper e-waste disposal
7. **Biomedical Waste** - Medical waste in public areas
8. **Green Space Degradation** - Deforestation, land issues
9. **Drainage Blockage** - Blocked drains (if environmental impact)

### New Departments (Add to system)
1. **Municipal Waste Collection** - Primary waste management
2. **Pollution Control Board** - Air/water quality
3. **Sanitation Department** - Public cleanliness
4. **Hazardous Waste Management** - Specialized handling
5. **Green Space Management** - Parks, forests
6. **Community Cleanup Coordination** - NGO/volunteer coordination

### New Features (Leverage existing structure)

#### 1. **Waste Volume Estimation** (New field, existing pattern)
- **Concept**: Add estimated waste volume (small/medium/large) to issues
- **Implementation**: 
  - Add `waste_volume` field to `Issue` model (or use existing `severity_score`)
  - Add volume selector in report form
  - Display in analytics
- **Complexity**: LOW - Field addition + UI update

#### 2. **Pollution Type Classification** (New field, existing pattern)
- **Concept**: Classify pollution type (air/water/land/noise)
- **Implementation**:
  - Add `pollution_type` field to `Issue` model (or extend category)
  - Add selection in report form
- **Complexity**: LOW - Field addition

#### 3. **Cleanup Verification** (Leverage existing upvote system)
- **Concept**: Community members can verify cleanup completion
- **Implementation**: 
  - Reuse `upvotes` table as "verifications"
  - Add "Verify Cleanup" button in resolved issues
  - Track verification count
- **Complexity**: LOW - Reuse existing feature

#### 4. **Cleanup Before/After Photos** (Leverage existing media system)
- **Concept**: Admins can upload cleanup completion photos
- **Implementation**:
  - Extend `media_urls` to support multiple photo sets
  - Add "After" photo upload in admin resolution flow
  - Display before/after comparison
- **Complexity**: LOW-MEDIUM - Extend existing media system

#### 5. **Waste Hotspot Clustering** (Leverage existing map system)
- **Concept**: Identify areas with multiple waste reports (hotspots)
- **Implementation**:
  - Use existing map clustering
  - Add hotspot detection algorithm (density-based)
  - Highlight hotspots on map
- **Complexity**: MEDIUM - Algorithm addition

#### 6. **Community Cleanup Events** (New entity, existing patterns)
- **Concept**: Organize community cleanup drives
- **Implementation**:
  - New `cleanup_event` table (similar to `Issue` structure)
  - Event creation, registration, tracking
  - Link events to resolved issues
- **Complexity**: MEDIUM - New entity but reuses patterns

#### 7. **Environmental Impact Score** (Leverage existing severity score)
- **Concept**: Calculate environmental impact (health, ecosystem, visual)
- **Implementation**:
  - Enhance `severity_score` calculation
  - Factor in pollution type, volume, location sensitivity
  - Display impact score in analytics
- **Complexity**: MEDIUM - Logic enhancement

#### 8. **Volunteer Role** (Extend existing role system)
- **Concept**: Add volunteer role for community organizers
- **Implementation**:
  - Add `volunteer` to `User.role` enum
  - Volunteer permissions (can organize events, verify cleanups)
- **Complexity**: LOW - Role addition

---

## 📊 High-Level Change Summary

### Change Complexity Breakdown

| Component | Conceptual Changes | Technical Changes | Complexity |
|-----------|-------------------|-------------------|------------|
| **Database Schema** | None | None | ✅ NONE |
| **Authentication** | Labels only | None | ✅ LOW |
| **Issue Model** | Category values | Optional new fields | ✅ LOW |
| **Category System** | All categories | Mapping logic | ✅ LOW |
| **Department System** | All departments | Mapping logic | ✅ LOW |
| **AI Detection** | Detection labels | Model retraining | ⚠️ MEDIUM |
| **Analytics** | Metric labels | New calculations | ✅ LOW-MEDIUM |
| **Web Dashboard UI** | All text/labels | Category filters | ✅ LOW |
| **Mobile App UI** | All text/labels | Category options | ✅ LOW |
| **Real-time Features** | Terminology | None | ✅ NONE |
| **Trust Score** | Rebrand only | None | ✅ LOW |
| **Maps & Location** | None | None | ✅ NONE |

### Estimated Effort

- **Low Complexity Changes**: ~60% of work (mostly text/label updates)
- **Medium Complexity Changes**: ~30% of work (AI model, new features)
- **High Complexity Changes**: ~10% of work (optional enhancements)

**Total Estimated Time**: 
- **Minimum Viable Transformation**: 2-3 days (core rebranding)
- **Complete Transformation**: 5-7 days (including AI retraining, new features)

---

## 🎯 Recommended Implementation Phases

### Phase 1: Quick Rebranding (Hackathon MVP) - 1-2 days
**Goal**: Get environment-focused version running quickly

1. ✅ Update category lists (backend + frontend + mobile)
2. ✅ Update department mappings
3. ✅ Update all UI text/labels
4. ✅ Update analytics labels
5. ✅ Update AI category mapping (quick label mapping only)
6. ✅ Test end-to-end flow

### Phase 2: Enhanced Features (If Time Permits) - 2-3 days
**Goal**: Add environment-specific enhancements

1. ✅ Add new environmental categories
2. ✅ Add waste volume estimation
3. ✅ Add pollution type classification
4. ✅ Enhance severity scoring for environmental context
5. ✅ Add cleanup verification feature
6. ✅ Update analytics with environmental metrics

### Phase 3: AI Enhancement (Optional) - 2-3 days
**Goal**: Improve AI detection for environmental issues

1. ✅ Retrain YOLO model on waste/garbage datasets
2. ✅ Update detection labels
3. ✅ Test and validate detection accuracy
4. ✅ Update category auto-detection logic

### Phase 4: Advanced Features (Future) - Ongoing
**Goal**: Fully-featured environmental monitoring platform

1. ✅ Community cleanup events
2. ✅ Waste hotspot detection
3. ✅ Before/after photo comparison
4. ✅ Volunteer role and permissions
5. ✅ Environmental impact scoring
6. ✅ Advanced analytics dashboards

---

## 🔍 Key Files to Modify

### Backend Files

#### High Priority (Must Change)
1. `civic_issue_backend/app/services/issue_service.py`
   - `_analyze_category()` - Update category detection
   - `_map_department()` - Update department mapping
2. `civic_issue_backend/app/services/nlp_service.py`
   - Update keywords for environmental issues
3. `civic_issue_backend/init_db.py`
   - Update sample categories and departments

#### Medium Priority (Should Change)
4. `civic_issue_backend/app/services/ai_service.py`
   - Update detection label mapping
5. `civic_issue_backend/app/services/analytics_service.py`
   - Update metric calculations and labels
6. `civic_issue_backend/app/api/issues.py`
   - Update API documentation/comments

#### Low Priority (Nice to Have)
7. `civic_issue_backend/app/main.py`
   - Update API title/description

### Frontend Web Files

#### High Priority (Must Change)
1. `frontend/apps/web/src/pages/AllIssuesPage.jsx`
   - Update category filter options
2. `frontend/apps/web/src/pages/DashboardPage.jsx`
   - Update analytics labels and metrics
3. All page components - Update text/labels

#### Medium Priority (Should Change)
4. Filter components - Update category/department options
5. Form components - Update category selections

### Mobile App Files

#### High Priority (Must Change)
1. `frontend/apps/mobile/lib/features/issues/presentation/report_issue_screen.dart`
   - Update category selection list
2. `frontend/apps/mobile/lib/core/services/ai_service.dart`
   - Update `_mapToFrontendCategory()` mapping
3. All screen components - Update text/labels

---

## ✅ Success Criteria

### Minimum Viable Transformation
- ✅ All categories updated to environmental issues
- ✅ All departments rebranded to environmental authorities
- ✅ All UI text reflects environmental focus
- ✅ Basic reporting flow works with new categories
- ✅ Admin dashboard shows environmental metrics
- ✅ Mobile app reports environmental issues

### Complete Transformation
- ✅ All above criteria met
- ✅ AI model detects environmental issues accurately
- ✅ New environmental features implemented
- ✅ Analytics show environmental-specific metrics
- ✅ Community engagement features working
- ✅ Cleanup verification system active

---

## 🚀 Next Steps

After reviewing this plan:

1. **Approve the transformation strategy**
2. **Prioritize phases** (focus on Phase 1 for hackathon)
3. **Gather environmental issue datasets** (if retraining AI)
4. **Prepare category/department mappings** (finalize lists)
5. **Begin Phase 1 implementation** (quick rebranding)

---

## 📝 Notes

- **Database Migration**: No schema changes needed - only data updates
- **Backward Compatibility**: Old data can coexist (old categories in DB won't break system)
- **Gradual Rollout**: Can update categories incrementally
- **Testing Strategy**: Test each phase before moving to next
- **Documentation**: Update all docs to reflect new identity

---

**Document Status**: ✅ Planning Complete  
**Next Action**: Begin Phase 1 Implementation  
**Last Updated**: December 2025

