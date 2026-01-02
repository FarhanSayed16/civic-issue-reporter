# 🔧 Enable Dart Analysis in Android Studio

## ✅ Step-by-Step Guide

### Step 1: Verify Flutter/Dart Plugin is Installed

1. Open Android Studio
2. Go to **File** → **Settings** (Windows/Linux) or **Android Studio** → **Preferences** (Mac)
3. Navigate to **Plugins**
4. Search for "Flutter" and "Dart"
5. Make sure both are **installed and enabled**
6. If not installed, click **Install** and restart Android Studio

---

### Step 2: Enable Dart Analysis

1. Go to **File** → **Settings** (or **Preferences** on Mac)
2. Navigate to: **Languages & Frameworks** → **Dart**
3. Check these settings:
   - ✅ **Enable Dart support for the project**
   - ✅ **Enable analysis**
   - ✅ **Show analysis errors in Problems view**
   - ✅ **Show analysis errors in editor**

4. In **Analysis** section:
   - ✅ **Enable Dart analysis**
   - Set **Analysis scope** to: **Project files**
   - ✅ **Show errors in Problems view**
   - ✅ **Show errors in editor**

5. Click **Apply** and **OK**

---

### Step 3: Configure Analysis Options

The `analysis_options.yaml` file is already present. Let's make sure it's comprehensive:

**File**: `frontend/apps/mobile/analysis_options.yaml`

The file should include Flutter lints. If you want stricter analysis, we can update it.

---

### Step 4: Run Analysis Manually

**Option A: In Android Studio**
1. Right-click on `lib` folder
2. Select **Analyze** → **Analyze Code**
3. Or press `Ctrl+Alt+Shift+I` (Windows/Linux) or `Cmd+Option+Shift+I` (Mac)

**Option B: In Terminal**
```bash
cd frontend/apps/mobile
flutter analyze
```

This will show all errors and warnings at once.

---

### Step 5: View Analysis Results

**In Android Studio:**
1. Open **Problems** tab (usually at bottom)
2. You'll see all errors, warnings, and info messages
3. Click on any issue to jump to the code

**In Terminal:**
The `flutter analyze` command will list all issues with file paths and line numbers.

---

### Step 6: Enable Real-time Analysis

1. Go to **File** → **Settings** → **Languages & Frameworks** → **Dart**
2. Under **Analysis**:
   - ✅ **Enable Dart analysis**
   - ✅ **Show errors in Problems view**
   - ✅ **Show errors in editor**
3. Set **Analysis scope** to: **Project files**
4. Click **Apply**

Now errors will appear in real-time as you type!

---

## 🔍 Troubleshooting

### Issue 1: Analysis Not Working

**Fix:**
1. Invalidate caches: **File** → **Invalidate Caches** → **Invalidate and Restart**
2. Run: `flutter clean` then `flutter pub get`
3. Restart Android Studio

### Issue 2: No Errors Showing

**Fix:**
1. Check if Dart plugin is enabled
2. Verify project is recognized as Flutter project
3. Run `flutter doctor` to check Flutter setup
4. Try: **File** → **Sync Project with Gradle Files**

### Issue 3: Analysis is Slow

**Fix:**
1. Go to **Settings** → **Dart** → **Analysis**
2. Reduce **Analysis scope** to specific folders
3. Exclude `build/` folder from analysis

### Issue 4: Wrong Analysis Results

**Fix:**
1. Delete `.dart_tool` folder
2. Run `flutter clean`
3. Run `flutter pub get`
4. Restart Android Studio

---

## 📋 Quick Checklist

- [ ] Flutter plugin installed
- [ ] Dart plugin installed
- [ ] Dart analysis enabled in settings
- [ ] Analysis scope set to "Project files"
- [ ] Problems view visible
- [ ] Can run `flutter analyze` successfully

---

## 🚀 Quick Commands

```bash
# Run analysis
flutter analyze

# Get detailed analysis
flutter analyze --verbose

# Fix auto-fixable issues
dart fix --apply

# Format code
flutter format .
```

---

## 📝 Additional Settings

### Enable More Strict Analysis

Update `analysis_options.yaml`:

```yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  errors:
    # Treat warnings as errors
    missing_required_param: error
    missing_return: error
  
  exclude:
    - build/**
    - .dart_tool/**

linter:
  rules:
    # Enable additional rules
    prefer_const_constructors: true
    prefer_const_literals_to_create_immutables: true
    avoid_print: true
    prefer_single_quotes: true
```

---

## ✅ Verification

After enabling analysis:

1. **Open any Dart file** - You should see red/yellow underlines for errors/warnings
2. **Check Problems tab** - Should show all issues
3. **Run `flutter analyze`** - Should list all issues
4. **Make a syntax error** - Should appear immediately

---

**Follow these steps and Dart analysis will be fully enabled!** 🎉

