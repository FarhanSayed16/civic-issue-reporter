// File: E:/civic-issue-reporter/apps/mobile/lib/features/issues/data/issue_repository.dart

import 'dart:typed_data';
import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/services/retry_service.dart';
import '../../../core/services/cache_service.dart';
import '../../../core/utils/image_utils.dart';
import '../../../data/models/issue.dart';

/// Duplicate issue information model
class DuplicateIssueInfo {
  final int issueId;
  final String reason;
  final String createdAt;
  final String status;

  DuplicateIssueInfo({
    required this.issueId,
    required this.reason,
    required this.createdAt,
    required this.status,
  });

  factory DuplicateIssueInfo.fromJson(Map<String, dynamic> json) {
    return DuplicateIssueInfo(
      issueId: json['issue_id'] ?? 0,
      reason: json['reason'] ?? 'Similar issue detected',
      createdAt: json['created_at'] ?? '',
      status: json['status'] ?? 'unknown',
    );
  }
}

/// Custom exception for duplicate issues
class DuplicateIssueException implements Exception {
  final String message;
  final List<DuplicateIssueInfo> duplicates;

  DuplicateIssueException(this.message, this.duplicates);

  /// Get the first duplicate issue ID (for backward compatibility)
  int? get duplicateIssueId =>
      duplicates.isNotEmpty ? duplicates.first.issueId : null;

  @override
  String toString() => message;
}

class IssueRepository {
  final _storageService = StorageService();

