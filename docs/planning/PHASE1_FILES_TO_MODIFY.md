# 📋 Phase 1: Files to Modify - SwachhCity Transformation

**Phase**: Quick Rebranding (Hackathon MVP)  
**Date**: December 2025  
**Status**: Step 1 - File Identification

---

## 🎯 Phase 1 Scope (EXACT)

Based on the refactoring plan, Phase 1 includes ONLY:
1. ✅ Update category lists (backend + frontend + mobile)
2. ✅ Update department mappings
3. ✅ Update all UI text/labels
4. ✅ Update analytics labels
5. ✅ Update AI category mapping (quick label mapping only)
6. ✅ Test end-to-end flow

**DO NOT**:
- ❌ Change database schema
- ❌ Add new fields/tables
- ❌ Retrain AI models
- ❌ Add new features
- ❌ Touch authentication, maps, realtime, chat, storage

---

## 🔧 BACKEND FILES (High Priority)

### 1. `civic_issue_backend/app/services/issue_service.py`
**What Changes**: 
- `_analyze_category()` method - Update category detection keywords from civic to environmental categories
- `_map_department()` method - Update department mapping dictionary from civic departments to environmental authorities

### 2. `civic_issue_backend/app/services/nlp_service.py`
**What Changes**: 
- Update keyword detection lists for environmental issues (garbage, pollution, waste, etc.)
- Update sentiment analysis keywords to focus on environmental context

### 3. `civic_issue_backend/init_db.py`
**What Changes**: 
- Update sample data categories from civic categories to environmental categories
- Update sample department names to environmental authorities
- Update sample issue descriptions to environmental context

### 4. `civic_issue_backend/app/services/ai_service.py` (If exists)
**What Changes**: 
- Update AI detection label → category mapping (quick mapping only, no model retraining)
- Map existing YOLO detection labels to new environmental categories

### 5. `civic_issue_backend/app/services/analytics_service.py` (If exists)
**What Changes**: 
- Update analytics metric labels (e.g., "Total Issues" → "Total Environmental Reports")
- Update metric descriptions to environmental context

---

## 🌐 FRONTEND WEB FILES (High Priority)

### 1. `frontend/apps/web/src/pages/AllIssuesPage.jsx`
**What Changes**: 
- Update category filter dropdown options (lines 309-312, 451-456) - Replace civic categories with environmental categories
- Update UI text/labels related to "issues" → "environmental reports"

### 2. `frontend/apps/web/src/pages/AllIssuesAdminPage.jsx`
**What Changes**: 
- Update `categoryOptions` array (line 42) - Replace civic categories with environmental categories
- Update UI text/labels

### 3. `frontend/apps/web/src/pages/AdminDashboardPage.jsx`
**What Changes**: 
- Update analytics metric labels (e.g., "Total Issues" → "Total Environmental Reports", "Resolved Today" → "Cleanups Completed Today")
- Update dashboard card titles and descriptions
- Update UI text/labels

### 4. `frontend/apps/web/src/pages/HomePage.jsx`
**What Changes**: 
- Update UI text/labels (page titles, headings, button labels)
- Update any category references

### 5. `frontend/apps/web/src/pages/UserDashboardPage.jsx`
**What Changes**: 
- Update UI text/labels
- Update metric labels if any

### 6. `frontend/apps/web/src/pages/ReportsPage.jsx`
**What Changes**: 
- Update UI text/labels
- Update any category references

### 7. `frontend/apps/web/src/pages/ProfilePage.jsx`
**What Changes**: 
- Update UI text/labels (e.g., "Trust Score" → "Eco-Score" or "Green Points")
- Update any references to "issues" → "reports"

### 8. `frontend/apps/web/src/pages/LoginPage.jsx`
**What Changes**: 
- Update page title/branding text (if "Civic Issue Reporter" → "SwachhCity")

### 9. `frontend/apps/web/src/pages/SignupPage.jsx`
**What Changes**: 
- Update page title/branding text

### 10. `frontend/apps/web/src/pages/HelpSettingsPage.jsx`
**What Changes**: 
- Update UI text/labels
- Update help content to reflect environmental focus

---

## 📱 MOBILE APP FILES (High Priority)

### 1. `frontend/apps/mobile/lib/features/issues/presentation/report_issue_screen.dart`
**What Changes**: 
- Update category selection list - Replace civic categories with environmental categories
- Update UI text/labels (screen titles, button labels, placeholders)

### 2. `frontend/apps/mobile/lib/core/services/ai_service.dart`
**What Changes**: 
- Update `_mapToFrontendCategory()` method - Map AI detection labels to new environmental categories
- Update category mapping logic

### 3. Mobile App Screen Files (All presentation files)
**What Changes**: 
- Update UI text/labels across all screens
- Update references from "issues" → "environmental reports"
- Update "Trust Score" → "Eco-Score" or "Green Points"

**Files to check** (need to identify all screen files):
- Home screen
- Map view screen
- Profile screen
- Login/Register screens
- Any other presentation screens

---

## 📝 SUMMARY

### Backend Files: **5 files**
1. `issue_service.py` - Category and department mappings
2. `nlp_service.py` - Keyword lists
3. `init_db.py` - Sample data
4. `ai_service.py` - AI label mapping (if exists)
5. `analytics_service.py` - Analytics labels (if exists)

### Frontend Web Files: **10 files**
1-10. All page JSX files - Categories, labels, analytics

### Mobile App Files: **3+ files**
1. `report_issue_screen.dart` - Category list
2. `ai_service.dart` - AI mapping
3. All other presentation screens - UI text

---

## ⚠️ NOTES

- These are the **HIGH PRIORITY** files for Phase 1
- Additional files may be discovered during implementation
- Focus on **string/text changes only** - no logic changes unless required for mapping
- All changes must follow the exact category/department mappings from the refactoring plan
- No database schema changes allowed

---

**Status**: ✅ File Identification Complete  
**Next Step**: Wait for confirmation, then proceed to Step 2 (Backend Changes)

