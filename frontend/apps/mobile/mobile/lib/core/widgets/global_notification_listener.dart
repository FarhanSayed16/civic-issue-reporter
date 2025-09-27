// File: lib/core/widgets/global_notification_listener.dart

import 'dart:async';
import 'package:flutter/material.dart';
import '../services/websocket_service.dart';
import '../services/notification_service.dart';

class GlobalNotificationListener extends StatefulWidget {
  final Widget child;

  const GlobalNotificationListener({
    super.key,
    required this.child,
  });

  @override
  State<GlobalNotificationListener> createState() => _GlobalNotificationListenerState();
}

class _GlobalNotificationListenerState extends State<GlobalNotificationListener> {
  final WebSocketService _webSocketService = WebSocketService();
  StreamSubscription<Map<String, dynamic>>? _wsSubscription;

  @override
  void initState() {
    super.initState();
    _setupGlobalWebSocket();
  }

  void _setupGlobalWebSocket() {
    // Connect to WebSocket for global notifications
    _webSocketService.connect();
    
    // Listen for all real-time messages
    _wsSubscription = _webSocketService.messageStream.listen((message) {
      if (message['type'] == 'new_message') {
        // Show notification for new messages
        final issueId = message['issue_id'];
        final messageText = message['message'];
        final sender = message['sender'] == 'admin' ? 'Admin' : 'User';
        
        // Show snackbar notification
        NotificationService().showSnackBarNotification(
          context,
          message: messageText,
          sender: sender,
          issueId: issueId,
          onTap: () {
            // TODO: Navigate to the specific issue chat
            print('Navigate to issue $issueId chat');
          },
        );
      }
    });
  }

  @override
  void dispose() {
    _wsSubscription?.cancel();
    _webSocketService.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
