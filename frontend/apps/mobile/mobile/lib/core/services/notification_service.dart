// File: lib/core/services/notification_service.dart

import 'package:flutter/material.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import '../theme/app_colors.dart';
import '../../data/models/notification.dart';
import '../api/api_client.dart';
import 'storage_service.dart';
import 'package:dio/dio.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final _storageService = StorageService();

  // Get notifications from API
  Future<List<AppNotification>> getNotifications() async {
    try {
      final token = await _storageService.getToken();
      if (token == null) {
        throw Exception('No valid session found');
      }

      final response = await dio.get(
        '/notifications/',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      return (response.data as List)
          .map((json) => AppNotification.fromJson(json))
          .toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return [];
      }
      throw Exception('Failed to get notifications: ${e.message}');
    }
  }

  // Mark notification as read
  Future<void> markAsRead(int notificationId) async {
    try {
      final token = await _storageService.getToken();
      if (token == null) {
        throw Exception('No valid session found');
      }

      await dio.patch(
        '/notifications/$notificationId/read',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
    } on DioException catch (e) {
      print('Failed to mark notification as read: ${e.message}');
    }
  }

  // Mark all notifications as read
  Future<void> markAllAsRead() async {
    try {
      final token = await _storageService.getToken();
      if (token == null) {
        throw Exception('No valid session found');
      }

      await dio.patch(
        '/notifications/read-all',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
    } on DioException catch (e) {
      print('Failed to mark all notifications as read: ${e.message}');
    }
  }

  void showMessageNotification(BuildContext context, {
    required String message,
    required String sender,
    required int issueId,
    VoidCallback? onTap,
  }) {
    // Show a custom popup notification
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => _MessageNotificationPopup(
        message: message,
        sender: sender,
        issueId: issueId,
        onTap: onTap,
      ),
    );
  }

  void showSnackBarNotification(BuildContext context, {
    required String message,
    required String sender,
    required int issueId,
    VoidCallback? onTap,
  }) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(LucideIcons.messageCircle, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'New message from $sender',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    message.length > 50 ? '${message.substring(0, 50)}...' : message,
                    style: const TextStyle(fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.primary,
        duration: const Duration(seconds: 4),
        action: SnackBarAction(
          label: 'View',
          textColor: Colors.white,
          onPressed: onTap ?? () {},
        ),
      ),
    );
  }
}

class _MessageNotificationPopup extends StatelessWidget {
  final String message;
  final String sender;
  final int issueId;
  final VoidCallback? onTap;

  const _MessageNotificationPopup({
    required this.message,
    required this.sender,
    required this.issueId,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(20),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      LucideIcons.messageCircle,
                      color: AppColors.primary,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'New Message',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textDark,
                          ),
                        ),
                        Text(
                          'Issue #$issueId',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.x),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // Message content
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'From: $sender',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textLight,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      message,
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.textDark,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              
              // Actions
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Dismiss'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).pop();
                        onTap?.call();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('View Chat'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}