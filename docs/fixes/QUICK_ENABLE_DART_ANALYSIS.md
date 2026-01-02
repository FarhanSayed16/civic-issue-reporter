# ⚡ Quick Guide: Enable Dart Analysis in Android Studio

## 🎯 3 Simple Steps

### Step 1: Enable Dart Analysis in Settings

1. **Open Settings**:
   - **File** → **Settings** (Windows/Linux)
   - **Android Studio** → **Preferences** (Mac)

2. **Navigate to Dart Settings**:
   - **Languages & Frameworks** → **Dart**

3. **Enable Analysis**:
   - ✅ Check **"Enable Dart support for the project"**
   - ✅ Check **"Enable analysis"**
   - ✅ Check **"Show analysis errors in Problems view"**
   - ✅ Check **"Show analysis errors in editor"**

4. **Click Apply** and **OK**

---

### Step 2: Install Missing Dependency

Run this in terminal:
```bash
cd frontend/apps/mobile
flutter pub get
```

This installs `flutter_lints` which is needed for analysis.

---

### Step 3: Run Analysis

**Option A: In Android Studio**
- Right-click `lib` folder → **Analyze** → **Analyze Code**
- Or press: `Ctrl+Alt+Shift+I` (Windows) / `Cmd+Option+Shift+I` (Mac)

**Option B: In Terminal**
```bash
cd frontend/apps/mobile
flutter analyze
```

---

## ✅ Verify It's Working

1. **Open any Dart file** - You should see red/yellow underlines
2. **Check Problems tab** (bottom panel) - Should show all errors
3. **Make a syntax error** - Should appear immediately

---

## 🔧 If Analysis Still Not Working

1. **Invalidate Caches**:
   - **File** → **Invalidate Caches** → **Invalidate and Restart**

2. **Sync Project**:
   - **File** → **Sync Project with Gradle Files**

3. **Restart Android Studio**

---

## 📋 What You'll See

After enabling, you'll see:
- ✅ **Red underlines** = Errors (must fix)
- ⚠️ **Yellow underlines** = Warnings (should fix)
- 💡 **Blue underlines** = Info/suggestions
- **Problems tab** = List of all issues

---

**That's it! Analysis should now work.** 🎉

