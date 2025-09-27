// File: lib/features/notifications/data/notification_repository.dart

import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/services/storage_service.dart';

class NotificationRepository {
  final _storageService = StorageService();

  Future<List<Map<String, dynamic>>> getNotifications() async {
    try {
      final token = await _storageService.getToken();
      if (token == null) {
        throw Exception('No valid session found');
      }

      final response = await dio.get(
        '/admin/notifications',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      return List<Map<String, dynamic>>.from(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        // Return empty list if no notifications found
        return [];
      }
      throw Exception('Failed to get notifications: ${e.message}');
    }
  }

  Future<void> markNotificationRead(int notificationId) async {
    try {
      final token = await _storageService.getToken();
      if (token == null) {
        throw Exception('No valid session found');
      }

      await dio.patch(
        '/admin/notifications/$notificationId/read',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
    } on DioException catch (e) {
      throw Exception('Failed to mark notification as read: ${e.message}');
    }
  }

  Future<void> markAllNotificationsRead() async {
    try {
      final token = await _storageService.getToken();
      if (token == null) {
        throw Exception('No valid session found');
      }

      await dio.patch(
        '/admin/notifications/mark-all-read',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
    } on DioException catch (e) {
      throw Exception('Failed to mark all notifications as read: ${e.message}');
    }
  }
}
