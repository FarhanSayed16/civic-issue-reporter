# Mobile App Build Error Fix - Reporter ID Field

## 🚨 **Error Fixed**
**Error**: `The getter 'id' isn't defined for the type 'User'`
**Files**: 
- `lib/features/issues/presentation/home_screen.dart(731,39)`
- `lib/features/profile/presentation/user_dashboard_screen.dart(661,39)`

## 🔍 **Root Cause**
The mobile app was trying to access `widget.issue.user.id` but the `User` model doesn't have an `id` field. The `Issue` model was missing the `reporterId` field that should be mapped from the backend's `reporter_id` field.

## ✅ **Solution Applied**

### **1. Updated Issue Model**
**File**: `D:\civicmain\civicmain\frontend\apps\mobile\mobile\lib\data\models\issue.dart`

#### **Added reporterId Field**
```dart
class Issue {
  final int id;
  final int reporterId;  // NEW: Added reporter ID field
  final String description;
  // ... other fields
}
```

#### **Updated Constructor**
```dart
Issue({
  required this.id,
  required this.reporterId,  // NEW: Added to constructor
  required this.description,
  // ... other parameters
});
```

#### **Updated fromJson Method**
```dart
factory Issue.fromJson(Map<String, dynamic> json) {
  return Issue(
    id: json['id'] ?? 0,
    reporterId: json['reporter_id'] ?? 0,  // NEW: Map from backend
    description: json['description'] ?? 'No description provided',
    // ... other mappings
  );
}
```

### **2. Updated ChatModal Calls**
**Files Updated**:
- `D:\civicmain\civicmain\frontend\apps\mobile\mobile\lib\features\profile\presentation\user_dashboard_screen.dart`
- `D:\civicmain\civicmain\frontend\apps\mobile\mobile\lib\features\issues\presentation\home_screen.dart`

#### **Fixed ChatModal Usage**
**Before** (causing error):
```dart
ChatModal(
  issueId: widget.issue.id.toString(),
  issueTitle: widget.issue.category,
  reporterName: widget.issue.reporterName,
  isAnonymous: widget.issue.isAnonymous,
  reporterId: widget.issue.user.id.toString(),  // ❌ ERROR: User has no 'id'
)
```

**After** (fixed):
```dart
ChatModal(
  issueId: widget.issue.id.toString(),
  issueTitle: widget.issue.category,
  reporterName: widget.issue.reporterName,
  isAnonymous: widget.issue.isAnonymous,
  reporterId: widget.issue.reporterId.toString(),  // ✅ FIXED: Use Issue.reporterId
)
```

## 🔧 **Technical Details**

### **Backend Data Mapping**
The backend returns `reporter_id` in the `IssueOut` schema:
```python
class IssueOut(BaseModel):
    id: int
    reporter_id: int  # This field was missing in mobile model
    reporter_name: str
    # ... other fields
```

### **Mobile Model Alignment**
The mobile `Issue` model now properly maps all backend fields:
- ✅ `id` → `id`
- ✅ `reporter_id` → `reporterId` (NEW)
- ✅ `reporter_name` → `reporterName`
- ✅ `is_anonymous` → `isAnonymous`
- ✅ All other fields properly mapped

### **Data Flow**
1. **Backend**: Returns issue with `reporter_id: 123`
2. **Mobile**: Maps to `Issue.reporterId = 123`
3. **ChatModal**: Receives `reporterId: "123"`
4. **Display**: Shows "Reporter: John Doe (ID: 123)"

## 🎯 **Benefits**

### **Fixed Compilation**
- ✅ **No more build errors**: Mobile app now compiles successfully
- ✅ **Proper data mapping**: All backend fields properly mapped
- ✅ **Type safety**: Correct field types and null safety

### **Enhanced Functionality**
- ✅ **Reporter identification**: Chat shows reporter name and ID
- ✅ **Anonymous handling**: Properly handles anonymous reports
- ✅ **Data consistency**: Matches web app functionality

### **Maintainability**
- ✅ **Clear field names**: `reporterId` is more descriptive than `user.id`
- ✅ **Proper separation**: User model for user data, Issue model for issue data
- ✅ **Future-proof**: Easy to add more reporter-related fields

## 🔍 **Testing Results**
- ✅ **No Linting Errors**: Code passes all Dart analyzer checks
- ✅ **Proper Data Mapping**: All backend fields correctly mapped
- ✅ **Type Safety**: Correct field types and null safety
- ✅ **Chat Functionality**: Reporter info properly displayed in chat

## 📋 **Files Modified**
1. **Issue Model**: `lib/data/models/issue.dart` - Added `reporterId` field
2. **User Dashboard**: `lib/features/profile/presentation/user_dashboard_screen.dart` - Fixed ChatModal call
3. **Home Screen**: `lib/features/issues/presentation/home_screen.dart` - Fixed ChatModal call

## 🚀 **Deployment Ready**
- ✅ **Build Fixed**: Mobile app now compiles without errors
- ✅ **Data Integrity**: All backend fields properly mapped
- ✅ **Functionality Preserved**: Chat modal works with reporter information
- ✅ **No Breaking Changes**: Existing functionality maintained

The mobile app build error has been completely resolved! The `reporterId` field is now properly available and the chat modal can display reporter information correctly.
