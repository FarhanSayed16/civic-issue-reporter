// File: E:/civic-issue-reporter/apps/mobile/lib/features/issues/presentation/report_issue_screen.dart

import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/services/ai_service.dart';
import '../../../core/services/reverse_geocoding_service.dart'; // Use our custom service
import '../data/issue_repository.dart';
import 'home_screen.dart'; // Import IssueDetailsScreen

class ReportIssueScreen extends StatefulWidget {
  const ReportIssueScreen({super.key});

  @override
  State<ReportIssueScreen> createState() => _ReportIssueScreenState();
}

class _ReportIssueScreenState extends State<ReportIssueScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  final _issueRepository = IssueRepository();
  final _aiService = AIService();

  Uint8List? _imageBytes;
  Position? _currentPosition;
  String _locationDisplay = 'Fetching location...'; // Display for location
  String _selectedCategory = 'Potholes'; // Default category
  String _selectedDepartment = 'Road Maintenance Department'; // Default department
  
  // Department mapping based on category
  String _getDepartmentForCategory(String category) {
    switch (category) {
      case 'Potholes':
      case 'Road Cracks':
        return 'Road Maintenance Department';
      case 'Manholes':
        return 'Sewer Department';
      case 'Stagnant Water':
        return 'Water Department';
      case 'Damaged Signboards':
        return 'Traffic Department';
      case 'Garbage Overflow':
      case 'Trash':
        return 'Waste Management Department';
      default:
        return 'General Department';
    }
  }
  bool _postAnonymously = false;
  bool _isLoading = false;

  // Address fields like web site
  final _addressLine1Controller = TextEditingController();
  final _addressLine2Controller = TextEditingController();
  final _streetController = TextEditingController();
  final _landmarkController = TextEditingController();
  final _pincodeController = TextEditingController();

  // AI-related state
  String _aiSuggestion = '';
  Map<String, dynamic>? _detectionResults;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _addressLine1Controller.dispose();
    _addressLine2Controller.dispose();
    _streetController.dispose();
    _landmarkController.dispose();
    _pincodeController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    final pickedFile =
        await ImagePicker().pickImage(source: source, imageQuality: 80);
    if (pickedFile != null) {
      final bytes = await pickedFile.readAsBytes();
      setState(() {
        _imageBytes = bytes;
        _aiSuggestion = '';
        _detectionResults = null;
      });

      // Automatically trigger AI analysis when image is selected
      await _analyzeImage();
    }
  }

  Future<void> _getCurrentLocation() async {
    // Check location permission
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (mounted) {
          _showSnackBar('Location permission denied', isError: true);
        }
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      if (mounted) {
        _showSnackBar('Location permission permanently denied', isError: true);
      }
      return;
    }

    setState(() {
      _locationDisplay = 'Getting your precise location...';
    });
    try {
      Position position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high);
      setState(() {
        _currentPosition = position;
      });

      // --- Auto-populate address fields from location using web site's logic ---
      try {
        final addressData = await ReverseGeocodingService.reverseGeocode(
            position.latitude, position.longitude);
        if (addressData != null) {
          setState(() {
            _locationDisplay = "${addressData.line2}";

            // Auto-populate address fields using web site's logic
            _addressLine1Controller.text = addressData.line1;
            _addressLine2Controller.text = addressData.line2;
            _streetController.text = addressData.street;
            _landmarkController.text = addressData.landmark;
            _pincodeController.text = addressData.pincode;
          });
        } else {
          // Fallback to coordinates if reverse geocoding fails
          setState(() {
            _locationDisplay =
                'Location: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}';
          });
        }
      } catch (e) {
        // If reverse geocoding fails, just show the coordinates
        setState(() {
          _locationDisplay =
              'Location: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}';
        });
      }
      // --- End of Update ---
    } catch (e) {
      if (mounted) _showSnackBar('Failed to get location: $e', isError: true);
    }
  }

  // --- NEW: Real AI analysis functions ---
  Future<void> _analyzeImage() async {
    if (_imageBytes == null) return;

    setState(() {
      _aiSuggestion = 'Analyzing image...';
      _detectionResults = null;
    });

    try {
      // Get detailed AI detection results
      final results =
          await _aiService.getDetailedDetectionResults(_imageBytes!);

      setState(() {
        _detectionResults = results;
      });

      if (results['hasDetections'] == true) {
        final topDetection = results['topDetection'];
        final suggestedCategory = results['suggestedCategory'];

        setState(() {
          _aiSuggestion =
              'Detected: ${topDetection['label']} (${topDetection['confidencePercent']}% confidence)';

          if (suggestedCategory != null) {
            _selectedCategory = suggestedCategory;
          }
        });

        // Get severity estimation - REMOVED (now handled by backend NLP)
        // await _estimateSeverity();
      } else {
        setState(() {
          _aiSuggestion =
              results['message'] ?? 'No issues detected in the image';
        });
      }
    } catch (e) {
      setState(() {
        _aiSuggestion = 'AI analysis failed: ${e.toString()}';
        _detectionResults = {'hasDetections': false, 'error': e.toString()};
      });
    }
  }

  // Severity estimation method removed - now handled by backend NLP

  void _submitIssue() async {
    if (!_formKey.currentState!.validate()) return;
    if (_imageBytes == null) {
      _showSnackBar('Please add an image of the issue.', isError: true);
      return;
    }
    if (_currentPosition == null) {
      _showSnackBar('Please wait for your location to be fetched.',
          isError: true);
      _getCurrentLocation(); // Try fetching again
      return;
    }

    setState(() {
      _isLoading = true;
    });
    try {
      final createdIssue = await _issueRepository.createIssue(
        description: _descriptionController.text.trim(),
        category: _selectedCategory,
        department: _selectedDepartment,
        latitude: _currentPosition!.latitude,
        longitude: _currentPosition!.longitude,
        imageBytes: _imageBytes!,
        isAnonymous: _postAnonymously,
        addressLine1: _addressLine1Controller.text.trim(),
        addressLine2: _addressLine2Controller.text.trim(),
        street: _streetController.text.trim(),
        landmark: _landmarkController.text.trim(),
        pincode: _pincodeController.text.trim(),
      );

      if (mounted) {
        _showSnackBar('Issue reported successfully!');
        // Navigate to the created issue details with back button
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => IssueDetailsScreen(issue: createdIssue),
          ),
        );
      }
    } catch (e) {
      if (mounted)
        _showSnackBar('Failed to report issue: ${e.toString()}', isError: true);
    } finally {
      if (mounted)
        setState(() {
          _isLoading = false;
        });
    }
  }

  void _showSnackBar(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? AppColors.error : AppColors.success,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Report an Issue'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Location Bar
              GestureDetector(
                onTap: _getCurrentLocation, // Make location bar refreshable
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: Colors.grey.shade300)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(LucideIcons.mapPin,
                          color: AppColors.primary, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                          child: Text(_locationDisplay,
                              style:
                                  const TextStyle(fontWeight: FontWeight.w500),
                              textAlign: TextAlign.center)),
                      if (_currentPosition == null &&
                          !_isLoading) // Show refresh if location not set
                        const Icon(Icons.refresh,
                            color: AppColors.textLight, size: 16),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Image Buttons
              Row(
                children: [
                  Expanded(
                      child: _ImageButton(
                          icon: LucideIcons.image,
                          text: 'Add from gallery',
                          onTap: () => _pickImage(ImageSource.gallery))),
                  const SizedBox(width: 16),
                  Expanded(
                      child: _ImageButton(
                          icon: LucideIcons.camera,
                          text: 'Take photo',
                          onTap: () => _pickImage(ImageSource.camera))),
                ],
              ),
              if (_imageBytes != null)
                Padding(
                  padding: const EdgeInsets.only(top: 16.0),
                  child: Stack(
                    alignment: Alignment.topRight,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.memory(_imageBytes!,
                            fit: BoxFit.cover,
                            width: double.infinity,
                            height: 200),
                      ),
                      IconButton(
                        icon: const Icon(Icons.cancel, color: Colors.white),
                        onPressed: () => setState(() {
                          _imageBytes = null;
                        }),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 24),

              // Description Field
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  hintText: 'Description',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.all(Radius.circular(12)),
                      borderSide: BorderSide.none),
                ),
                maxLines: 4,
                validator: (value) => (value?.isEmpty ?? true)
                    ? 'Please enter a description'
                    : null,
              ),
              const SizedBox(height: 16),

              // AI Analysis Section
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(LucideIcons.brain,
                            color: AppColors.primary, size: 20),
                        const SizedBox(width: 8),
                        Text('AI Analysis',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary)),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // AI Detection Results Display
                    if (_detectionResults != null) ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                              color: AppColors.primary.withOpacity(0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  LucideIcons.brain,
                                  color: AppColors.primary,
                                  size: 16,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'AI Detection Results',
                                  style: TextStyle(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            if (_detectionResults!['hasDetections'] ==
                                true) ...[
                              // Show top detection
                              if (_detectionResults!['topDetection'] !=
                                  null) ...[
                                Text(
                                  'Primary Detection:',
                                  style: TextStyle(
                                    color: AppColors.textDark,
                                    fontWeight: FontWeight.w500,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(6),
                                    border:
                                        Border.all(color: Colors.grey.shade300),
                                  ),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          _detectionResults!['topDetection']
                                              ['label'],
                                          style: TextStyle(
                                            color: AppColors.textDark,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppColors.primary
                                              .withOpacity(0.1),
                                          borderRadius:
                                              BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          '${_detectionResults!['topDetection']['confidencePercent']}%',
                                          style: TextStyle(
                                            color: AppColors.primary,
                                            fontWeight: FontWeight.w600,
                                            fontSize: 10,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                              const SizedBox(height: 8),
                              // Show all detections if there are multiple
                              if (_detectionResults!['allDetections'] != null &&
                                  (_detectionResults!['allDetections'] as List)
                                          .length >
                                      1) ...[
                                Text(
                                  'All Detections:',
                                  style: TextStyle(
                                    color: AppColors.textDark,
                                    fontWeight: FontWeight.w500,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                ...(_detectionResults!['allDetections'] as List)
                                    .map<Widget>((detection) {
                                  return Container(
                                    margin: const EdgeInsets.only(bottom: 4),
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color: Colors.grey.shade50,
                                      borderRadius: BorderRadius.circular(4),
                                      border: Border.all(
                                          color: Colors.grey.shade200),
                                    ),
                                    child: Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            detection['label'],
                                            style: TextStyle(
                                              color: AppColors.textDark,
                                              fontSize: 11,
                                            ),
                                          ),
                                        ),
                                        Text(
                                          '${detection['confidencePercent']}%',
                                          style: TextStyle(
                                            color: AppColors.textLight,
                                            fontSize: 10,
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                }).toList(),
                              ],
                              const SizedBox(height: 8),
                              // Show suggested category
                              if (_detectionResults!['suggestedCategory'] !=
                                  null) ...[
                                Row(
                                  children: [
                                    Icon(
                                      LucideIcons.tag,
                                      color: AppColors.primary,
                                      size: 14,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      'Suggested Category: ',
                                      style: TextStyle(
                                        color: AppColors.textDark,
                                        fontWeight: FontWeight.w500,
                                        fontSize: 12,
                                      ),
                                    ),
                                    Text(
                                      _detectionResults!['suggestedCategory'],
                                      style: TextStyle(
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.w600,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ] else ...[
                              // No detections
                              Row(
                                children: [
                                  Icon(
                                    LucideIcons.eyeOff,
                                    color: AppColors.textLight,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    _detectionResults!['message'] ??
                                        'No issues detected',
                                    style: TextStyle(
                                      color: AppColors.textLight,
                                      fontStyle: FontStyle.italic,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ] else if (_aiSuggestion.isNotEmpty) ...[
                      // Fallback to simple display if detailed results not available
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                              color: AppColors.primary.withOpacity(0.3)),
                        ),
                        child: Text(
                          _aiSuggestion,
                          style: TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w500),
                        ),
                      ),
                    ],

                    // Severity display removed - now handled by backend NLP

                    const SizedBox(height: 12),

                    // AI Action Buttons - REMOVED (automatic detection only)
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Category Dropdown
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                items: [
                  'Potholes',
                  'Road Cracks',
                  'Manholes',
                  'Stagnant Water',
                  'Damaged Signboards',
                  'Garbage Overflow',
                  'Trash',
                  'Other Issues'
                ]
                    .map((v) => DropdownMenuItem(value: v, child: Text(v)))
                    .toList(),
                onChanged: (val) => setState(() {
                  _selectedCategory = val!;
                  _selectedDepartment = _getDepartmentForCategory(val!);
                }),
                decoration: InputDecoration(
                  prefixIcon: const Icon(LucideIcons.layoutGrid,
                      color: AppColors.textLight),
                  labelText: 'Category (AI Suggested)',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),

              // Department Dropdown (Auto-set based on category)
              DropdownButtonFormField<String>(
                value: _selectedDepartment,
                items: [
                  'General Department',
                  'Road Maintenance Department',
                  'Sewer Department',
                  'Water Department',
                  'Traffic Department',
                  'Waste Management Department',
                ]
                    .map((v) => DropdownMenuItem(value: v, child: Text(v)))
                    .toList(),
                onChanged: null, // Read-only, automatically set by category
                decoration: InputDecoration(
                  prefixIcon: const Icon(LucideIcons.building,
                      color: AppColors.textLight),
                  labelText: 'Department (Auto-assigned)',
                  filled: true,
                  fillColor: Colors.grey.shade100, // Gray background to indicate read-only
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),

              // Address Fields
              Text(
                'Address Details',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 12),

              // Address Line 1
              TextFormField(
                controller: _addressLine1Controller,
                decoration: InputDecoration(
                  prefixIcon:
                      const Icon(LucideIcons.house, color: AppColors.textLight),
                  labelText: 'Address Line 1',
                  hintText: 'House/Block, Area',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 12),

              // Address Line 2
              TextFormField(
                controller: _addressLine2Controller,
                decoration: InputDecoration(
                  prefixIcon: const Icon(LucideIcons.building,
                      color: AppColors.textLight),
                  labelText: 'Address Line 2',
                  hintText: 'Apartment, Nearby area',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 12),

              // Street and Landmark Row
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _streetController,
                      decoration: InputDecoration(
                        prefixIcon: const Icon(LucideIcons.mapPin,
                            color: AppColors.textLight),
                        labelText: 'Street',
                        hintText: 'Street/Road',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _landmarkController,
                      decoration: InputDecoration(
                        prefixIcon: const Icon(LucideIcons.mapPin,
                            color: AppColors.textLight),
                        labelText: 'Landmark',
                        hintText: 'Near ...',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Pincode
              TextFormField(
                controller: _pincodeController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  prefixIcon:
                      const Icon(LucideIcons.hash, color: AppColors.textLight),
                  labelText: 'Pincode',
                  hintText: 'e.g. 834001',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 24),

              // Anonymous Toggle
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12)),
                child: SwitchListTile(
                  title: const Text('Post Anonymously',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text(
                      'Your personal details will not be shown on the public feed.'),
                  value: _postAnonymously,
                  onChanged: (val) => setState(() => _postAnonymously = val),
                  activeColor: AppColors.primary,
                ),
              ),
              const SizedBox(height: 24),

              // Submit Button
              _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : ElevatedButton(
                      onPressed: _submitIssue,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('POST ISSUE', style: TextStyle(fontSize: 16)),
                          SizedBox(width: 8),
                          Icon(Icons.arrow_forward)
                        ],
                      ),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}

// Helper widget for the two image buttons
class _ImageButton extends StatelessWidget {
  final IconData icon;
  final String text;
  final VoidCallback onTap;
  const _ImageButton(
      {required this.icon, required this.text, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.primary, size: 28),
            const SizedBox(height: 8),
            Text(text, style: const TextStyle(fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}
