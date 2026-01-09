// File: frontend/apps/mobile/mobile/lib/core/services/ai_service.dart

import 'dart:typed_data';
import 'package:dio/dio.dart';
import '../../core/api/api_client.dart';
import '../../core/services/storage_service.dart';
import '../../core/utils/image_utils.dart';
import '../../data/models/ai_detection.dart';

class AIService {
  final _storageService = StorageService();

  /// Map AI detection labels to frontend environmental categories
  String _mapToFrontendCategory(String label) {
    final labelLower = label.toLowerCase();

    if (labelLower.contains('garbage') || labelLower.contains('waste') || labelLower.contains('dump')) {
      return 'Open Garbage Dump';
    } else if (labelLower.contains('plastic')) {
      return 'Plastic Pollution';
    } else if (labelLower.contains('burning') || labelLower.contains('fire') || labelLower.contains('smoke')) {
      return 'Open Burning';
    } else if (labelLower.contains('water body') || labelLower.contains('lake') || labelLower.contains('river') || labelLower.contains('pond')) {
      return 'Water Body Pollution';
    } else if (labelLower.contains('construction') || labelLower.contains('demolition')) {
      return 'Construction Waste';
    } else if (labelLower.contains('e-waste') || labelLower.contains('electronic')) {
      return 'Electronic Waste (E-Waste)';
    } else if (labelLower.contains('biomedical') || labelLower.contains('medical') || labelLower.contains('hospital')) {
      return 'Biomedical Waste';
    } else if (labelLower.contains('green space') || labelLower.contains('deforestation') || labelLower.contains('tree')) {
      return 'Green Space Degradation';
    } else if (labelLower.contains('drainage') || labelLower.contains('drain') || labelLower.contains('blocked')) {
      return 'Drainage Blockage';
    } else if (labelLower.contains('water pollution') || labelLower.contains('contaminated water') || labelLower.contains('sewage')) {
      return 'Water Pollution / Contaminated Water';
    } else if (labelLower.contains('garbage overflow') || labelLower.contains('overflowing')) {
      return 'Garbage Overflow';
    } else if (labelLower.contains('illegal dumping') || labelLower.contains('litter') || labelLower.contains('trash')) {
      return 'Illegal Dumping / Litter';
    }

    return 'Other Environmental Issues'; // Default fallback
  }

  /// Detect issues from image using YOLO model
  Future<ImageDetectResponse> detectFromImage(Uint8List imageBytes) async {
    try {
      final token = await _storageService.getToken();
      final options = token != null
          ? Options(headers: {'Authorization': 'Bearer $token'})
          : null;

      final dataUrl = ImageUtils.bytesToDataUrl(imageBytes);

      final response = await dio.post(
        '/ai/detect',
        data: {'image_data_url': dataUrl},
        options: options,
      );

      if (response.statusCode == 200) {
        return ImageDetectResponse.fromJson(response.data);
      } else {
        throw Exception('Failed to detect image: ${response.statusMessage}');
      }
    } catch (e) {
      throw Exception('AI detection failed: $e');
    }
  }

  /// Analyze text to extract keywords and suggest category
  Future<TextAnalyzeResponse> analyzeText(String text) async {
    try {
      final token = await _storageService.getToken();
      final options = token != null
          ? Options(headers: {'Authorization': 'Bearer $token'})
          : null;

      final response = await dio.post(
        '/ai/analyze-text',
        data: {'text': text},
        options: options,
      );

      if (response.statusCode == 200) {
        return TextAnalyzeResponse.fromJson(response.data);
      } else {
        throw Exception('Failed to analyze text: ${response.statusMessage}');
      }
    } catch (e) {
      throw Exception('Text analysis failed: $e');
    }
  }

