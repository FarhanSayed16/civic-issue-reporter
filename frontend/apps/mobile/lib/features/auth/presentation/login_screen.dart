// File: E:/civic-issue-reporter/apps/mobile/lib/features/auth/presentation/login_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/services/storage_service.dart';
import '../data/auth_repository.dart';
import '../../../core/theme/app_colors.dart';
import 'signup_screen.dart';
import '../../shell/presentation/app_shell.dart'; // ✅ Import AppShell

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authRepository = AuthRepository();
  final _storageService = StorageService();
  bool _isLoading = false;
  bool _obscureText = true;
  bool _rememberMe = false;

  void _login() async {
    if (_isLoading) return;
    setState(() {
      _isLoading = true;
    });

    try {
      // Login expects phone_number, not username
      final token = await _authRepository.login(
        _usernameController.text.trim(), // Phone number
        _passwordController.text.trim(),
      );

      await _storageService.saveToken(token.accessToken);

      if (mounted) {
        // ✅ Navigate to AppShell instead of HomeScreen
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const AppShell()),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Login Failed: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;
    final isSmallScreen = screenHeight < 700;
    final isVerySmallScreen = screenHeight < 600;
    
    return Scaffold(
      body: Stack(
        children: [
          // Background - responsive height
          Container(
            height: isVerySmallScreen 
                ? screenHeight * 0.35 
                : isSmallScreen 
                    ? screenHeight * 0.38 
                    : screenHeight * 0.4,
            decoration: const BoxDecoration(color: AppColors.primary),
          ),

          SafeArea(
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: screenHeight - MediaQuery.of(context).padding.top - MediaQuery.of(context).padding.bottom,
                ),
                child: IntrinsicHeight(
                  child: Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: screenWidth * 0.06, // Responsive horizontal padding
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SizedBox(
                          height: isVerySmallScreen 
                              ? 10 
                              : isSmallScreen 
                                  ? 20 
                                  : screenHeight * 0.03,
                        ),

                        // Logo - responsive size
                        Container(
                          padding: EdgeInsets.all(isSmallScreen ? 12 : 16),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.9),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              )
                            ],
                          ),
                          child: Icon(
                            Icons.location_city,
                            color: AppColors.primary,
                            size: isSmallScreen ? 40 : 48,
                          ),
                        ),
                        SizedBox(height: isSmallScreen ? 12 : 20),

                        // Title - responsive font size
                        Text(
                          'Sign in to your Account',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.poppins(
                            fontSize: isSmallScreen ? 22 : 28,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: isSmallScreen ? 4 : 8),
                        Text(
                          'Enter your phone and password to log in',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.poppins(
                            fontSize: isSmallScreen ? 14 : 16,
                            color: Colors.white.withOpacity(0.8),
                          ),
                        ),
                        SizedBox(height: isSmallScreen ? 20 : 30),

                        // White Login Card - responsive padding
                        Flexible(
                          child: Container(
                            padding: EdgeInsets.all(isSmallScreen ? 18.0 : 24.0),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(24),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.1),
                                  blurRadius: 20,
                                  offset: const Offset(0, 10),
                                ),
                              ],
                            ),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                // Google Sign-in button
                                OutlinedButton.icon(
                                  style: OutlinedButton.styleFrom(
                                    minimumSize: Size(double.infinity, isSmallScreen ? 45 : 50),
                                    shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12)),
                                    side: BorderSide(color: Colors.grey.shade300),
                                  ),
                                  onPressed: () {
                                    // TODO: Implement Google Sign In
                                  },
                                  icon: SvgPicture.asset(
                                      'assets/icons/google_logo.svg',
                                      height: 20),
                                  label: Text(
                                    'Continue with Google',
                                    style: GoogleFonts.poppins(
                                      color: AppColors.textDark,
                                      fontWeight: FontWeight.w600,
                                      fontSize: isSmallScreen ? 14 : 16,
                                    ),
                                  ),
                                ),
                                SizedBox(height: isSmallScreen ? 16 : 20),

                                // Separator
                                Row(
                                  children: [
                                    const Expanded(child: Divider()),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 8.0),
                                      child: Text(
                                        'Or login with',
                                        style: TextStyle(
                                          color: AppColors.textLight,
                                          fontSize: isSmallScreen ? 12 : 14,
                                        ),
                                      ),
                                    ),
                                    const Expanded(child: Divider()),
                                  ],
                                ),
                                SizedBox(height: isSmallScreen ? 16 : 20),

                                // Phone field
                                TextFormField(
                                  controller: _usernameController,
                                  decoration: InputDecoration(
                                    labelText: 'Phone',
                                    contentPadding: EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: isSmallScreen ? 12 : 16,
                                    ),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  keyboardType: TextInputType.phone,
                                ),
                                SizedBox(height: isSmallScreen ? 12 : 16),

                                // Password
                                TextFormField(
                                  controller: _passwordController,
                                  obscureText: _obscureText,
                                  decoration: InputDecoration(
                                    labelText: 'Password',
                                    contentPadding: EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: isSmallScreen ? 12 : 16,
                                    ),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    suffixIcon: IconButton(
                                      icon: Icon(_obscureText
                                          ? Icons.visibility_off
                                          : Icons.visibility),
                                      onPressed: () => setState(
                                              () => _obscureText = !_obscureText),
                                    ),
                                  ),
                                ),
                                SizedBox(height: isSmallScreen ? 12 : 16),

                                // Remember me - responsive layout
                                Flex(
                                  direction: isVerySmallScreen ? Axis.vertical : Axis.horizontal,
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Checkbox(
                                          value: _rememberMe,
                                          onChanged: (val) =>
                                              setState(() => _rememberMe = val!),
                                        ),
                                        Text(
                                          'Remember me',
                                          style: TextStyle(fontSize: isSmallScreen ? 13 : 14),
                                        ),
                                      ],
                                    ),
                                    if (isVerySmallScreen) const SizedBox(height: 8),
                                    TextButton(
                                      onPressed: () {},
                                      style: TextButton.styleFrom(
                                        padding: EdgeInsets.symmetric(
                                          horizontal: isSmallScreen ? 8 : 16,
                                          vertical: isSmallScreen ? 4 : 8,
                                        ),
                                      ),
                                      child: Text(
                                        'Forgot Password?',
                                        style: TextStyle(fontSize: isSmallScreen ? 13 : 14),
                                      ),
                                    ),
                                  ],
                                ),
                                SizedBox(height: isSmallScreen ? 16 : 20),

                                // Login button
                                _isLoading
                                    ? const Center(child: CircularProgressIndicator())
                                    : ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    minimumSize: Size(double.infinity, isSmallScreen ? 45 : 50),
                                    shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12)),
                                  ),
                                  onPressed: _login,
                                  child: Text(
                                    'Log In',
                                    style: TextStyle(fontSize: isSmallScreen ? 15 : 16),
                                  ),
                                ),
                                SizedBox(height: isSmallScreen ? 16 : 20),

                                // Signup link
                                Wrap(
                                  alignment: WrapAlignment.center,
                                  crossAxisAlignment: WrapCrossAlignment.center,
                                  children: [
                                    Text(
                                      "Don't have an account?",
                                      style: TextStyle(fontSize: isSmallScreen ? 13 : 14),
                                    ),
                                    TextButton(
                                      onPressed: () {
                                        Navigator.of(context).push(
                                          MaterialPageRoute(
                                            builder: (context) => const SignupScreen(),
                                          ),
                                        );
                                      },
                                      style: TextButton.styleFrom(
                                        padding: EdgeInsets.symmetric(
                                          horizontal: isSmallScreen ? 4 : 8,
                                        ),
                                      ),
                                      child: Text(
                                        'Sign Up',
                                        style: TextStyle(fontSize: isSmallScreen ? 13 : 14),
                                      ),
                                    ),
                                  ],
                                ),
                                // Bottom padding for very small screens
                                SizedBox(height: isVerySmallScreen ? 16 : 0),
                              ],
                            ),
                          ),
                        ),
                        // Bottom spacing
                        SizedBox(height: isSmallScreen ? 16 : 24),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
