// File: frontend/apps/mobile/mobile/lib/features/profile/presentation/user_dashboard_screen.dart

import 'package:flutter/material.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/issue.dart';
import '../../issues/data/issue_repository.dart';
import '../../chat/presentation/chat_modal.dart'; // Import chat modal

class UserDashboardScreen extends StatefulWidget {
  const UserDashboardScreen({super.key});

  @override
  State<UserDashboardScreen> createState() => _UserDashboardScreenState();
}

class _UserDashboardScreenState extends State<UserDashboardScreen> {
  final _issueRepository = IssueRepository();
  List<Issue> _userIssues = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadUserIssues();
  }

  Future<void> _loadUserIssues() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final issues = await _issueRepository.getMyIssues();
      setState(() {
        _userIssues = issues;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
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
        title: const Text('My Issues'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: _loadUserIssues,
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
                        onPressed: _loadUserIssues,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _userIssues.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(LucideIcons.inbox, size: 64, color: Colors.grey),
                          const SizedBox(height: 16),
                          const Text('No issues reported yet'),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () {
                              // Navigate to report issue screen
                              Navigator.of(context).pushNamed('/report-issue');
                            },
                            child: const Text('Report Your First Issue'),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadUserIssues,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _userIssues.length,
                        itemBuilder: (context, index) {
                          final issue = _userIssues[index];
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
                                            Icon(LucideIcons.thumbsUp,
                                                color: AppColors.textLight),
                                            const SizedBox(width: 4),
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

                                    // Footer with date
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Row(
                                          children: [
                                            Icon(LucideIcons.calendar,
                                                size: 16,
                                                color: AppColors.textLight),
                                            const SizedBox(width: 4),
                                            Text(
                                              _formatDate(issue.createdAt),
                                              style: TextStyle(
                                                color: AppColors.textLight,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ],
                                        ),
                                        if (issue.addressLine1?.isNotEmpty ==
                                            true)
                                          Row(
                                            children: [
                                              Icon(LucideIcons.mapPin,
                                                  size: 16,
                                                  color: AppColors.textLight),
                                              const SizedBox(width: 4),
                                              Expanded(
                                                child: Text(
                                                  issue.addressLine1!,
                                                  style: TextStyle(
                                                    color: AppColors.textLight,
                                                    fontSize: 12,
                                                  ),
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
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

// Issue Details Screen (reused from home_screen.dart)
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
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
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
                    Text(
                      'Reporter',
                      style: TextStyle(
                        color: AppColors.textDark,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(LucideIcons.user, color: AppColors.textLight),
                        const SizedBox(width: 8),
                        Text(
                          widget.issue.isAnonymous
                              ? 'Anonymous'
                              : (widget.issue.reporterName ?? 'Unknown'),
                          style: TextStyle(
                            color: AppColors.textDark,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(LucideIcons.calendar, color: AppColors.textLight),
                        const SizedBox(width: 8),
                        Text(
                          _formatDate(widget.issue.createdAt),
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
    // For user dashboard, all issues are the user's own issues
    return true;
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
