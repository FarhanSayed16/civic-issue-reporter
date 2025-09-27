// File: lib/core/services/storage_service.dart
import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const _tokenKey = 'auth_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _userDataKey = 'user_data';
  static const _sessionKey = 'session_data';

  Future<void> saveToken(String token) async {
    if (kIsWeb) {
      // Use SharedPreferences for web
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_tokenKey, token);
    } else {
      // Use FlutterSecureStorage for mobile
      const storage = FlutterSecureStorage();
      await storage.write(key: _tokenKey, value: token);
    }
  }

  Future<String?> getToken() async {
    if (kIsWeb) {
      // Use SharedPreferences for web
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_tokenKey);
    } else {
      // Use FlutterSecureStorage for mobile
      const storage = FlutterSecureStorage();
      return await storage.read(key: _tokenKey);
    }
  }

  Future<void> deleteToken() async {
    if (kIsWeb) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tokenKey);
    } else {
      const storage = FlutterSecureStorage();
      await storage.delete(key: _tokenKey);
    }
  }

  // Session management methods
  Future<void> saveSession({
    required String accessToken,
    required String refreshToken,
    required Map<String, dynamic> userData,
  }) async {
    if (kIsWeb) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_tokenKey, accessToken);
      await prefs.setString(_refreshTokenKey, refreshToken);
      await prefs.setString(_userDataKey, json.encode(userData));
      await prefs.setBool(_sessionKey, true);
    } else {
      const storage = FlutterSecureStorage();
      await storage.write(key: _tokenKey, value: accessToken);
      await storage.write(key: _refreshTokenKey, value: refreshToken);
      await storage.write(key: _userDataKey, value: json.encode(userData));
      await storage.write(key: _sessionKey, value: 'true');
    }
  }

  Future<Map<String, dynamic>?> getSession() async {
    try {
      String? accessToken;
      String? refreshToken;
      String? userDataStr;

      if (kIsWeb) {
        final prefs = await SharedPreferences.getInstance();
        accessToken = prefs.getString(_tokenKey);
        refreshToken = prefs.getString(_refreshTokenKey);
        userDataStr = prefs.getString(_userDataKey);
      } else {
        const storage = FlutterSecureStorage();
        accessToken = await storage.read(key: _tokenKey);
        refreshToken = await storage.read(key: _refreshTokenKey);
        userDataStr = await storage.read(key: _userDataKey);
      }

      if (accessToken != null && refreshToken != null && userDataStr != null) {
        return {
          'accessToken': accessToken,
          'refreshToken': refreshToken,
          'userData': json.decode(userDataStr),
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<void> clearSession() async {
    if (kIsWeb) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tokenKey);
      await prefs.remove(_refreshTokenKey);
      await prefs.remove(_userDataKey);
      await prefs.remove(_sessionKey);
    } else {
      const storage = FlutterSecureStorage();
      await storage.delete(key: _tokenKey);
      await storage.delete(key: _refreshTokenKey);
      await storage.delete(key: _userDataKey);
      await storage.delete(key: _sessionKey);
    }
  }

  Future<bool> hasValidSession() async {
    final session = await getSession();
    return session != null;
  }
}