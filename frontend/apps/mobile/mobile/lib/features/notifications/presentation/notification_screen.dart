// File: E:/civic-issue-reporter/apps/mobile/lib/features/notifications/presentation/notification_screen.dart

import 'package:flutter/material.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../../core/theme/app_colors.dart';
import '../data/notification_repository.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  final _notificationRepository = NotificationRepository();
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final notifications = await _notificationRepository.getNotifications();
      setState(() {
        _notifications = notifications;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _markAsRead(int notificationId) async {
    try {
      await _notificationRepository.markNotificationRead(notificationId);
      // Update local state
      setState(() {
        final index = _notifications.indexWhere((n) => n['id'] == notificationId);
        if (index != -1) {
          _notifications[index]['read'] = true;
        }
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to mark as read: $e')),
      );
    }
  }

  Future<void> _markAllAsRead() async {
    try {
      await _notificationRepository.markAllNotificationsRead();
      // Update local state
      setState(() {
        for (var notification in _notifications) {
          notification['read'] = true;
        }
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('All notifications marked as read')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to mark all as read: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Notifications'),
          actions: [
            if (_notifications.any((n) => !n['read']))
              IconButton(
                icon: const Icon(Icons.done_all),
                onPressed: _markAllAsRead,
                tooltip: 'Mark all as read',
              ),
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: _loadNotifications,
              tooltip: 'Refresh',
            ),
          ],
          bottom: const TabBar(
            tabs: [
              Tab(text: 'All'),
              Tab(text: 'Unread'),
            ],
          ),
        ),
        body: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error, size: 64, color: Colors.red),
                        const SizedBox(height: 16),
                        Text('Error: $_error'),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _loadNotifications,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : TabBarView(
                    children: [
                      // All Notifications Tab
                      _NotificationList(
                        notifications: _notifications,
                        onMarkAsRead: _markAsRead,
                      ),
                      // Unread Tab
                      _NotificationList(
                        notifications: _notifications.where((n) => !n['read']).toList(),
                        onMarkAsRead: _markAsRead,
                      ),
                    ],
                  ),
      ),
    );
  }
}

class _NotificationList extends StatelessWidget {
  final List<Map<String, dynamic>> notifications;
  final Function(int) onMarkAsRead;
  
  const _NotificationList({
    required this.notifications,
    required this.onMarkAsRead,
  });

  @override
  Widget build(BuildContext context) {
    if (notifications.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.notifications_none, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'No notifications yet',
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
            SizedBox(height: 8),
            Text(
              'You\'ll see updates about your issues here',
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      itemCount: notifications.length + 1, // +1 for the footer
      separatorBuilder: (context, index) => const Divider(height: 1),
      itemBuilder: (context, index) {
        if (index == notifications.length) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 24.0),
            child: Text(
              "That's all your notifications from the last 30 days",
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textLight),
            ),
          );
        }
        final notification = notifications[index];
        return _NotificationItem(
          notification: notification,
          onMarkAsRead: onMarkAsRead,
        );
      },
    );
  }
}

class _NotificationItem extends StatelessWidget {
  final Map<String, dynamic> notification;
  final Function(int) onMarkAsRead;
  
  const _NotificationItem({
    required this.notification,
    required this.onMarkAsRead,
  });

  @override
  Widget build(BuildContext context) {
    final isRead = notification['read'] ?? false;
    final createdAt = DateTime.parse(notification['created_at']);
    
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: isRead 
            ? Colors.grey.shade300 
            : AppColors.primary.withOpacity(0.1),
        foregroundColor: isRead 
            ? Colors.grey.shade600 
            : AppColors.primary,
        child: Icon(
          _getNotificationIcon(notification['type']),
          size: 20,
        ),
      ),
      title: Text(
        notification['message'] ?? 'Notification',
        style: TextStyle(
          fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
          color: isRead ? Colors.grey.shade600 : Colors.black,
        ),
      ),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 4.0),
        child: Text(timeago.format(createdAt)),
      ),
      trailing: !isRead
          ? IconButton(
              icon: const Icon(Icons.mark_email_read, size: 20),
              onPressed: () => onMarkAsRead(notification['id']),
              tooltip: 'Mark as read',
            )
          : null,
      onTap: !isRead ? () => onMarkAsRead(notification['id']) : null,
    );
  }

  IconData _getNotificationIcon(String type) {
    switch (type) {
      case 'issue_assigned':
        return Icons.assignment;
      case 'issue_resolved':
        return Icons.check_circle;
      case 'issue_updated':
        return Icons.update;
      case 'upvote':
        return Icons.thumb_up;
      case 'comment':
        return Icons.comment;
      default:
        return Icons.notifications;
    }
  }
}