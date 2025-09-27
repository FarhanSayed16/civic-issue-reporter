// File: E:/civic-issue-reporter/apps/mobile/lib/features/issues/data/issue_repository.dart

import 'dart:typed_data';
import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/utils/image_utils.dart';
import '../../../data/models/issue.dart';

class IssueRepository {
  final _storageService = StorageService();

  // --- CREATE NEW ISSUE ---
  Future<Issue> createIssue({
    required String description,
    required String category,
    required String department,
    required double latitude,
    required double longitude,
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
      final createIssueResponse = await dio.post(
        '/issues',
        data: {
          "description": description,
          "category": category,
          "department": department,
          "lat": latitude,
          "lng": longitude,
          "media_urls": [imageDataUrl], // Send as data URL array like web site
          "is_anonymous": isAnonymous,
          "address_line1": addressLine1,
          "address_line2": addressLine2,
          "street": street,
          "landmark": landmark,
          "pincode": pincode,
        },
        options: options,
      );

      return Issue.fromJson(createIssueResponse.data);
    } on DioException catch (e) {
      throw Exception(
          'Failed to create issue: ${e.response?.data ?? e.message}');
    }
  }

  // --- GET MY ISSUES ---
  Future<List<Issue>> getMyIssues() async {
    try {
      final token = await _storageService.getToken();
      if (token == null) throw Exception('Not authenticated');

      final response = await dio.get(
        '/users/me/issues',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      return (response.data as List)
          .map((issueJson) => Issue.fromJson(issueJson))
          .toList();
    } on DioException catch (e) {
      throw Exception(
          'Failed to fetch issues: ${e.response?.data ?? e.message}');
    }
  }

  // --- GET PUBLIC ISSUES ---
  Future<List<Issue>> getPublicIssues() async {
    try {
      // This endpoint is public, so no auth token is needed
      final response = await dio.get('/issues');

      // Convert the list of JSON objects to a list of Issue objects
      return (response.data as List)
          .map((issueJson) => Issue.fromJson(issueJson))
          .toList();
    } on DioException catch (e) {
      throw Exception(
          'Failed to fetch public issues: ${e.response?.data ?? e.message}');
    }
  }

  // --- GET ALL ISSUES ---
  Future<List<Issue>> getAllIssues() async {
    try {
      final token = await _storageService.getToken();
      if (token == null) throw Exception('Not authenticated');

      final response = await dio.get(
        '/issues',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      return (response.data as List)
          .map((issueJson) => Issue.fromJson(issueJson))
          .toList();
    } on DioException catch (e) {
      throw Exception(
          'Failed to fetch issues: ${e.response?.data ?? e.message}');
    }
  }

  // --- UPVOTE ISSUE ---
  Future<void> upvoteIssue(String issueId) async {
    try {
      final token = await _storageService.getToken();
      if (token == null) throw Exception('Not authenticated');

      await dio.post(
        '/issues/$issueId/upvote',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
    } on DioException catch (e) {
      throw Exception(
          'Failed to upvote issue: ${e.response?.data ?? e.message}');
    }
  }
}
