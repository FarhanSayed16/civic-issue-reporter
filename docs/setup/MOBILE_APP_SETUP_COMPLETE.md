# 📱 Mobile App Setup & Fix Guide

## ✅ All Fixes Applied

### 1. ✅ Encryption Service Added
- Created `lib/core/services/encryption_service.dart`
- Matches web app encryption (AES-GCM)
- Uses same encryption keys as backend

### 2. ✅ Authentication Fixed
- Updated `auth_repository.dart` to use encryption
- Password now encrypted before sending
- Matches backend expectations

### 3. ✅ API Client Updated
- Added logging interceptor for debugging
- Updated base URL configuration
- Added timeout settings

### 4. ✅ Android Permissions
- Added INTERNET permission to AndroidManifest.xml

### 5. ✅ Dependencies
- Added `pointycastle` for encryption

---

## 🚀 How to Run

### Step 1: Install Dependencies

```bash
cd frontend/apps/mobile
flutter pub get
```

### Step 2: Configure API URL

**File**: `lib/core/api/api_client.dart`

**For Android Emulator**:
```dart
baseUrl: 'http://10.0.2.2:8585/',
```

**For Physical Device with VS Code Dev Tunnel**:
1. Get your dev tunnel URL from VS Code (Ports tab)
2. Update:
```dart
baseUrl: 'https://YOUR-DEV-TUNNEL-URL/',
```

**For Physical Device with ADB Port Forward**:
```bash
adb reverse tcp:8585 tcp:8585
```
Then use:
```dart
baseUrl: 'http://localhost:8585/',
```

### Step 3: Start Backend

Make sure backend is running:
```bash
cd civic_issue_backend
python start.py
```

### Step 4: Run Mobile App

**Option A: Android Studio**
1. Open Android Studio
2. Open project: `frontend/apps/mobile`
3. Click "Run" button
4. Select device/emulator

**Option B: Command Line**
```bash
cd frontend/apps/mobile
flutter run
```

**Option C: With Logs**
```bash
flutter run --verbose
```

---

## 🔍 Viewing Logs

### In Android Studio:
1. Open **Logcat** tab (bottom panel)
2. Filter by: `flutter` or your package name
3. Look for:
   - `I/flutter` - Flutter logs
   - `D/Dio` - Network requests (if logging enabled)

### In Terminal:
```bash
# Run with verbose logging
flutter run --verbose

# Or use Flutter logs
flutter logs
```

### Enable Network Logging:
The API client now includes `LogInterceptor` which will show:
- Request URL
- Request body
- Response status
- Response body
- Errors

Look for logs starting with `D/Dio` in Logcat.

---

## 🧪 Testing Login

### Test Credentials:
- **Phone**: `9876543212`
- **Password**: `admin123`

### What to Check:

1. **API Connection**:
   - Check logs for: `GET /` or connection errors
   - Should see: `200 OK` or connection successful

2. **Login Request**:
   - Check logs for: `POST /auth/login`
   - Request body should have encrypted password
   - Response should have `access_token` and `refresh_token`

3. **Errors**:
   - If 401: Check password encryption
   - If 500: Check backend logs
   - If connection error: Check API URL

---

## 🐛 Common Issues & Fixes

### Issue 1: "Connection refused" or "Network error"

**Fix**:
- Check API URL is correct
- For emulator: Use `http://10.0.2.2:8585/`
- For physical device: Use dev tunnel URL or `localhost` with ADB
- Verify backend is running

### Issue 2: "401 Unauthorized"

**Fix**:
- Password encryption is working
- Check backend logs for decryption errors
- Verify encryption service is initialized

### Issue 3: "Cannot see logs"

**Fix**:
- Open Logcat in Android Studio
- Filter by `flutter`
- Run with `flutter run --verbose`
- Check console output

### Issue 4: "Package not found" or build errors

**Fix**:
```bash
flutter clean
flutter pub get
flutter run
```

### Issue 5: "Encryption failed"

**Fix**:
- Verify `pointycastle` is installed: `flutter pub get`
- Check encryption service file exists
- Verify encryption key matches backend

---

## 📋 Checklist

Before testing, ensure:

- [ ] Backend is running on port 8585
- [ ] API URL is configured correctly
- [ ] Dependencies installed: `flutter pub get`
- [ ] INTERNET permission in AndroidManifest.xml
- [ ] Encryption service file exists
- [ ] Auth repository uses encryption
- [ ] Logging enabled in API client

---

## 🔧 Debugging Steps

### 1. Test API Connection

Add this to your login screen temporarily:

```dart
// Test API connection
try {
  final response = await dio.get('/');
  print('✅ API Connected: ${response.data}');
} catch (e) {
  print('❌ API Error: $e');
}
```

### 2. Test Encryption

Add this to test encryption:

```dart
final encService = EncryptionService();
try {
  final encrypted = await encService.encryptJson({'secret': 'test123'});
  print('✅ Encryption works: ${encrypted['nonce']}');
} catch (e) {
  print('❌ Encryption failed: $e');
}
```

### 3. View Network Requests

The `LogInterceptor` is already added. Check Logcat for:
```
D/Dio: --> POST /auth/login
D/Dio: Request Body: {"phone_number":"...","password":"..."}
D/Dio: <-- 200 OK
D/Dio: Response: {"access_token":"...","refresh_token":"..."}
```

---

## 📝 Next Steps

After login works:

1. Test registration
2. Test issue reporting
3. Test map view
4. Test notifications
5. Test chat (if implemented)

---

## 🆘 Still Not Working?

### Check Backend Logs:
```bash
# In backend terminal, you should see:
INFO: POST /auth/login HTTP/1.1 200 OK
```

### Check Mobile Logs:
```bash
# In terminal:
flutter logs | grep -i "login\|error\|dio"
```

### Test API Manually:
```bash
# Test if backend is accessible
curl http://localhost:8585/
# Should return: {"message":"Civic Issue Backend Running"}
```

---

## ✅ Success Indicators

When everything works, you should see:

1. **In Mobile App**:
   - Login screen loads
   - Can enter phone/password
   - Login button works
   - Navigates to home screen after login

2. **In Logs**:
   - `POST /auth/login` request
   - `200 OK` response
   - Token saved message

3. **In Backend**:
   - `POST /auth/login` request logged
   - `200 OK` response
   - No errors

---

**All fixes are applied! Follow the steps above to run and test the mobile app.** 🎉

