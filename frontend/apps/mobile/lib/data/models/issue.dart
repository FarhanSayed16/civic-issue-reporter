// File: lib/data/models/issue.dart
import 'user.dart';

class Issue {
  final int id;
  final String description;
  final String status;
  final String category;
  final double latitude;     // 👈 Bring these back
  final double longitude;    // 👈 Bring these back
  final String? imageUrl;
  final DateTime createdAt;
  final int upvoteCount;
  final int shareCount;
  final User user;

  Issue({
    required this.id,
    required this.description,
    required this.status,
    required this.category,
    required this.latitude,   // 👈 Added
    required this.longitude,  // 👈 Added
    this.imageUrl,
    required this.createdAt,
    required this.upvoteCount,
    required this.shareCount,
    required this.user,
  });

  factory Issue.fromJson(Map<String, dynamic> json) {
    // Backend returns 'lat' and 'lng', but also support 'latitude' and 'longitude' for compatibility
    final lat = json['lat'] ?? json['latitude'];
    final lng = json['lng'] ?? json['longitude'];
    
    return Issue(
      id: json['id'] ?? 0,
      description: json['description'] ?? 'No description provided',
      status: json['status'] ?? 'unknown',
      category: json['category'] ?? 'Uncategorized',
      latitude: (lat as num?)?.toDouble() ?? 0.0,
      longitude: (lng as num?)?.toDouble() ?? 0.0,
      // Handle both image_url (single) and media_urls (array) from backend
      imageUrl: json['image_url'] ?? 
                (json['media_urls'] != null && (json['media_urls'] as List).isNotEmpty 
                  ? (json['media_urls'] as List).first 
                  : null),
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      upvoteCount: json['upvote_count'] ?? 0,
      shareCount: json['share_count'] ?? 0,
      user: User.fromJson(json['user'] ?? {}),
    );
  }
}
