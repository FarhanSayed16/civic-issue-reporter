// File: lib/data/models/issue.dart
import 'user.dart';

class Issue {
  final int id;
  final int reporterId;
  final String description;
  final String status;
  final String category;
  final double latitude;
  final double longitude;
  final String? imageUrl;
  final DateTime createdAt;
  final int upvoteCount;
  final int shareCount;
  final User user;
  final String? assignedDepartment;
  final int? assignedAdminId;
  final String? assignedAdminName;
  final bool isAnonymous;
  final String? reporterName;
  final String? priority;
  final bool isVerified;
  final String? addressLine1;
  final String? addressLine2;
  final String? street;
  final String? landmark;
  final String? pincode;

  Issue({
    required this.id,
    required this.reporterId,
    required this.description,
    required this.status,
    required this.category,
    required this.latitude,
    required this.longitude,
    this.imageUrl,
    required this.createdAt,
    required this.upvoteCount,
    required this.shareCount,
    required this.user,
    this.assignedDepartment,
    this.assignedAdminId,
    this.assignedAdminName,
    this.isAnonymous = false,
    this.reporterName,
    this.priority,
    this.isVerified = true,
    this.addressLine1,
    this.addressLine2,
    this.street,
    this.landmark,
    this.pincode,
  });

  factory Issue.fromJson(Map<String, dynamic> json) {
    return Issue(
      id: json['id'] ?? 0,
      reporterId: json['reporter_id'] ?? 0,
      description: json['description'] ?? 'No description provided',
      status: json['status'] ?? 'unknown',
      category: json['category'] ?? 'Uncategorized',
      latitude: (json['lat'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['lng'] as num?)?.toDouble() ?? 0.0,
      imageUrl:
          json['media_urls'] != null && (json['media_urls'] as List).isNotEmpty
              ? json['media_urls'][0]
              : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      upvoteCount: json['upvote_count'] ?? 0,
      shareCount: json['share_count'] ?? 0,
      user: User.fromJson(json['user'] ?? {}),
      assignedDepartment: json['assigned_department'],
      assignedAdminId: json['assigned_admin_id'],
      assignedAdminName: json['assigned_admin_name'],
      isAnonymous: json['is_anonymous'] ?? false,
      reporterName: json['reporter_name'],
      priority: json['priority'],
      isVerified: json['is_verified'] ?? true,
      addressLine1: json['address_line1'],
      addressLine2: json['address_line2'],
      street: json['street'],
      landmark: json['landmark'],
      pincode: json['pincode'],
    );
  }
}
