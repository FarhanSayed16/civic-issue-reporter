// Retry service for handling failed API requests with exponential backoff
import 'dart:async';
import 'package:dio/dio.dart';

class RetryService {
  static const int maxRetries = 3;
  static const Duration initialDelay = Duration(seconds: 1);
  static const double backoffMultiplier = 2.0;

  /// Retry a Dio request with exponential backoff
  static Future<T> retryRequest<T>(Future<T> Function() request, {
    int maxRetries = maxRetries,
    Duration initialDelay = initialDelay,
    bool Function(DioException)? shouldRetry,
  }) async {
    int attempt = 0;
    Duration delay = initialDelay;

    while (attempt < maxRetries) {
      try {
        return await request();
      } on DioException catch (e) {
        attempt++;
        
        // Check if we should retry this error
        if (shouldRetry != null && !shouldRetry(e)) {
          rethrow;
        }

        // Don't retry on client errors (4xx) except for timeouts
        if (e.response != null) {
          final statusCode = e.response!.statusCode;
          if (statusCode != null && statusCode >= 400 && statusCode < 500) {
            // Retry only on 408 (Request Timeout) and 429 (Too Many Requests)
            if (statusCode != 408 && statusCode != 429) {
              rethrow;
            }
          }
        }

        // Don't retry if we've exhausted retries
        if (attempt >= maxRetries) {
          rethrow;
        }

        // Wait before retrying (exponential backoff)
        await Future.delayed(delay);
        delay = Duration(milliseconds: (delay.inMilliseconds * backoffMultiplier).round());
      } catch (e) {
        // For non-Dio exceptions, don't retry
        rethrow;
      }
    }

    throw Exception('Max retries exceeded');
  }

  /// Check if an error is retryable
  static bool isRetryableError(DioException error) {
    // Retry on network errors and timeouts
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.connectionError) {
      return true;
    }

    // Retry on 5xx server errors
    if (error.response != null) {
      final statusCode = error.response!.statusCode;
      if (statusCode != null && statusCode >= 500) {
        return true;
      }
      // Retry on 408 (Request Timeout) and 429 (Too Many Requests)
      if (statusCode == 408 || statusCode == 429) {
        return true;
      }
    }

    return false;
  }
}

