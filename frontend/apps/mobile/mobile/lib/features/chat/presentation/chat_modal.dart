// File: frontend/apps/mobile/mobile/lib/features/chat/presentation/chat_modal.dart

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../data/message_repository.dart';
import '../../../core/services/websocket_service.dart';
import '../../../core/services/notification_service.dart';

class ChatModal extends StatefulWidget {
  final String issueId;
  final String issueTitle;
  final String? reporterName;
  final bool isAnonymous;
  final String? reporterId;
  final String? adminName;

  const ChatModal({
    super.key,
    required this.issueId,
    required this.issueTitle,
    this.reporterName,
    this.isAnonymous = false,
    this.reporterId,
    this.adminName,
  });

  @override
  State<ChatModal> createState() => _ChatModalState();
}

class _ChatModalState extends State<ChatModal> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final MessageRepository _messageRepository = MessageRepository();
  final WebSocketService _webSocketService = WebSocketService();
  List<ChatMessage> _messages = [];
  bool _isLoading = true;
  bool _isSending = false;
  StreamSubscription<Map<String, dynamic>>? _wsSubscription;

  @override
  void initState() {
    super.initState();
    _loadMessages();
    _setupWebSocket();
  }

  void _setupWebSocket() {
    // Connect to WebSocket
    _webSocketService.connect();
    
    // Listen for real-time messages
    _wsSubscription = _webSocketService.messageStream.listen((message) {
      if (message['type'] == 'new_message' && 
          message['issue_id'] == int.parse(widget.issueId)) {
        // Add new message to the list
        final newMessage = ChatMessage(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          text: message['message'],
          isFromAdmin: message['sender'] == 'admin',
          timestamp: DateTime.parse(message['timestamp']),
        );
        
        setState(() {
          _messages.add(newMessage);
        });
        
        // Show popup notification if chat is not currently open
        if (!mounted) {
          NotificationService().showMessageNotification(
            context,
            message: message['message'],
            sender: message['sender'] == 'admin' ? 'Admin' : 'User',
            issueId: int.parse(widget.issueId),
            onTap: () {
              // Navigate to chat or show chat modal
            },
          );
        }
        
        // Scroll to bottom
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (_scrollController.hasClients) {
            _scrollController.animateTo(
              _scrollController.position.maxScrollExtent,
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOut,
            );
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _wsSubscription?.cancel();
    _webSocketService.disconnect();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    setState(() => _isLoading = true);

    try {
      final messages = await _messageRepository.getMessages(int.parse(widget.issueId));
      
      setState(() {
        _messages = messages.map((msg) => ChatMessage(
          id: msg['id'].toString(),
          text: msg['message'],
          isFromAdmin: msg['is_admin_message'] ?? false,
          timestamp: DateTime.parse(msg['created_at']),
        )).toList();
        _isLoading = false;
      });

      // Mark messages as read
      await _messageRepository.markMessagesAsRead(int.parse(widget.issueId));

      // Scroll to bottom
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    } catch (e) {
      setState(() {
        _messages = [];
        _isLoading = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load messages: $e')),
        );
      }
    }
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _isSending) return;

    setState(() => _isSending = true);

    try {
      // Send message to API
      final result = await _messageRepository.sendMessage(
        issueId: int.parse(widget.issueId),
        message: text,
        isAdminMessage: false, // User is sending message
      );

      // Add message to local list
      final message = ChatMessage(
        id: result['message_id'].toString(),
        text: text,
        isFromAdmin: false,
        timestamp: DateTime.now(),
      );

      setState(() {
        _messages.add(message);
      });

      _messageController.clear();

      // Scroll to bottom
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send message: $e')),
        );
      }
    } finally {
      setState(() => _isSending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        height: MediaQuery.of(context).size.height * 0.8,
        width: MediaQuery.of(context).size.width * 0.9,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: Colors.white,
        ),
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(LucideIcons.x, color: Colors.white),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Chat with Admin',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          'Issue #${widget.issueId}',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                        if (widget.adminName != null)
                          Text(
                            'Admin: ${widget.adminName}',
                            style: const TextStyle(
                              color: Colors.white60,
                              fontSize: 12,
                            ),
                          ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.more_vert),
                    onPressed: () {
                      // Show more options
                    },
                  ),
                ],
              ),
            ),

            // Messages
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _messages.isEmpty
                      ? const Center(
                          child: Text(
                            'No messages yet.\nStart a conversation!',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 16,
                            ),
                          ),
                        )
                      : ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(16),
                          itemCount: _messages.length,
                          itemBuilder: (context, index) {
                            final message = _messages[index];
                            return _buildMessageBubble(message);
                          },
                        ),
            ),

            // Input
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(16),
                  bottomRight: Radius.circular(16),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      maxLines: null,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: _isSending ? Colors.grey : AppColors.primary,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: IconButton(
                      icon: _isSending
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(LucideIcons.send, color: Colors.white),
                      onPressed: _isSending ? null : _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: message.isFromAdmin
            ? MainAxisAlignment.start
            : MainAxisAlignment.end,
        children: [
          if (message.isFromAdmin) ...[
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(
                LucideIcons.user,
                color: Colors.white,
                size: 16,
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
              decoration: BoxDecoration(
                color: message.isFromAdmin
                    ? Colors.grey.shade200
                    : AppColors.primary,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Sender name
                  if (message.isFromAdmin)
                    Text(
                      widget.adminName ?? 'Admin',
                      style: TextStyle(
                        color: Colors.grey.shade700,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    )
                  else
                    Text(
                      widget.isAnonymous ? 'Anonymous' : (widget.reporterName ?? 'You'),
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  const SizedBox(height: 2),
                  // Message text
                  Text(
                    message.text,
                    style: TextStyle(
                      color:
                          message.isFromAdmin ? Colors.black87 : Colors.white,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 4),
                  // Timestamp
                  Text(
                    _formatTime(message.timestamp),
                    style: TextStyle(
                      color: message.isFromAdmin
                          ? Colors.grey.shade600
                          : Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (!message.isFromAdmin) ...[
            const SizedBox(width: 8),
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(
                LucideIcons.user,
                color: Colors.black54,
                size: 16,
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatTime(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}

class ChatMessage {
  final String id;
  final String text;
  final bool isFromAdmin;
  final DateTime timestamp;

  ChatMessage({
    required this.id,
    required this.text,
    required this.isFromAdmin,
    required this.timestamp,
  });
}
