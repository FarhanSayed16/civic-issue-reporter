// File: lib/features/chat/data/message_repository.dart

import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/services/storage_service.dart';

class MessageRepository {
  final _storageService = StorageService();

  Future<List<Map<String, dynamic>>> getMessages(int issueId) async {
    try {
      final token = await _storageService.getToken();
      if (token == null) {
        throw Exception('No valid session found');
      }

      final response = await dio.get(
        '/messages/issues/$issueId/messages',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      return List<Map<String, dynamic>>.from(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        // Return empty list if no messages found
        return [];
      }
      throw Exception('Failed to get messages: ${e.message}');
    }
  }

  Future<Map<String, dynamic>> sendMessage({
    required int issueId,
    required String message,
    required bool isAdminMessage,
  }) async {
    try {
      final token = await _storageService.getToken();
      if (token == null) {
        throw Exception('No valid session found');
      }

      final response = await dio.post(
        '/messages/issues/$issueId/messages',
        data: {
          'message': message,
        },
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      return response.data;
    } on DioException catch (e) {
      throw Exception('Failed to send message: ${e.message}');
    }
  }

  Future<void> markMessagesAsRead(int issueId) async {
    try {
      final token = await _storageService.getToken();
      if (token == null) {
        throw Exception('No valid session found');
      }

      await dio.patch(
        '/messages/issues/$issueId/read',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
    } on DioException catch (e) {
      // Don't throw error for read status updates
      print('Failed to mark messages as read: ${e.message}');
    }
  }
}
