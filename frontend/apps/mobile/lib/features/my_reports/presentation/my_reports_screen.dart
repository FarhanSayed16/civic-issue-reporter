// File: E:/civic-issue-reporter/apps/mobile/lib/features/my_reports/presentation/my_reports_screen.dart

import 'package:flutter/material.dart';
import '../../../data/models/issue.dart';
import '../../issues/data/issue_repository.dart';
import 'widgets/issue_list_card.dart'; // 👈 Import the new reusable card

class MyReportsScreen extends StatefulWidget {
  const MyReportsScreen({super.key});

  @override
  State<MyReportsScreen> createState() => _MyReportsScreenState();
}

class _MyReportsScreenState extends State<MyReportsScreen> {
  final IssueRepository _issueRepository = IssueRepository();
  late Future<List<Issue>> _futureIssues;
  String _selectedFilter = 'All';

  @override
  void initState() {
    super.initState();
    _futureIssues = _issueRepository.getMyIssues();
  }

  List<Issue> _filterIssues(List<Issue> issues) {
    switch (_selectedFilter) {
      case 'Under Review':
        return issues.where((issue) => issue.status == 'new').toList();
      case 'In Progress':
        return issues.where((issue) => issue.status == 'in_progress').toList();
      case 'Cleaned Up':
        return issues.where((issue) => issue.status == 'resolved').toList();
      default:
        return issues;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Environmental Reports')),
      body: Column(
        children: [
          // Impact Summary Card
          FutureBuilder<List<Issue>>(
            future: _futureIssues,
            builder: (context, snapshot) {
              if (snapshot.hasData && snapshot.data!.isNotEmpty) {
                final allIssues = snapshot.data!;
                final totalReported = allIssues.length;
                final cleanedUp = allIssues.where((i) => i.status == 'resolved').length;
                final inProgress = allIssues.where((i) => i.status == 'in_progress').length;
                
                return Container(
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.green.shade50, Colors.blue.shade50],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.green.shade200),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Your Environmental Impact',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildImpactStat('$totalReported', 'Reports Filed'),
                          _buildImpactStat('$cleanedUp', 'Cleaned Up'),
                          _buildImpactStat('$inProgress', 'In Progress'),
                        ],
                      ),
                      if (cleanedUp > 0)
                        Padding(
                          padding: const EdgeInsets.only(top: 12),
                          child: Text(
                            '🎉 You\'ve helped clean up $cleanedUp environmental issue${cleanedUp > 1 ? 's' : ''}!',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.green.shade700,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                    ],
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),
          // Filter Chips
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['All', 'Under Review', 'In Progress', 'Cleaned Up'].map((filter) {
                  final isSelected = _selectedFilter == filter;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(filter),
                      selected: isSelected,
                      onSelected: (selected) {
                        setState(() {
                          _selectedFilter = filter;
                        });
                      },
                      selectedColor: Theme.of(context).primaryColor.withOpacity(0.2),
                      checkmarkColor: Theme.of(context).primaryColor,
                      labelStyle: TextStyle(
                        color: isSelected ? Theme.of(context).primaryColor : Colors.grey[700],
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          // Issues List
          Expanded(
            child: FutureBuilder<List<Issue>>(
              future: _futureIssues,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                }
                if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(child: Text('You have not reported any environmental issues yet.'));
                }

                final allIssues = snapshot.data!;
                final filteredIssues = _filterIssues(allIssues);
                
                if (filteredIssues.isEmpty) {
                  return Center(
                    child: Text('No ${_selectedFilter.toLowerCase()} reports found.'),
                  );
                }

                return ListView.builder(
                  itemCount: filteredIssues.length,
                  itemBuilder: (context, index) {
                    final issue = filteredIssues[index];
                    return IssueListCard(issue: issue);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImpactStat(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: Colors.grey.shade700,
          ),
        ),
      ],
    );
  }
}