  // --- CREATE NEW ISSUE ---
  Future<Issue> createIssue({
    required String description,
    required String category,
    required double lat,
    required double lng,
    required Uint8List imageBytes,
    required bool isAnonymous,
    required String addressLine1,
    required String addressLine2,
    required String street,
    required String landmark,
    required String pincode,
  }) async {
    try {
      // --- STEP 0: Get auth token ---
      final token = await _storageService.getToken();
      if (token == null) {
        throw Exception(
            'You are not logged in. Please log in to report an issue.');
      }

      final options = Options(headers: {'Authorization': 'Bearer $token'});

      // --- STEP 1: Convert image to data URL ---
      final imageDataUrl = ImageUtils.bytesToDataUrl(imageBytes);

      // --- STEP 2: Create issue with data URL directly ---
      // Note: Backend auto-assigns department based on category, so we don't send it
      // Use extended timeouts for image uploads (base64 can be large)
      // Retry on timeout errors (but NOT on 409 duplicate errors)
      final createIssueResponse = await RetryService.retryRequest(
        () => dio.post(
          '/issues',
          data: {
            "description": description,
            "category": category,
            "lat": lat,
            "lng": lng,
            "media_urls": [
              imageDataUrl
            ], // Send as data URL array like web site
            "is_anonymous": isAnonymous,
            "address_line1": addressLine1,
            "address_line2": addressLine2,
            "street": street,
            "landmark": landmark,
            "pincode": pincode,
          },
          options: Options(
            headers: options.headers,
            // Extended timeouts for large image uploads
            receiveTimeout: const Duration(
                seconds: 120), // 2 minutes for receiving response
            sendTimeout: const Duration(
                seconds: 120), // 2 minutes for sending large base64 data
          ),
        ),
        maxRetries: 2, // Retry up to 2 times (3 total attempts)
        shouldRetry: (error) {
          // Retry on timeout/connection errors, but NOT on 409 (duplicate) or 4xx client errors
          if (error is DioException) {
            // Don't retry on client errors (4xx) except connection issues
            if (error.response != null && error.response!.statusCode != null) {
              final statusCode = error.response!.statusCode!;
              if (statusCode >= 400 && statusCode < 500) {
                return false; // Don't retry client errors (including 409 duplicate)
              }
            }
            // Retry on timeout and connection errors
            return error.type == DioExceptionType.connectionTimeout ||
                error.type == DioExceptionType.receiveTimeout ||
                error.type == DioExceptionType.sendTimeout ||
                error.type == DioExceptionType.connectionError;
          }
          return false;
        },
      );

      final issue = Issue.fromJson(createIssueResponse.data);

      // Invalidate cache after successful creation
      await CacheService.clearCache('my_issues');
      await CacheService.clearCache('public_issues');

      return issue;
    } on DioException catch (e) {
      // Provide user-friendly error messages
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        throw Exception(
            'Connection timeout. Please check your internet connection and try again.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception(
            'Unable to connect to server. Please check your internet connection.');
      } else if (e.response != null) {
        // Handle specific HTTP error codes
        final statusCode = e.response!.statusCode;
        final errorData = e.response!.data;

        if (statusCode == 400) {
          final message = errorData is Map
              ? errorData['detail']
              : 'Invalid data. Please check your input.';
          throw Exception(message ?? 'Invalid data. Please check your input.');
        } else if (statusCode == 401) {
          throw Exception('Your session has expired. Please log in again.');
        } else if (statusCode == 403) {
          throw Exception('You do not have permission to perform this action.');
        } else if (statusCode == 409) {
          // Parse duplicate issue response
          String message =
              'A similar environmental issue has already been reported nearby.';
          List<DuplicateIssueInfo> duplicates = [];

          if (errorData is Map) {
            // Backend returns: { "detail": { "message": "...", "duplicates": [...] } }
            final detail = errorData['detail'];
            if (detail is Map) {
              message = detail['message'] ?? message;
              final duplicatesList = detail['duplicates'];
              if (duplicatesList is List) {
                duplicates = duplicatesList
                    .map((d) =>
                        DuplicateIssueInfo.fromJson(d as Map<String, dynamic>))
                    .toList();
              }
            }
          }

          throw DuplicateIssueException(message, duplicates);
        } else if (statusCode == 422) {
          final message = errorData is Map
              ? errorData['detail']
              : 'Validation error. Please check your input.';
          throw Exception(
              message ?? 'Validation error. Please check your input.');
        } else if (statusCode == 500) {
          throw Exception('Server error. Please try again later.');
        } else {
          throw Exception('Failed to create issue: ${errorData ?? e.message}');
        }
      } else {
        throw Exception(
            'Network error. Please check your connection and try again.');
      }
    } catch (e) {
      // Handle non-Dio exceptions
      if (e is Exception) {
        rethrow;
      }
      throw Exception('An unexpected error occurred: ${e.toString()}');
    }
  }

  // --- GET MY ISSUES ---
  Future<List<Issue>> getMyIssues({bool useCache = true}) async {
    try {
      // Try to get from cache first
      if (useCache) {
        final cachedData = await CacheService.getFromCache('my_issues');
        if (cachedData != null) {
          try {
            return (cachedData as List)
                .map((issueJson) => Issue.fromJson(issueJson))
                .toList();
          } catch (e) {
            // If cache parsing fails, continue to fetch from API
          }
        }
      }

      final token = await _storageService.getToken();
      if (token == null) throw Exception('Not authenticated');

      // Use retry service for automatic retry on network failures
      final response = await RetryService.retryRequest(
        () => dio.get(
          '/users/me/issues',
          options: Options(headers: {'Authorization': 'Bearer $token'}),
        ),
        shouldRetry: RetryService.isRetryableError,
      );

      final issues = (response.data as List)
          .map((issueJson) => Issue.fromJson(issueJson))
          .toList();

      // Cache the results
      await CacheService.saveToCache('my_issues', response.data,
          expiration: const Duration(minutes: 5));

      return issues;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        throw Exception('Connection timeout. Please try again.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception(
            'Unable to connect to server. Please check your internet connection.');
      } else if (e.response?.statusCode == 401) {
        throw Exception('Your session has expired. Please log in again.');
      } else {
        throw Exception('Failed to load your issues. Please try again.');
      }
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('An unexpected error occurred while loading issues.');
    }
  }

  // --- GET PUBLIC ISSUES ---
  Future<List<Issue>> getPublicIssues({bool useCache = true}) async {
    try {
      // Try to get from cache first
      if (useCache) {
        final cachedData = await CacheService.getFromCache('public_issues');
        if (cachedData != null) {
          try {
            return (cachedData as List)
                .map((issueJson) => Issue.fromJson(issueJson))
                .toList();
          } catch (e) {
            // If cache parsing fails, continue to fetch from API
          }
        }
      }

      // This endpoint is public, so no auth token is needed
      // Use retry service for automatic retry on network failures
      final response = await RetryService.retryRequest(
        () => dio.get('/issues'),
        shouldRetry: RetryService.isRetryableError,
      );

      final issues = (response.data as List)
          .map((issueJson) => Issue.fromJson(issueJson))
          .toList();

      // Cache the results
      await CacheService.saveToCache('public_issues', response.data,
          expiration: const Duration(minutes: 5));

      return issues;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        throw Exception('Connection timeout. Please try again.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception(
            'Unable to connect to server. Please check your internet connection.');
      } else {
        throw Exception('Failed to load issues. Please try again.');
      }
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('An unexpected error occurred while loading issues.');
    }
  }

  // --- GET ALL ISSUES ---
  Future<List<Issue>> getAllIssues({bool useCache = true}) async {
    try {
      // Try to get from cache first
      if (useCache) {
        final cachedData = await CacheService.getFromCache('all_issues');
        if (cachedData != null) {
          try {
            return (cachedData as List)
                .map((issueJson) => Issue.fromJson(issueJson))
                .toList();
          } catch (e) {
            // If cache parsing fails, continue to fetch from API
          }
        }
      }

      final token = await _storageService.getToken();
      if (token == null) throw Exception('Not authenticated');

      // Use retry service for automatic retry on network failures
      final response = await RetryService.retryRequest(
        () => dio.get(
          '/issues',
          options: Options(headers: {'Authorization': 'Bearer $token'}),
        ),
        shouldRetry: RetryService.isRetryableError,
      );

      final issues = (response.data as List)
          .map((issueJson) => Issue.fromJson(issueJson))
          .toList();

      // Cache the results
      await CacheService.saveToCache('all_issues', response.data,
          expiration: const Duration(minutes: 5));

      return issues;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        throw Exception('Connection timeout. Please try again.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception(
            'Unable to connect to server. Please check your internet connection.');
      } else if (e.response?.statusCode == 401) {
        throw Exception('Your session has expired. Please log in again.');
      } else {
        throw Exception('Failed to load issues. Please try again.');
      }
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('An unexpected error occurred while loading issues.');
    }
  }

  // --- UPVOTE ISSUE ---
  Future<void> upvoteIssue(String issueId) async {
    try {
      final token = await _storageService.getToken();
      if (token == null) throw Exception('Not authenticated');

      // Use retry service for automatic retry on network failures
      await RetryService.retryRequest(
        () => dio.post(
          '/issues/$issueId/upvote',
          options: Options(headers: {'Authorization': 'Bearer $token'}),
        ),
        shouldRetry: RetryService.isRetryableError,
      );

      // Invalidate cache after upvote
      await CacheService.clearCache('public_issues');
      await CacheService.clearCache('all_issues');
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        throw Exception('Your session has expired. Please log in again.');
      } else {
        throw Exception('Failed to upvote issue. Please try again.');
      }
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('An unexpected error occurred while upvoting issue.');
    }
  }
}
