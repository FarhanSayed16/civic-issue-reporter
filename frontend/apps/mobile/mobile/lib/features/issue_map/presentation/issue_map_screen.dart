// File: E:/civic-issue-reporter/apps/mobile/lib/features/issue_map/presentation/issue_map_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart'; // Part of the flutter_map package
import '../../../data/models/issue.dart';
import '../../issues/data/issue_repository.dart';

class IssueMapScreen extends StatefulWidget {
  const IssueMapScreen({super.key});

  @override
  State<IssueMapScreen> createState() => _IssueMapScreenState();
}

class _IssueMapScreenState extends State<IssueMapScreen> {
  final IssueRepository _issueRepository = IssueRepository();
  late Future<List<Issue>> _futureIssues;

  @override
  void initState() {
    super.initState();
    _futureIssues = _issueRepository
        .getAllIssues(); // Show all issues, not just public ones
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // The AppBar is handled by the AppShell, so we just build the body here.
      body: FutureBuilder<List<Issue>>(
        future: _futureIssues,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No public issues found.'));
          }

          final issues = snapshot.data!;

          // Create a list of Marker widgets from the issue data
          final markers = issues.map((issue) {
            // Different colors based on status
            Color markerColor;
            switch (issue.status.toLowerCase()) {
              case 'new':
                markerColor = Colors.green;
                break;
              case 'in_progress':
                markerColor = Colors.orange;
                break;
              case 'resolved':
                markerColor = Colors.blue;
                break;
              default:
                markerColor = Colors.grey;
            }

            return Marker(
              width: 40.0,
              height: 40.0,
              point: LatLng(issue.latitude, issue.longitude),
              child: GestureDetector(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                          'Issue #${issue.id}: ${issue.category} - ${issue.status}'),
                      duration: const Duration(seconds: 3),
                    ),
                  );
                },
                child: Icon(Icons.location_pin, color: markerColor, size: 40),
              ),
            );
          }).toList();

          return FlutterMap(
            options: MapOptions(
              initialCenter: LatLng(19.0760, 72.8777), // Center on Mumbai
              initialZoom: 11.0,
            ),
            children: [
              TileLayer(
                urlTemplate:
                    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                // No subdomains needed for the standard OSM tile server
              ),
              MarkerLayer(markers: markers),
            ],
          );
        },
      ),
    );
  }
}
