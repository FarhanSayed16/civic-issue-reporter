// File: frontend/apps/mobile/mobile/lib/features/issues/presentation/home_screen.dart

import 'package:flutter/material.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/issue.dart';
import '../data/issue_repository.dart';
import '../../chat/presentation/chat_modal.dart'; // Import chat modal
import '../../notifications/presentation/notification_modal.dart'; // Import notification modal
import '../../profile/presentation/profile_screen.dart'; // Import profile screen
import 'my_issues_screen.dart'; // Import my issues screen

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _issueRepository = IssueRepository();
  List<Issue> _issues = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadIssues();
  }

  Future<void> _loadIssues() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final issues = await _issueRepository.getAllIssues();
      setState(() {
        _issues = issues;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _upvoteIssue(String issueId) async {
    try {
      await _issueRepository.upvoteIssue(issueId);
      // Reload issues to get updated upvote count
      await _loadIssues();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Issue upvoted!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to upvote: $e')),
        );
      }
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'new':
        return Colors.green;
      case 'in_progress':
        return Colors.orange;
      case 'resolved':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'new':
        return 'New';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Civic Issues'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.list),
            onPressed: () => _navigateToMyIssues(),
          ),
          IconButton(
            icon: const Icon(LucideIcons.bell),
            onPressed: () => _showNotifications(),
          ),
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: _loadIssues,
          ),
          IconButton(
            icon: const Icon(LucideIcons.user),
            onPressed: () => _navigateToProfile(),
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
                      Icon(LucideIcons.x, size: 64, color: Colors.red),
                      const SizedBox(height: 16),
                      Text('Error: $_error'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadIssues,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _issues.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(LucideIcons.inbox, size: 64, color: Colors.grey),
                          const SizedBox(height: 16),
                          const Text('No issues found'),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _loadIssues,
                            child: const Text('Refresh'),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadIssues,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _issues.length,
                        itemBuilder: (context, index) {
                          final issue = _issues[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: InkWell(
                              onTap: () => _navigateToIssueDetails(issue),
                              borderRadius: BorderRadius.circular(12),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Header with status and upvotes
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 4,
                                          ),
                                          decoration: BoxDecoration(
                                            color:
                                                _getStatusColor(issue.status),
                                            borderRadius:
                                                BorderRadius.circular(12),
                                          ),
                                          child: Text(
                                            _getStatusText(issue.status),
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 12,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ),
                                        Row(
                                          children: [
                                            IconButton(
                                              icon: Icon(
                                                LucideIcons.thumbsUp,
                                                color: AppColors.primary,
                                              ),
                                              onPressed: () => _upvoteIssue(
                                                  issue.id.toString()),
                                            ),
                                            Text(
                                              '${issue.upvoteCount}',
                                              style: TextStyle(
                                                color: AppColors.textDark,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),

                                    // Category and Department
                                    Row(
                                      children: [
                                        Icon(LucideIcons.tag,
                                            size: 16,
                                            color: AppColors.textLight),
                                        const SizedBox(width: 4),
                                        Text(
                                          issue.category,
                                          style: TextStyle(
                                            color: AppColors.textDark,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Icon(LucideIcons.building,
                                            size: 16,
                                            color: AppColors.textLight),
                                        const SizedBox(width: 4),
                                        Expanded(
                                          child: Text(
                                            issue.assignedDepartment ??
                                                'Unassigned',
                                            style: TextStyle(
                                              color: AppColors.textLight,
                                              fontSize: 12,
                                            ),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),

                                    // Description
                                    Text(
                                      issue.description,
                                      style: TextStyle(
                                        color: AppColors.textDark,
                                        fontSize: 14,
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 8),

                                    // Footer with user and date
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Row(
                                          children: [
                                            Icon(LucideIcons.user,
                                                size: 16,
                                                color: AppColors.textLight),
                                            const SizedBox(width: 4),
                                            Text(
                                              issue.isAnonymous
                                                  ? 'Anonymous'
                                                  : (issue.reporterName ??
                                                      'Unknown'),
                                              style: TextStyle(
                                                color: AppColors.textLight,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ],
                                        ),
                                        Text(
                                          _formatDate(issue.createdAt),
                                          style: TextStyle(
                                            color: AppColors.textLight,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }

  void _showNotifications() {
    showDialog(
      context: context,
      builder: (context) => const NotificationModal(),
    );
  }

  void _navigateToMyIssues() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const MyIssuesScreen(),
      ),
    );
  }

  void _navigateToProfile() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const ProfileScreen(),
      ),
    );
  }

  void _navigateToIssueDetails(Issue issue) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => IssueDetailsScreen(issue: issue),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}

// Issue Details Screen
class IssueDetailsScreen extends StatefulWidget {
  final Issue issue;

  const IssueDetailsScreen({super.key, required this.issue});

  @override
  State<IssueDetailsScreen> createState() => _IssueDetailsScreenState();
}

class _IssueDetailsScreenState extends State<IssueDetailsScreen> {
  final _issueRepository = IssueRepository();
  bool _isUpvoting = false;

  Future<void> _upvoteIssue() async {
    setState(() => _isUpvoting = true);
    try {
      await _issueRepository.upvoteIssue(widget.issue.id.toString());
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Issue upvoted!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to upvote: $e')),
        );
      }
    } finally {
      setState(() => _isUpvoting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Issue Details'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: _isUpvoting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(LucideIcons.thumbsUp),
            onPressed: _isUpvoting ? null : _upvoteIssue,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status and Category Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: _getStatusColor(widget.issue.status),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(
                            _getStatusText(widget.issue.status),
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        Row(
                          children: [
                            Icon(LucideIcons.thumbsUp,
                                color: AppColors.primary),
                            const SizedBox(width: 4),
                            Text(
                              '${widget.issue.upvoteCount}',
                              style: TextStyle(
                                color: AppColors.textDark,
                                fontWeight: FontWeight.w600,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      widget.issue.category,
                      style: TextStyle(
                        color: AppColors.textDark,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.issue.assignedDepartment ?? 'Unassigned',
                      style: TextStyle(
                        color: AppColors.textLight,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Description Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Description',
                      style: TextStyle(
                        color: AppColors.textDark,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.issue.description,
                      style: TextStyle(
                        color: AppColors.textDark,
                        fontSize: 14,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Location Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Location',
                      style: TextStyle(
                        color: AppColors.textDark,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(LucideIcons.mapPin, color: AppColors.textLight),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '${widget.issue.latitude.toStringAsFixed(4)}, ${widget.issue.longitude.toStringAsFixed(4)}',
                            style: TextStyle(
                              color: AppColors.textDark,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                    // Show all address details if available
                    if (widget.issue.addressLine1?.isNotEmpty == true ||
                        widget.issue.addressLine2?.isNotEmpty == true ||
                        widget.issue.street?.isNotEmpty == true ||
                        widget.issue.landmark?.isNotEmpty == true ||
                        widget.issue.pincode?.isNotEmpty == true) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: Colors.blue.shade200),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Address Details:',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textDark,
                              ),
                            ),
                            const SizedBox(height: 4),
                            if (widget.issue.addressLine1?.isNotEmpty == true)
                              _buildAddressRow(
                                  'Line 1', widget.issue.addressLine1!),
                            if (widget.issue.addressLine2?.isNotEmpty == true)
                              _buildAddressRow(
                                  'Line 2', widget.issue.addressLine2!),
                            if (widget.issue.street?.isNotEmpty == true)
                              _buildAddressRow('Street', widget.issue.street!),
                            if (widget.issue.landmark?.isNotEmpty == true)
                              _buildAddressRow(
                                  'Landmark', widget.issue.landmark!),
                            if (widget.issue.pincode?.isNotEmpty == true)
                              _buildAddressRow(
                                  'Pincode', widget.issue.pincode!),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Reporter Info Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          widget.issue.isAnonymous
                              ? LucideIcons.userX
                              : LucideIcons.user,
                          color: widget.issue.isAnonymous
                              ? Colors.orange
                              : AppColors.textLight,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Reporter Information',
                          style: TextStyle(
                            color: AppColors.textDark,
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        if (widget.issue.isAnonymous) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.orange.shade100,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'Anonymous',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: Colors.orange.shade700,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Icon(LucideIcons.user, color: AppColors.textLight),
                        const SizedBox(width: 8),
                        Text(
                          widget.issue.isAnonymous
                              ? 'Anonymous User'
                              : (widget.issue.reporterName ?? 'Unknown User'),
                          style: TextStyle(
                            color: AppColors.textDark,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(LucideIcons.calendar, color: AppColors.textLight),
                        const SizedBox(width: 8),
                        Text(
                          'Reported on ${_formatDate(widget.issue.createdAt)}',
                          style: TextStyle(
                            color: AppColors.textLight,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(LucideIcons.thumbsUp, color: AppColors.textLight),
                        const SizedBox(width: 8),
                        Text(
                          '${widget.issue.upvoteCount} upvotes',
                          style: TextStyle(
                            color: AppColors.textLight,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Chat Button - only show for user's own issues
            if (_isUserOwnIssue(widget.issue))
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _navigateToChat(),
                  icon: const Icon(LucideIcons.messageCircle),
                  label: const Text('Chat with Admin'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'new':
        return Colors.green;
      case 'in_progress':
        return Colors.orange;
      case 'resolved':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'new':
        return 'New';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  }

  bool _isUserOwnIssue(Issue issue) {
    // For now, we'll check if the issue is not anonymous and has a reporter name
    // In a real app, you'd compare with the current user's ID
    return !issue.isAnonymous && issue.reporterName != null;
  }

  void _navigateToChat() {
    showDialog(
      context: context,
      builder: (context) => ChatModal(
        issueId: widget.issue.id.toString(),
        issueTitle: widget.issue.category,
        reporterName: widget.issue.reporterName,
        isAnonymous: widget.issue.isAnonymous,
        reporterId: widget.issue.reporterId.toString(),
        adminName: widget.issue.assignedAdminName,
      ),
    );
  }

  Widget _buildAddressRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(
            '$label:',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: AppColors.textLight,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontSize: 12,
              color: AppColors.textDark,
            ),
          ),
        ),
      ],
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year} at ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
