// File: frontend/apps/mobile/mobile/lib/data/models/ai_detection.dart

class Detection {
  final String label;
  final double confidence;
  final List<double>? bbox; // [x1, y1, x2, y2] if available

  Detection({
    required this.label,
    required this.confidence,
    this.bbox,
  });

  factory Detection.fromJson(Map<String, dynamic> json) {
    return Detection(
      label: json['label'] ?? '',
      confidence: (json['confidence'] ?? 0.0).toDouble(),
      bbox: json['bbox'] != null ? List<double>.from(json['bbox']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'label': label,
      'confidence': confidence,
      'bbox': bbox,
    };
  }
}

class ImageDetectResponse {
  final List<Detection> detections;

  ImageDetectResponse({required this.detections});

  factory ImageDetectResponse.fromJson(Map<String, dynamic> json) {
    return ImageDetectResponse(
      detections: (json['detections'] as List?)
              ?.map((d) => Detection.fromJson(d))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'detections': detections.map((d) => d.toJson()).toList(),
    };
  }
}

class TextAnalyzeResponse {
  final List<String> keywords;

  TextAnalyzeResponse({required this.keywords});

  factory TextAnalyzeResponse.fromJson(Map<String, dynamic> json) {
    return TextAnalyzeResponse(
      keywords:
          (json['keywords'] as List?)?.map((k) => k.toString()).toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'keywords': keywords,
    };
  }
}

class SeverityResponse {
  final double score;
  final String level;

  SeverityResponse({required this.score, required this.level});

  factory SeverityResponse.fromJson(Map<String, dynamic> json) {
    return SeverityResponse(
      score: (json['score'] ?? 0.0).toDouble(),
      level: json['level'] ?? 'Unknown',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'score': score,
      'level': level,
    };
  }
}
