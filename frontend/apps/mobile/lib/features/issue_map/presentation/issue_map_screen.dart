// File: E:/civic-issue-reporter/apps/mobile/lib/features/issue_map/presentation/issue_map_screen.dart
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart'; // Part of the flutter_map package
import 'package:geolocator/geolocator.dart';
import '../../../data/models/issue.dart';
import '../../../data/models/user.dart';
import '../../issues/data/issue_repository.dart';

// ⚠️ DEMO MODE: Flag to enable mock hotspots for demo videos
// Set to true to show mock environmental hotspots when real issues are few
// MUST be disabled in production!
const bool _DEMO_MODE_ENABLED = false; // Change to true for demo

class IssueMapScreen extends StatefulWidget {
  const IssueMapScreen({super.key});

  @override
  State<IssueMapScreen> createState() => _IssueMapScreenState();
}

class _IssueMapScreenState extends State<IssueMapScreen> {
  final IssueRepository _issueRepository = IssueRepository();
  final MapController _mapController = MapController();
  late Future<List<Issue>> _futureIssues;
  Position? _userPosition;

  @override
  void initState() {
    super.initState();
    _futureIssues = _issueRepository.getPublicIssues();
    _getUserLocation();
  }

  Future<void> _getUserLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return;

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return;
      }

      if (permission == LocationPermission.deniedForever) return;

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
      );
      setState(() {
        _userPosition = position;
      });
    } catch (e) {
      // Silently fail - user location is optional
    }
  }

  // ⚠️ DEMO MODE: Generate mock hotspots near user location
  // These are TEMPORARY and for demo purposes only
  List<Issue> _generateMockHotspots(Position userPos) {
    final random = math.Random();
    final mockIssues = <Issue>[];
    
    // Generate 3-4 mock hotspots within ~2km radius
    final categories = [
      'Open Garbage Dump',
      'Plastic Waste',
      'Overflowing Bin',
      'E-Waste',
    ];
    
    for (int i = 0; i < 3; i++) {
      // Random offset: ~0.5-2km in random direction
      final angle = random.nextDouble() * 2 * math.pi;
      final distance = 0.5 + random.nextDouble() * 1.5; // 0.5-2km
      
      // Convert km to degrees (rough approximation)
      final latOffset = distance * math.cos(angle) / 111.0;
      final lngOffset = distance * math.sin(angle) / (111.0 * math.cos(math.pi * userPos.latitude / 180));
      
      mockIssues.add(Issue(
        id: 99900 + i, // Fake IDs to avoid conflicts
        description: '${categories[i]} detected in this area',
        status: 'new',
        category: categories[i],
        latitude: userPos.latitude + latOffset,
        longitude: userPos.longitude + lngOffset,
        createdAt: DateTime.now().subtract(Duration(days: random.nextInt(7))),
        upvoteCount: random.nextInt(10),
        shareCount: random.nextInt(5),
        user: User(name: 'Demo User'),
      ));
    }
    
    return mockIssues;
  }

  // Calculate bounds to fit all issues
  LatLngBounds? _calculateBounds(List<Issue> issues) {
    if (issues.isEmpty) return null;
    
    double minLat = issues.first.latitude;
    double maxLat = issues.first.latitude;
    double minLng = issues.first.longitude;
    double maxLng = issues.first.longitude;
    
    for (final issue in issues) {
      if (issue.latitude == 0.0 && issue.longitude == 0.0) continue; // Skip invalid coordinates
      minLat = math.min(minLat, issue.latitude);
      maxLat = math.max(maxLat, issue.latitude);
      minLng = math.min(minLng, issue.longitude);
      maxLng = math.max(maxLng, issue.longitude);
    }
    
    return LatLngBounds(
      LatLng(minLat, minLng),
      LatLng(maxLat, maxLng),
    );
  }

  // Get initial center point (user location or center of issues)
  LatLng _getInitialCenter(List<Issue> validIssues) {
    if (_userPosition != null) {
      return LatLng(_userPosition!.latitude, _userPosition!.longitude);
    }
    
    if (validIssues.isNotEmpty) {
      final bounds = _calculateBounds(validIssues);
      if (bounds != null) {
        return LatLng(
          (bounds.north + bounds.south) / 2,
          (bounds.east + bounds.west) / 2,
        );
      }
    }
    
    // Default to Mumbai
    return const LatLng(19.0760, 72.8777);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Environmental Hotspots Map'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
        actions: [
          if (_DEMO_MODE_ENABLED)
            Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.orange.shade100,
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Text(
                'DEMO',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.orange),
              ),
            ),
        ],
      ),
      body: FutureBuilder<List<Issue>>(
        future: _futureIssues,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          // Get real issues and filter out invalid coordinates
          List<Issue> realIssues = (snapshot.data ?? [])
              .where((issue) => issue.latitude != 0.0 || issue.longitude != 0.0)
              .toList();

          // ⚠️ DEMO MODE: Add mock hotspots if real issues are few
          List<Issue> allIssues = List.from(realIssues);
          if (_DEMO_MODE_ENABLED && realIssues.length < 3 && _userPosition != null) {
            final mockHotspots = _generateMockHotspots(_userPosition!);
            allIssues.addAll(mockHotspots);
          }

          if (allIssues.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.map, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No environmental reports found.'),
                  SizedBox(height: 8),
                  Text('Be the first to report an issue!', style: TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            );
          }

          // Filter issues by distance from user (locality focus)
          List<Issue> nearbyIssues = allIssues;
          if (_userPosition != null) {
            nearbyIssues = allIssues.where((issue) {
              final distance = _calculateDistance(
                _userPosition!.latitude,
                _userPosition!.longitude,
                issue.latitude,
                issue.longitude,
              );
              // Show issues within 5km radius (locality focus)
              return distance <= 5.0;
            }).toList();
            
            // If no nearby issues, show all (fallback)
            if (nearbyIssues.isEmpty) {
              nearbyIssues = allIssues;
            }
          }

          // Calculate initial center and bounds (prioritize nearby issues for locality focus)
          final initialCenter = _getInitialCenter(nearbyIssues);
          final bounds = _calculateBounds(nearbyIssues);
          
          // Auto-fit bounds after map loads
          final boundsToFit = bounds;
          if (boundsToFit != null) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              _mapController.fitCamera(
                CameraFit.bounds(
                  bounds: boundsToFit,
                  padding: const EdgeInsets.all(50),
                ),
              );
            });
          }

          // Create clean, minimal markers
          final markers = nearbyIssues.map((issue) {
            final isResolved = issue.status == 'resolved' || issue.status == 'completed';
            final isMock = issue.id >= 99900; // Mock issues have IDs >= 99900
            
            return Marker(
              width: 32.0,
              height: 32.0,
              point: LatLng(issue.latitude, issue.longitude),
              child: GestureDetector(
                onTap: () {
                  final nearbyCount = nearbyIssues.where((i) {
                    final distance = _calculateDistance(
                      issue.latitude, issue.longitude,
                      i.latitude, i.longitude,
                    );
                    return distance < 0.1; // ~100 meters
                  }).length;
                  
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        isMock 
                          ? '[DEMO] ${issue.category} - Mock hotspot for demo'
                          : '$nearbyCount environmental report${nearbyCount > 1 ? 's' : ''} in this area: ${issue.category}',
                      ),
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: isResolved ? Colors.green.shade600 : Colors.red.shade600,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2.5),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.location_on,
                    color: Colors.white,
                    size: 18,
                  ),
                ),
              ),
            );
          }).toList();

          // Create subtle heatmap circles (reduced radius and opacity)
          final circles = nearbyIssues.map((issue) {
            final isResolved = issue.status == 'resolved' || issue.status == 'completed';
            final isMock = issue.id >= 99900;
            
            // Skip demo hotspots from heatmap
            if (isMock) return null;
            
            return CircleMarker(
              point: LatLng(issue.latitude, issue.longitude),
              radius: 50, // Reduced from 100m to 50m for cleaner look
              color: (isResolved 
                ? Colors.green.shade400 
                : Colors.red.shade400
              ).withOpacity(0.15), // Reduced opacity from 0.2 to 0.15
            );
          }).whereType<CircleMarker>().toList();

          return Stack(
            children: [
              FlutterMap(
                mapController: _mapController,
                options: MapOptions(
                  initialCenter: initialCenter,
                  initialZoom: _userPosition != null ? 13.0 : 12.0, // Closer zoom when user location available
                  minZoom: 5.0,
                  maxZoom: 18.0,
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.example.mobile',
                    maxZoom: 19,
                  ),
                  // Heatmap circles (behind markers)
                  CircleLayer(circles: circles),
                  // Markers (on top)
                  MarkerLayer(markers: markers),
                ],
              ),
              // Minimal Legend (Active vs Cleaned only)
              Positioned(
                bottom: 16,
                left: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              color: Colors.red.shade600,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'Active',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
                          ),
                        ],
                      ),
                      const SizedBox(width: 12),
                      Container(
                        width: 1,
                        height: 16,
                        color: Colors.grey.shade300,
                      ),
                      const SizedBox(width: 12),
                      Row(
                        children: [
                          Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              color: Colors.green.shade600,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'Cleaned',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  // Helper function to calculate distance between two coordinates (Haversine formula)
  double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const double earthRadius = 6371; // Earth radius in kilometers
    final double dLat = _toRadians(lat2 - lat1);
    final double dLon = _toRadians(lon2 - lon1);
    
    final double a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_toRadians(lat1)) * math.cos(_toRadians(lat2)) *
        math.sin(dLon / 2) * math.sin(dLon / 2);
    final double c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    
    return earthRadius * c;
  }

  double _toRadians(double degrees) {
    return degrees * (math.pi / 180);
  }
}
