// File: E:/civic-issue-reporter/apps/mobile/mobile/lib/core/api/api_client.dart

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
      baseUrl: 'https://3blkgv75-8585.inc1.devtunnels.ms/',
      
      // ⬆️ Increased timeouts to handle slower connections and image uploads
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
    ),
  );

  // Add logging interceptor for debugging (only in debug mode)
  if (const bool.fromEnvironment('dart.vm.product') == false) {
    dioInstance.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        requestHeader: true,
        responseHeader: false,
        error: true,
      ),
    );
  }

  // Add request/response caching interceptor for better performance
  // This will cache GET requests for a short duration
  dioInstance.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        // Add cache control headers for GET requests
        if (options.method == 'GET') {
          options.headers['Cache-Control'] = 'max-age=300'; // 5 minutes
        }
        handler.next(options);
      },
    ),
  );

  return dioInstance;
}
