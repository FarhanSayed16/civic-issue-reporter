// File: E:/civic-issue-reporter/apps/mobile/lib/features/shell/presentation/app_shell.dart
import 'package:flutter/material.dart';
import '../../issues/presentation/home_screen.dart';
import '../../issue_map/presentation/issue_map_screen.dart';
import '../../issues/presentation/report_issue_screen.dart';
import '../../profile/presentation/user_dashboard_screen.dart'; // 👈 Import the new UserDashboardScreen
import '../../notifications/presentation/notification_modal.dart'; // Import notification modal
import 'widgets/bottom_nav_bar.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _selectedIndex = 1; // Start on the Home screen

  // 👇 Updated pages list
  static const List<Widget> _pages = <Widget>[
    IssueMapScreen(),
    HomeScreen(),
    ReportIssueScreen(),
    UserDashboardScreen(), // 👈 Replaced ProfileScreen with UserDashboardScreen
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: _pages,
      ),
      bottomNavigationBar: BottomNavBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
      ),
    );
  }
}
