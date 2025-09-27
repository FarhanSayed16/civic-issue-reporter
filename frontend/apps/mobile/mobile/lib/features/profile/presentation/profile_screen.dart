// File: E:/civic-issue-reporter/apps/mobile/lib/features/profile/presentation/profile_screen.dart

import 'package:flutter/material.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../settings/presentation/settings_screen.dart';
import '../../auth/data/auth_repository.dart';
import 'profile_edit_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _authRepository = AuthRepository();
  Map<String, dynamic>? _userData;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadUserProfile();
  }

  Future<void> _loadUserProfile() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final userData = await _authRepository.getUserProfile();
      setState(() {
        _userData = userData;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  void _navigateToEditProfile() async {
    if (_userData == null) return;
    
    final result = await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ProfileEditScreen(userData: _userData!),
      ),
    );
    
    // Reload profile if changes were made
    if (result == true) {
      _loadUserProfile();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        leading: const BackButton(),
        title: const Text('Profile'),
               actions: [
                 IconButton(
                   icon: const Icon(Icons.edit),
                   onPressed: () => _navigateToEditProfile(),
                 ),
                 IconButton(
                   icon: const Icon(Icons.settings),
                   onPressed: () {
                     Navigator.of(context).push(
                       MaterialPageRoute(builder: (context) => const SettingsScreen()),
                     );
                   },
                 ),
               ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error, size: 64, color: Colors.red),
                      const SizedBox(height: 16),
                      Text('Error: $_error'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadUserProfile,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  child: Column(
                    children: [
                      // User Info Section
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 24.0),
                        child: Column(
                          children: [
                            CircleAvatar(
                              radius: 50,
                              backgroundColor: AppColors.primary,
                              child: _userData?['profile_picture_url'] != null
                                  ? ClipOval(
                                      child: Image.network(
                                        _userData!['profile_picture_url'],
                                        width: 100,
                                        height: 100,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) {
                                          return const Icon(
                                            Icons.person,
                                            size: 50,
                                            color: Colors.white,
                                          );
                                        },
                                      ),
                                    )
                                  : const Icon(
                                      Icons.person,
                                      size: 50,
                                      color: Colors.white,
                                    ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              _userData?['full_name'] ?? 'Unknown User',
                              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              _userData?['phone_number'] ?? '',
                              style: const TextStyle(fontSize: 16, color: AppColors.textLight),
                            ),
                            if (_userData?['role'] != null)
                              Container(
                                margin: const EdgeInsets.only(top: 8),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                decoration: BoxDecoration(
                                  color: _userData!['role'] == 'admin' 
                                      ? Colors.blue.shade100 
                                      : Colors.green.shade100,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  _userData!['role']?.toString().toUpperCase() ?? '',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: _userData!['role'] == 'admin' 
                                        ? Colors.blue.shade800 
                                        : Colors.green.shade800,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),

                      // Stats Row
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _StatItem(
                              count: _userData?['issues_reported'] ?? 0,
                              label: 'Issues Reported',
                            ),
                            _StatItem(
                              count: _userData?['upvotes_received'] ?? 0,
                              label: 'Upvotes Received',
                            ),
                            _StatItem(
                              count: _userData?['issues_resolved'] ?? 0,
                              label: 'Issues Resolved',
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Trust Score Gauge
                      CircularPercentIndicator(
                        radius: 100.0,
                        lineWidth: 15.0,
                        percent: (_userData?['trust_score'] ?? 100.0) / 100.0,
                        center: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              "${(_userData?['trust_score'] ?? 100.0).toInt()}%",
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 40.0,
                                color: AppColors.success,
                              ),
                            ),
                            const Text(
                              "Trust score",
                              style: TextStyle(fontSize: 16.0, color: AppColors.textLight),
                            )
                          ],
                        ),
                        circularStrokeCap: CircularStrokeCap.round,
                        backgroundColor: Colors.green.shade100,
                        progressColor: AppColors.success,
                      ),

                      const SizedBox(height: 32),

                      // Additional Info
                      if (_userData?['department'] != null)
                        Card(
                          margin: const EdgeInsets.all(16),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Department Information',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text('Department: ${_userData!['department']}'),
                                if (_userData?['ward'] != null)
                                  Text('Ward: ${_userData!['ward']}'),
                              ],
                            ),
                          ),
                        ),

                      // Account Info
                      Card(
                        margin: const EdgeInsets.all(16),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Account Information',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text('Phone: ${_userData?['phone_number'] ?? 'N/A'}'),
                              Text('Member since: ${_userData?['created_at'] != null ? DateFormat('dd/MM/yyyy').format(DateTime.parse(_userData!['created_at'])) : 'N/A'}'),
                              Text('Last updated: ${_userData?['updated_at'] != null ? DateFormat('dd/MM/yyyy').format(DateTime.parse(_userData!['updated_at'])) : 'N/A'}'),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }
}

// Helper widget for the stat items
class _StatItem extends StatelessWidget {
  final int count;
  final String label;
  const _StatItem({required this.count, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          count.toString(),
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: AppColors.textLight),
        ),
      ],
    );
  }
}