// Cache service for offline support and data persistence
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class CacheService {
  static const String _cachePrefix = 'swachhcity_cache_';
  static const Duration defaultCacheDuration = Duration(hours: 1);

  /// Save data to cache with expiration
  static Future<void> saveToCache(String key, dynamic data, {Duration? expiration}) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cacheKey = '$_cachePrefix$key';
      final expirationKey = '${cacheKey}_expires';
      
      final expirationTime = DateTime.now().add(expiration ?? defaultCacheDuration);
      final cacheData = {
        'data': data,
        'cached_at': DateTime.now().toIso8601String(),
        'expires_at': expirationTime.toIso8601String(),
      };
      
      await prefs.setString(cacheKey, jsonEncode(cacheData));
      await prefs.setString(expirationKey, expirationTime.toIso8601String());
    } catch (e) {
      // Silently fail - caching is optional
      print('Cache save error: $e');
    }
  }

  /// Get data from cache if not expired
  static Future<dynamic> getFromCache(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cacheKey = '$_cachePrefix$key';
      final expirationKey = '${cacheKey}_expires';
      
      final cachedData = prefs.getString(cacheKey);
      final expirationTimeStr = prefs.getString(expirationKey);
      
      if (cachedData == null || expirationTimeStr == null) {
        return null;
      }
      
      final expirationTime = DateTime.parse(expirationTimeStr);
      if (DateTime.now().isAfter(expirationTime)) {
        // Cache expired, remove it
        await prefs.remove(cacheKey);
        await prefs.remove(expirationKey);
        return null;
      }
      
      final cacheData = jsonDecode(cachedData);
      return cacheData['data'];
    } catch (e) {
      // Silently fail - return null if cache read fails
      print('Cache read error: $e');
      return null;
    }
  }

  /// Clear cache for a specific key
  static Future<void> clearCache(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cacheKey = '$_cachePrefix$key';
      final expirationKey = '${cacheKey}_expires';
      await prefs.remove(cacheKey);
      await prefs.remove(expirationKey);
    } catch (e) {
      print('Cache clear error: $e');
    }
  }

  /// Clear all cache
  static Future<void> clearAllCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final keys = prefs.getKeys();
      for (final key in keys) {
        if (key.startsWith(_cachePrefix)) {
          await prefs.remove(key);
        }
      }
    } catch (e) {
      print('Cache clear all error: $e');
    }
  }

  /// Check if cache exists and is valid
  static Future<bool> isCacheValid(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final expirationKey = '${_cachePrefix}${key}_expires';
      final expirationTimeStr = prefs.getString(expirationKey);
      
      if (expirationTimeStr == null) {
        return false;
      }
      
      final expirationTime = DateTime.parse(expirationTimeStr);
      return DateTime.now().isBefore(expirationTime);
    } catch (e) {
      return false;
    }
  }
}