  /// Estimate severity based on image and text
  Future<SeverityResponse> estimateSeverity({
    Uint8List? imageBytes,
    String? text,
  }) async {
    try {
      final token = await _storageService.getToken();
      final options = token != null
          ? Options(headers: {'Authorization': 'Bearer $token'})
          : null;

      final Map<String, dynamic> payload = {};

      if (imageBytes != null) {
        payload['image_data_url'] = ImageUtils.bytesToDataUrl(imageBytes);
      }

      if (text != null && text.isNotEmpty) {
        payload['text'] = text;
      }

      final response = await dio.post(
        '/ai/severity',
        data: payload,
        options: options,
      );

      if (response.statusCode == 200) {
        return SeverityResponse.fromJson(response.data);
      } else {
        throw Exception(
            'Failed to estimate severity: ${response.statusMessage}');
      }
    } catch (e) {
      throw Exception('Severity estimation failed: $e');
    }
  }

  /// Get AI suggestion for category based on image detection
  Future<String?> getCategorySuggestion(Uint8List imageBytes) async {
    try {
      final detection = await detectFromImage(imageBytes);

      if (detection.detections.isNotEmpty) {
        final topDetection = detection.detections.first;
        return _mapToFrontendCategory(topDetection.label);
      }

      return null;
    } catch (e) {
      print('Error getting category suggestion: $e');
      return null;
    }
  }

  /// Get detailed detection results for display
  Future<Map<String, dynamic>> getDetailedDetectionResults(
      Uint8List imageBytes) async {
    try {
      final detection = await detectFromImage(imageBytes);

      if (detection.detections.isNotEmpty) {
        final topDetection = detection.detections.first;
        final suggestedCategory = _mapToFrontendCategory(topDetection.label);

        return {
          'hasDetections': true,
          'topDetection': {
            'label': topDetection.label,
            'confidence': topDetection.confidence,
            'confidencePercent':
                (topDetection.confidence * 100).toStringAsFixed(1),
          },
          'suggestedCategory': suggestedCategory,
          'allDetections': detection.detections
              .map((d) => {
                    'label': d.label,
                    'confidence': d.confidence,
                    'confidencePercent':
                        (d.confidence * 100).toStringAsFixed(1),
                  })
              .toList(),
        };
      } else {
        return {
          'hasDetections': false,
          'message': 'No issues detected in the image',
        };
      }
    } catch (e) {
      return {
        'hasDetections': false,
        'error': 'AI analysis failed: ${e.toString()}',
      };
    }
  }

  /// Get AI suggestion for urgency based on severity estimation
  Future<String?> getUrgencySuggestion({
    Uint8List? imageBytes,
    String? text,
  }) async {
    try {
      final severity = await estimateSeverity(
        imageBytes: imageBytes,
        text: text,
      );

      // Map severity score to urgency levels
      if (severity.score >= 0.8) {
        return 'High';
      } else if (severity.score >= 0.5) {
        return 'Medium';
      } else {
        return 'Low';
      }
    } catch (e) {
      print('Error getting urgency suggestion: $e');
      return null;
    }
  }

  /// Generate AI description based on detected category and severity
  Future<String?> generateDescription({
    Uint8List? imageBytes,
    String? text,
  }) async {
    try {
      String? category;
      String? urgency;

      if (imageBytes != null) {
        category = await getCategorySuggestion(imageBytes);
        urgency =
            await getUrgencySuggestion(imageBytes: imageBytes, text: text);
      } else if (text != null && text.isNotEmpty) {
        final textAnalysis = await analyzeText(text);
        if (textAnalysis.keywords.isNotEmpty) {
          category = _mapToFrontendCategory(textAnalysis.keywords.first);
        }
        urgency = await getUrgencySuggestion(text: text);
      }

      if (category != null) {
        final urgencyText = urgency == 'High'
            ? 'urgent'
            : urgency == 'Medium'
                ? 'moderate'
                : 'minor';
        return 'Detected ${category.toLowerCase()} issue requiring ${urgencyText} attention. ${text ?? 'Please address this issue promptly.'}';
      }

      return null;
    } catch (e) {
      print('Error generating description: $e');
      return null;
    }
  }
}
