// File: lib/core/services/websocket_service.dart

import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/io.dart';
import '../api/api_client.dart';
import 'storage_service.dart';

class WebSocketService {
  final _storageService = StorageService();
  WebSocketChannel? _channel;
  StreamController<Map<String, dynamic>>? _messageController;
  Timer? _reconnectTimer;
  bool _isConnected = false;
  int? _userId;

  Stream<Map<String, dynamic>> get messageStream {
    _messageController ??= StreamController<Map<String, dynamic>>.broadcast();
    return _messageController!.stream;
  }

  Future<void> connect() async {
    try {
      final sessionData = await _storageService.getSession();
      if (sessionData == null) {
        print('No session data found, cannot connect to WebSocket');
        return;
      }

      // Extract user ID from session or token
      final token = await _storageService.getToken();
      if (token == null) {
        print('No token found, cannot connect to WebSocket');
        return;
      }

      // Extract user ID from JWT token
      _userId = _extractUserIdFromToken(token);
      if (_userId == null) {
        print('Could not extract user ID from token');
        return;
      }

      final wsUrl = dio.options.baseUrl.replaceFirst('http', 'ws') + 'notifications/ws/updates/$_userId?token=$token';
      
      _channel = IOWebSocketChannel.connect(wsUrl);
      _isConnected = true;

      _channel!.stream.listen(
        (data) {
          try {
            final message = json.decode(data);
            _messageController?.add(message);
          } catch (e) {
            print('Error parsing WebSocket message: $e');
          }
        },
        onError: (error) {
          print('WebSocket error: $error');
          _isConnected = false;
          _scheduleReconnect();
        },
        onDone: () {
          print('WebSocket connection closed');
          _isConnected = false;
          _scheduleReconnect();
        },
      );

      print('WebSocket connected successfully');
    } catch (e) {
      print('Failed to connect to WebSocket: $e');
      _scheduleReconnect();
    }
  }

  int? _extractUserIdFromToken(String token) {
    try {
      // JWT tokens have 3 parts separated by dots
      final parts = token.split('.');
      if (parts.length != 3) return null;
      
      // Decode the payload (second part)
      final payload = parts[1];
      // Add padding if needed
      final paddedPayload = payload.padRight((payload.length + 3) & ~3, '=');
      
      // Decode base64
      final decodedBytes = base64Url.decode(paddedPayload);
      final decodedString = utf8.decode(decodedBytes);
      
      // Parse JSON
      final payloadJson = json.decode(decodedString);
      
      // Extract user ID from 'sub' field
      final userId = payloadJson['sub'];
      return userId != null ? int.tryParse(userId.toString()) : null;
    } catch (e) {
      print('Error extracting user ID from token: $e');
      return null;
    }
  }

  void _scheduleReconnect() {
    if (_reconnectTimer?.isActive == true) return;
    
    _reconnectTimer = Timer(const Duration(seconds: 5), () {
      if (!_isConnected) {
        print('Attempting to reconnect WebSocket...');
        connect();
      }
    });
  }

  void disconnect() {
    _reconnectTimer?.cancel();
    _channel?.sink.close();
    _isConnected = false;
    print('WebSocket disconnected');
  }

  bool get isConnected => _isConnected;

  void sendMessage(String message) {
    if (_isConnected && _channel != null) {
      _channel!.sink.add(message);
    }
  }
}
