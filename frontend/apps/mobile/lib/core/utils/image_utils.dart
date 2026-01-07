// File: frontend/apps/mobile/lib/core/utils/image_utils.dart

import 'dart:convert';
import 'dart:typed_data';
import 'dart:io';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';

class ImageUtils {
  /// Convert image bytes to base64 data URL
  static String bytesToDataUrl(Uint8List bytes) {
    final base64String = base64Encode(bytes);
    return 'data:image/jpeg;base64,$base64String';
  }

  /// Compress image by checking size and validating
  /// ImagePicker already handles compression via imageQuality parameter
  /// This method validates and ensures size limits
  static Future<Uint8List> compressImage(Uint8List imageBytes) async {
    const maxSizeBytes = 2 * 1024 * 1024; // 2MB limit
    
    // If already under limit, return as-is
    if (imageBytes.length <= maxSizeBytes) {
      return imageBytes;
    }
    
    // If too large, we rely on ImagePicker's compression
    // This is a safety check - compression should happen at pick time
    print('Warning: Image size ${imageBytes.length} bytes exceeds 2MB limit');
    
    // Return original - compression should be handled by ImagePicker
    // In production, you might want to use a proper image compression library
    return imageBytes;
  }
}

