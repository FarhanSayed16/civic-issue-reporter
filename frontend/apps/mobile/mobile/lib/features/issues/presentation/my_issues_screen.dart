// File: lib/features/issues/presentation/my_issues_screen.dart

import 'package:flutter/material.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/issue.dart';
import '../data/issue_repository.dart';
import '../../chat/presentation/chat_modal.dart';
import '../../notifications/presentation/notification_modal.dart';

class MyIssuesScreen extends StatefulWidget {
  const MyIssuesScreen({super.key});

  @override
  State<MyIssuesScreen> createState() => _MyIssuesScreenState();
}

class _MyIssuesScreenState extends State<MyIssuesScreen> {
  final _issueRepository = IssueRepository();
  List<Issue> _myIssues = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadMyIssues();
  }

  Future<void> _loadMyIssues() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final issues = await _issueRepository.getMyIssues();
      setState(() {
        _myIssues = issues;
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
      await _loadMyIssues();
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

  void _showNotifications() {
    showDialog(
      context: context,
      builder: (context) => const NotificationModal(),
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
            icon: const Icon(LucideIcons.bell),
            onPressed: () => _showNotifications(),
          ),
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: _loadMyIssues,
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
                        onPressed: _loadMyIssues,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _myIssues.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(LucideIcons.inbox, size: 64, color: Colors.grey),
                          const SizedBox(height: 16),
                          const Text('No issues reported yet'),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () => Navigator.of(context).pop(),
                            child: const Text('Report an Issue'),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadMyIssues,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _myIssues.length,
                        itemBuilder: (context, index) {
                          final issue = _myIssues[index];
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
                                              issue.upvoteCount.toString(),
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
                                            fontSize: 14,
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
                                            issue.assignedDepartment ?? 'Not Assigned',
                                            style: TextStyle(
                                              color: AppColors.textDark,
                                              fontSize: 14,
                                            ),
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
                                                      'You'),
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
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Icon(LucideIcons.thumbsUp),
            onPressed: _isUpvoting ? null : _upvoteIssue,
          ),
          IconButton(
            icon: const Icon(LucideIcons.messageCircle),
            onPressed: _navigateToChat,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Issue Header
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Issue #${widget.issue.id}',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.issue.description,
                      style: const TextStyle(
                        fontSize: 16,
                        color: AppColors.textDark,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Issue Details
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Issue Details',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildAddressRow('Status', widget.issue.status),
                    _buildAddressRow('Category', widget.issue.category),
                    _buildAddressRow('Priority', widget.issue.priority ?? 'medium'),
                    _buildAddressRow('Department', widget.issue.assignedDepartment ?? 'Not Assigned'),
                    _buildAddressRow('Assigned Admin', widget.issue.assignedAdminName ?? 'Not Assigned'),
                    _buildAddressRow('Reporter', widget.issue.isAnonymous ? 'Anonymous' : (widget.issue.reporterName ?? 'Unknown')),
                    _buildAddressRow('Upvotes', widget.issue.upvoteCount.toString()),
                    _buildAddressRow('Reported', _formatDate(widget.issue.createdAt)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Location Details
            if (widget.issue.addressLine1 != null || widget.issue.street != null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Location',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textDark,
                        ),
                      ),
                      const SizedBox(height: 16),
                      if (widget.issue.addressLine1 != null)
                        _buildAddressRow('Address', widget.issue.addressLine1!),
                      if (widget.issue.street != null)
                        _buildAddressRow('Street', widget.issue.street!),
                      if (widget.issue.landmark != null)
                        _buildAddressRow('Landmark', widget.issue.landmark!),
                      if (widget.issue.pincode != null)
                        _buildAddressRow('Pincode', widget.issue.pincode!),
                      _buildAddressRow('Coordinates', '${widget.issue.latitude}, ${widget.issue.longitude}'),
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
