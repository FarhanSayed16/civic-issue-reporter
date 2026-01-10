// File: E:/civic-issue-reporter/apps/mobile/lib/features/issues/data/issue_repository.dart

import 'dart:typed_data';
import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/services/retry_service.dart';
import '../../../core/services/cache_service.dart';
import '../../../core/utils/image_utils.dart';
import '../../../data/models/issue.dart';

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
      // Use retry service for automatic retry on network failures
      final createIssueResponse = await RetryService.retryRequest(
        () => dio.post(
          '/issues',
          data: {
            "description": description,
            "category": category,
            "lat": lat,
            "lng": lng,
            "media_urls": [imageDataUrl], // Send as data URL array like web site
            "is_anonymous": isAnonymous,
            "address_line1": addressLine1,
            "address_line2": addressLine2,
            "street": street,
            "landmark": landmark,
            "pincode": pincode,
          },
          options: options,
        ),
        shouldRetry: RetryService.isRetryableError,
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
        throw Exception('Connection timeout. Please check your internet connection and try again.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception('Unable to connect to server. Please check your internet connection.');
      } else if (e.response != null) {
        // Handle specific HTTP error codes
        final statusCode = e.response!.statusCode;
        final errorData = e.response!.data;
        
        if (statusCode == 400) {
          final message = errorData is Map ? errorData['detail'] : 'Invalid data. Please check your input.';
          throw Exception(message ?? 'Invalid data. Please check your input.');
        } else if (statusCode == 401) {
          throw Exception('Your session has expired. Please log in again.');
        } else if (statusCode == 403) {
          throw Exception('You do not have permission to perform this action.');
        } else if (statusCode == 409) {
          throw Exception('This issue may already exist. Please check for duplicates.');
        } else if (statusCode == 422) {
          final message = errorData is Map ? errorData['detail'] : 'Validation error. Please check your input.';
          throw Exception(message ?? 'Validation error. Please check your input.');
        } else if (statusCode == 500) {
          throw Exception('Server error. Please try again later.');
        } else {
          throw Exception('Failed to create issue: ${errorData ?? e.message}');
        }
      } else {
        throw Exception('Network error. Please check your connection and try again.');
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
      await CacheService.saveToCache('my_issues', response.data, expiration: const Duration(minutes: 5));
      
      return issues;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout || 
          e.type == DioExceptionType.receiveTimeout) {
        throw Exception('Connection timeout. Please try again.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception('Unable to connect to server. Please check your internet connection.');
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
      await CacheService.saveToCache('public_issues', response.data, expiration: const Duration(minutes: 5));
      
      return issues;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout || 
          e.type == DioExceptionType.receiveTimeout) {
        throw Exception('Connection timeout. Please try again.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception('Unable to connect to server. Please check your internet connection.');
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
      await CacheService.saveToCache('all_issues', response.data, expiration: const Duration(minutes: 5));
      
      return issues;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout || 
          e.type == DioExceptionType.receiveTimeout) {
        throw Exception('Connection timeout. Please try again.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception('Unable to connect to server. Please check your internet connection.');
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
      if (e.type == DioExceptionType.connectionTimeout || 
          e.type == DioExceptionType.receiveTimeout) {
        throw Exception('Connection timeout. Please try again.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception('Unable to connect to server. Please check your internet connection.');
      } else if (e.response?.statusCode == 401) {
        throw Exception('Your session has expired. Please log in again.');
      } else if (e.response?.statusCode == 404) {
        throw Exception('Issue not found.');
      } else {
        throw Exception('Failed to upvote issue. Please try again.');
      }
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('An unexpected error occurred while upvoting.');
    }
  }
}
