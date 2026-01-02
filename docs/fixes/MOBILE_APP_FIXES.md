# 🔧 Mobile App Issues & Fixes

## 🐛 Issues Identified

### 1. ❌ Wrong API Base URL
**Problem**: Using old dev tunnel URL instead of current VS Code developer tunnel

**Current**: `https://3blkgv75-8585.inc1.devtunnels.ms/`
**Should be**: Your current VS Code developer tunnel URL

### 2. ❌ Authentication Not Using Encryption
**Problem**: The auth repository in `lib/features/auth/data/auth_repository.dart` is sending plain username/password instead of encrypted credentials

**Current Code**:
```dart
data: {
  'username': username,  // ❌ Plain text
  'password': password,  // ❌ Plain text
}
```

**Should be**: Encrypted password like the web app

### 3. ❌ Missing INTERNET Permission
**Problem**: Main AndroidManifest.xml doesn't have INTERNET permission (only debug has it)

### 4. ❌ Cannot See Logs
**Problem**: Flutter logs not visible in Android Studio

---

## ✅ Fixes

### Fix 1: Update API Base URL

**File**: `frontend/apps/mobile/lib/core/api/api_client.dart`

**Steps**:
1. Get your current VS Code developer tunnel URL
2. Update the `baseUrl` in the file

**For Android Emulator**:
```dart
baseUrl: 'http://10.0.2.2:8585/',  // Android emulator localhost
```

**For Physical Device with Dev Tunnel**:
```dart
baseUrl: 'https://YOUR-DEV-TUNNEL-URL/',  // Your VS Code dev tunnel
```

**For Physical Device with ADB Port Forward**:
```dart
baseUrl: 'http://localhost:8585/',  // If using adb port-forward
```

---

### Fix 2: Add Encryption to Auth Repository

**File**: `frontend/apps/mobile/lib/features/auth/data/auth_repository.dart`

**Current Issue**: This file doesn't use encryption. There's a better version in `mobile/lib/features/auth/data/auth_repository.dart` that has encryption.

**Solution**: Update the auth repository to use encryption service.

---

### Fix 3: Add INTERNET Permission

**File**: `frontend/apps/mobile/android/app/src/main/AndroidManifest.xml`

Add INTERNET permission if missing.

---

### Fix 4: Enable Flutter Logs

**In Android Studio**:
1. Open **Logcat** tab (bottom panel)
2. Filter by "flutter" or your app package name
3. Run app with: `flutter run` in terminal

**In Terminal**:
```bash
flutter run --verbose
```

---

## 🚀 Quick Fix Steps

### Step 1: Update API URL

1. Get your VS Code developer tunnel URL
2. Open `frontend/apps/mobile/lib/core/api/api_client.dart`
3. Update `baseUrl` to your tunnel URL

### Step 2: Fix Authentication

The auth repository needs to use encryption. Check if `EncryptionService` exists and update auth_repository.dart.

### Step 3: Add Internet Permission

Add to `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET"/>
```

### Step 4: Test Connection

Run:
```bash
cd frontend/apps/mobile
flutter run
```

Check logs for connection errors.

---

## 📝 Testing Checklist

- [ ] API URL updated to correct dev tunnel
- [ ] Authentication uses encryption
- [ ] INTERNET permission added
- [ ] Can see Flutter logs
- [ ] Login request reaches backend
- [ ] Backend responds correctly

---

## 🔍 Debugging Tips

### Check API Connection
```dart
// Add this to test API connection
try {
  final response = await dio.get('/');
  print('API Connected: ${response.data}');
} catch (e) {
  print('API Error: $e');
}
```

### Check Encryption
```dart
// Test encryption service
final encService = EncryptionService();
final encrypted = await encService.encryptJson({'secret': 'test'});
print('Encrypted: $encrypted');
```

### View Network Requests
Enable Dio logging:
```dart
dio.interceptors.add(LogInterceptor(
  requestBody: true,
  responseBody: true,
));
```

---

**Next Steps**: Apply these fixes and test login again!

