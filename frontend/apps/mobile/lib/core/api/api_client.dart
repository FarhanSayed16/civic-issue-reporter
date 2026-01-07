// File: E:/civic-issue-reporter/apps/mobile/lib/core/api/api_client.dart

import 'package:dio/dio.dart';

// Create Dio instance with configuration
final Dio dio = _createDio();

Dio _createDio() {
  final dioInstance = Dio(
    BaseOptions(
      // ⚠️ IMPORTANT: Update this URL based on your setup
      // - Android Emulator: http://10.0.2.2:8585/
      // - iOS Simulator: http://127.0.0.1:8585/
      // - Physical Device with Dev Tunnel: https://YOUR-DEV-TUNNEL-URL/
      // - Physical Device with ADB: http://localhost:8585/ (after: adb reverse tcp:8585 tcp:8585)
      // - Flutter Web: http://localhost:8585/
      
      // TODO: Replace with your VS Code developer tunnel URL
      // Get it from VS Code: Ports tab > Right-click port 8585 > Copy Address
      baseUrl: 'https://bnc51nt1-8585.inc1.devtunnels.ms/',
      
      // ⬆️ Increased timeouts to handle slower connections and image uploads
      // Note: For large image uploads, we override these per-request with longer timeouts
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 60), // Increased for image uploads
      sendTimeout: const Duration(seconds: 90), // Increased for large base64 image uploads
    ),
  );

  // Add logging interceptor for debugging
  dioInstance.interceptors.add(
    LogInterceptor(
      requestBody: true,
      responseBody: true,
      requestHeader: true,
      responseHeader: false,
      error: true,
    ),
  );

  return dioInstance;
}
