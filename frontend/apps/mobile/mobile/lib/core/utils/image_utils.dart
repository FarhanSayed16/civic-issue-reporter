// File: frontend/apps/mobile/mobile/lib/core/utils/image_utils.dart

import 'dart:convert';
import 'dart:typed_data';

class ImageUtils {
  /// Convert image bytes to base64 data URL
  static String bytesToDataUrl(Uint8List bytes) {
    final base64String = base64Encode(bytes);
    return 'data:image/jpeg;base64,$base64String';
  }
}
