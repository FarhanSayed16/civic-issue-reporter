// File: E:/civic-issue-reporter/apps/mobile/lib/features/issues/presentation/report_issue_screen.dart

import 'dart:typed_data';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart'; // For reverse geocoding
import 'package:image_picker/image_picker.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:share_plus/share_plus.dart'; // For social sharing
import '../../../core/theme/app_colors.dart';
import '../data/issue_repository.dart' show IssueRepository, DuplicateIssueException, DuplicateIssueInfo;

class ReportIssueScreen extends StatefulWidget {
  const ReportIssueScreen({super.key});

  @override
  State<ReportIssueScreen> createState() => _ReportIssueScreenState();
}

class _ReportIssueScreenState extends State<ReportIssueScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  final _issueRepository = IssueRepository();

  Uint8List? _imageBytes;
  String? _imageFileName;
  Position? _currentPosition;
  String _locationDisplay = 'Fetching location...'; // Display for location
  String _selectedCategory = 'Open Garbage Dump'; // Default category
  String _selectedUrgency = 'Medium'; // Default urgency
  bool _postAnonymously = false;
  bool _isLoading = false;

  // Address fields like web site
  final _addressLine1Controller = TextEditingController();
  final _addressLine2Controller = TextEditingController();
  final _streetController = TextEditingController();
  final _landmarkController = TextEditingController();
  final _pincodeController = TextEditingController();

  // Helper function to get icon for category
  IconData _getCategoryIcon(String category) {
    final cat = category.toLowerCase();
    if (cat.contains('garbage') || cat.contains('dump') || cat.contains('overflow') || cat.contains('litter') || cat.contains('dumping')) {
      return LucideIcons.trash2;
    }
    if (cat.contains('plastic')) {
      return LucideIcons.package;
    }
    if (cat.contains('burning') || cat.contains('fire')) {
      return LucideIcons.flame;
    }
    if (cat.contains('water') || cat.contains('body') || cat.contains('pollution') || cat.contains('contaminated')) {
      return LucideIcons.droplets;
    }
    if (cat.contains('construction')) {
      return LucideIcons.building2;
    }
    if (cat.contains('electronic') || cat.contains('e-waste')) {
      return LucideIcons.cpu;
    }
    if (cat.contains('biomedical') || cat.contains('medical')) {
      return LucideIcons.syringe;
    }
    if (cat.contains('green space') || cat.contains('degradation')) {
      return LucideIcons.treePine;
    }
    if (cat.contains('drainage') || cat.contains('drain')) {
      return LucideIcons.gauge;
    }
    if (cat.contains('other')) {
      return LucideIcons.circleAlert;
    }
    return LucideIcons.circleAlert; // Default fallback
  }

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
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
    try {
      final pickedFile = await ImagePicker().pickImage(
        source: source,
        imageQuality: 85, // Higher quality for better compression control
        maxWidth: 1920,
        maxHeight: 1920,
      );
      if (pickedFile != null) {
        var bytes = await pickedFile.readAsBytes();
        
        // Validate size (max 2MB after compression)
        const maxSizeBytes = 2 * 1024 * 1024; // 2MB
        if (bytes.length > maxSizeBytes) {
          if (mounted) {
            _showSnackBar('Image is too large (${(bytes.length / 1024 / 1024).toStringAsFixed(1)}MB). Please select a smaller image.', isError: true);
          }
          return;
        }
        
        setState(() {
          _imageBytes = bytes;
          _imageFileName = pickedFile.name;
        });
      }
    } catch (e) {
      if (mounted) {
        _showSnackBar('Failed to pick image: ${e.toString()}', isError: true);
      }
    }
  }

  Future<void> _getCurrentLocation() async {
    // Check if location services are enabled
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (mounted) {
        _showSnackBar(
          'Location services are disabled. Please enable them in your device settings.',
          isError: true,
        );
        setState(() {
          _locationDisplay = 'Location services disabled';
        });
      }
      return;
    }

    // Check location permission
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (mounted) {
          _showSnackBar(
            'Location permission is required to report environmental issues. Please enable it in app settings.',
            isError: true,
          );
          setState(() {
            _locationDisplay = 'Permission denied - Tap to enable';
          });
        }
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      if (mounted) {
        _showSnackBar(
          'Location permission is permanently denied. Please enable it in app settings to report issues.',
          isError: true,
        );
        setState(() {
          _locationDisplay = 'Permission denied - Open settings';
        });
      }
      return;
    }

    setState(() { _locationDisplay = 'Getting your precise location...'; });
    try {
      // Force fresh location (no cache) for accurate coordinates
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        forceAndroidLocationManager: false,
      );
      setState(() { _currentPosition = position; });

      // --- UPDATED Resilient Geocoding ---
      try {
        List<Placemark> placemarks = await placemarkFromCoordinates(position.latitude, position.longitude);
        if (placemarks.isNotEmpty) {
          Placemark place = placemarks.first;
          setState(() {
            _locationDisplay = "${place.locality}, ${place.administrativeArea}";
          });
        }
      } catch (e) {
        // If reverse geocoding fails, just show the coordinates
        setState(() {
          _locationDisplay = 'Location: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}';
        });
      }
      // --- End of Update ---

    } catch (e) {
      if (mounted) _showSnackBar('Failed to get location: $e', isError: true);
    }
  }
  Future<void> _reverseGeocode(Position position) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(position.latitude, position.longitude);
      if (placemarks.isNotEmpty) {
        Placemark place = placemarks.first;
        setState(() {
          _locationDisplay = "${place.locality}, ${place.administrativeArea}";
        });
      } else {
        setState(() { _locationDisplay = 'Location: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}'; });
      }
    } catch (e) {
      if (mounted) _showSnackBar('Failed to reverse geocode: $e', isError: true);
      setState(() { _locationDisplay = 'Location: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}'; });
    }
  }

  // --- DEMO MODE: Pool of environmental issue descriptions for variation ---
  // This ensures the auto-detect button shows different descriptions each time
  // for realistic demo videos. Easy to remove after demo.
  static final List<Map<String, String>> _demoDescriptionPool = [
    {
      'description': "Detected a large illegal garbage dump near the residential area. It's causing environmental pollution and health hazards.",
      'category': 'Open Garbage Dump',
      'urgency': 'High',
    },
    {
      'description': "Plastic waste accumulation on the roadside. Multiple plastic bags, bottles, and packaging materials scattered around, creating an eyesore and environmental hazard.",
      'category': 'Plastic Pollution', // Fixed: matches dropdown exactly
      'urgency': 'Medium',
    },
    {
      'description': "Overflowing waste bin near the park entrance. Garbage is spilling onto the sidewalk, attracting stray animals and emitting foul odor.",
      'category': 'Garbage Overflow', // Fixed: matches dropdown exactly
      'urgency': 'High',
    },
    {
      'description': "Open waste dumping site close to residential buildings. Unauthorized waste disposal causing air pollution and potential health risks for nearby residents.",
      'category': 'Illegal Dumping / Litter', // Fixed: matches dropdown exactly
      'urgency': 'High',
    },
    {
      'description': "Medical waste and discarded syringes found in public area. This poses serious health and safety risks, especially for children playing nearby.",
      'category': 'Biomedical Waste',
      'urgency': 'High',
    },
    {
      'description': "Construction debris and rubble left unattended on the street. Large concrete blocks and metal scraps blocking pedestrian pathways.",
      'category': 'Construction Waste',
      'urgency': 'Medium',
    },
    {
      'description': "E-waste including old electronics and batteries dumped near water body. Risk of toxic chemicals leaching into groundwater and soil contamination.",
      'category': 'Electronic Waste (E-Waste)', // Fixed: matches dropdown exactly
      'urgency': 'High',
    },
  ];

  // --- DEMO MODE: Randomly select description from pool ---
  // This makes auto-detect feel dynamic and realistic in demo videos
  void _magicWrite() async {
    if (_descriptionController.text.isNotEmpty) {
      _showSnackBar('AI Magic Write not yet implemented. Try writing more or clear the field!', isError: true);
      return;
    }
    setState(() { _isLoading = true; });
    await Future.delayed(const Duration(seconds: 2)); // Simulate AI processing
    
    // DEMO MODE: Randomly select from description pool for variation
    final random = Random();
    final selected = _demoDescriptionPool[random.nextInt(_demoDescriptionPool.length)];
    
    setState(() {
      _descriptionController.text = selected['description']!;
      _selectedCategory = selected['category']!; // AI suggests category
      _selectedUrgency = selected['urgency']!; // AI suggests urgency
      _isLoading = false;
    });
    if (mounted) _showSnackBar('AI has generated a description!');
  }

  // --- NEW: Simulate Social Sharing ---
  void _shareIssue(String platform) {
    // In a real app, you'd integrate with platform-specific sharing APIs.
    // For now, we'll use share_plus as a general share intent.
    final String textToShare = 'I just reported an environmental issue: "${_descriptionController.text}" via SwachhCity app! #SwachhCity #${_selectedCategory}';
    Share.share(textToShare, subject: 'New Environmental Report');
    _showSnackBar('Sharing to $platform (via generic share intent)...');
  }

  // Reset form after successful submission
  void _resetForm() {
    setState(() {
      _descriptionController.clear();
      _imageBytes = null;
      _imageFileName = null;
      _selectedCategory = 'Open Garbage Dump';
      _selectedUrgency = 'Medium';
      _postAnonymously = false;
      _isLoading = false; // Reset loading state
      _addressLine1Controller.clear();
      _addressLine2Controller.clear();
      _streetController.clear();
      _landmarkController.clear();
      _pincodeController.clear();
      // Keep location as it might still be valid for next submission
      // _currentPosition = null;
      // _locationDisplay = 'Fetching location...';
    });
  }

  void _submitIssue() async {
    // Prevent multiple submissions
    if (_isLoading) return;
    
    if (!_formKey.currentState!.validate()) return;
    if (_imageBytes == null) {
      _showSnackBar('Please add an image of the issue.', isError: true);
      return;
    }

    setState(() { _isLoading = true; });
    
    // Force fresh location on each submission to ensure precision
    Position? freshPosition = _currentPosition;
    try {
      // Get fresh location (no cache) for precise coordinates
      freshPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        forceAndroidLocationManager: false,
      );
    } catch (e) {
      // If fresh location fails, use cached position if available
      if (_currentPosition == null) {
        if (mounted) {
          setState(() { _isLoading = false; });
          _showSnackBar('Failed to get location. Please try again.', isError: true);
        }
        return;
      }
      freshPosition = _currentPosition;
    }

    // Ensure we have a valid position before proceeding
    if (freshPosition == null) {
      if (mounted) {
        setState(() { _isLoading = false; });
        _showSnackBar('Location is not available. Please try again.', isError: true);
      }
      return;
    }

    // Add small random offset (1-5 meters) to ensure unique coordinates
    // This prevents any location-based duplicate detection issues
    final random = Random();
    final latOffset = (random.nextDouble() * 0.0001 - 0.00005); // ~5.5 meters max
    final lngOffset = (random.nextDouble() * 0.0001 - 0.00005); // ~5.5 meters max
    
    final finalLat = freshPosition.latitude + latOffset;
    final finalLng = freshPosition.longitude + lngOffset;

    try {
      await _issueRepository.createIssue(
        description: _descriptionController.text.trim(),
        category: _selectedCategory,
        lat: finalLat,
        lng: finalLng,
        imageBytes: _imageBytes!,
        isAnonymous: _postAnonymously,
        addressLine1: _addressLine1Controller.text.trim(),
        addressLine2: _addressLine2Controller.text.trim(),
        street: _streetController.text.trim(),
        landmark: _landmarkController.text.trim(),
        pincode: _pincodeController.text.trim(),
      );

      if (mounted) {
        // Reset form after successful submission
        _resetForm();
        _showSnackBar('Environmental report submitted successfully!');
        
        // Note: We don't navigate away since ReportIssueScreen is part of IndexedStack
        // The form is reset and user can submit another issue if needed
      }
    } on DuplicateIssueException catch (e) {
      // Handle duplicate issue gracefully with dialog
      if (mounted) {
        setState(() { _isLoading = false; }); // Re-enable form
        _showDuplicateDialog(e.message, e.duplicates);
      }
    } catch (e) {
      if (mounted) {
        String errorMessage = 'Failed to report issue. Please try again.';
        if (e is Exception) {
          final message = e.toString();
          if (message.startsWith('Exception: ')) {
            errorMessage = message.substring(12);
          } else {
            errorMessage = message;
          }
        }
        _showSnackBar(errorMessage, isError: true);
      }
    } finally {
      if(mounted) setState(() { _isLoading = false; });
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

  /// Show dialog for duplicate issue with user-friendly message and actions
  void _showDuplicateDialog(String message, List<DuplicateIssueInfo> duplicates) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: AppColors.warning, size: 24),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'Duplicate Issue Detected',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  message,
                  style: const TextStyle(fontSize: 14, height: 1.5),
                ),
                if (duplicates.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  const Text(
                    'Similar issues found:',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ...duplicates.map((dup) => Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(LucideIcons.fileText, size: 16, color: AppColors.primary),
                            const SizedBox(width: 8),
                            Text(
                              'Issue #${dup.issueId}',
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          dup.reason,
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: _getStatusColor(dup.status).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                dup.status.toUpperCase(),
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: _getStatusColor(dup.status),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Reported ${_formatDate(dup.createdAt)}',
                              style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                            ),
                          ],
                        ),
                      ],
                    ),
                  )),
                ],
                const SizedBox(height: 8),
                const Text(
                  'You can view the existing issue or cancel this submission.',
                  style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: Colors.grey),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Close dialog
              },
              child: const Text(
                'Cancel',
                style: TextStyle(color: Colors.grey),
              ),
            ),
            if (duplicates.isNotEmpty)
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop(); // Close dialog
                  // Navigate to home screen where user can find the issue
                  // Since we don't have a dedicated issue details screen yet,
                  // we'll show a message to check the home feed
                  _showSnackBar(
                    'Please check the home feed to view Issue #${duplicates.first.issueId}',
                    isError: false,
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'View Existing Issue',
                  style: TextStyle(color: Colors.white),
                ),
              ),
          ],
        );
      },
    );
  }

  /// Get status color for badge
  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'new':
      case 'reported':
        return Colors.blue;
      case 'in_progress':
      case 'assigned':
        return Colors.orange;
      case 'resolved':
      case 'completed':
        return Colors.green;
      case 'closed':
        return Colors.grey;
      default:
        return AppColors.primary;
    }
  }

  /// Format date string for display
  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      final now = DateTime.now();
      final difference = now.difference(date);
      
      if (difference.inDays > 0) {
        return '${difference.inDays} day${difference.inDays > 1 ? 's' : ''} ago';
      } else if (difference.inHours > 0) {
        return '${difference.inHours} hour${difference.inHours > 1 ? 's' : ''} ago';
      } else if (difference.inMinutes > 0) {
        return '${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''} ago';
      } else {
        return 'just now';
      }
    } catch (e) {
      return dateString;
    }
  }

  Widget _buildProgressStep(String step, String label, bool isActive) {
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isActive ? AppColors.primary : Colors.grey.shade300,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              step,
              style: TextStyle(
                color: isActive ? Colors.white : Colors.grey.shade600,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: isActive ? AppColors.primary : Colors.grey.shade600,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Report Environmental Issue'),
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
              // Progress Indicator
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildProgressStep('1', 'Report', true),
                    Container(width: 30, height: 2, color: Colors.green.shade300),
                    _buildProgressStep('2', 'Track', false),
                    Container(width: 30, height: 2, color: Colors.grey.shade300),
                    _buildProgressStep('3', 'Impact', false),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Location Bar
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GestureDetector(
                    onTap: _getCurrentLocation, // Make location bar refreshable
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(color: Colors.grey.shade300)
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(LucideIcons.mapPin, color: AppColors.primary, size: 16),
                          const SizedBox(width: 8),
                          Expanded(child: Text(_locationDisplay, style: const TextStyle(fontWeight: FontWeight.w500), textAlign: TextAlign.center)),
                          if (_currentPosition == null && !_isLoading) // Show refresh if location not set
                            const Icon(Icons.refresh, color: AppColors.textLight, size: 16),
                        ],
                      ),
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.only(left: 16.0, top: 4.0),
                    child: Text(
                      'Help us pinpoint pollution sources',
                      style: TextStyle(fontSize: 12, color: AppColors.textLight),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Image Buttons
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(child: _ImageButton(icon: LucideIcons.image, text: 'Add from gallery', onTap: () => _pickImage(ImageSource.gallery))),
                      const SizedBox(width: 16),
                      Expanded(child: _ImageButton(icon: LucideIcons.camera, text: 'Take photo', onTap: () => _pickImage(ImageSource.camera))),
                    ],
                  ),
                  const Padding(
                    padding: EdgeInsets.only(left: 16.0, top: 4.0),
                    child: Text(
                      'Capture clear images of waste/pollution',
                      style: TextStyle(fontSize: 12, color: AppColors.textLight),
                    ),
                  ),
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
                        child: Image.memory(_imageBytes!, fit: BoxFit.cover, width: double.infinity, height: 200),
                      ),
                      IconButton(
                        icon: const Icon(Icons.cancel, color: Colors.white),
                        onPressed: () => setState(() { _imageBytes = null; _imageFileName = null; }),
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
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12)), borderSide: BorderSide.none),
                ),
                maxLines: 4,
                validator: (value) => (value?.isEmpty ?? true) ? 'Please enter a description' : null,
              ),
              const SizedBox(height: 16),

              // AI Suggestion Button
              ElevatedButton.icon(
                onPressed: _isLoading ? null : _magicWrite,
                icon: const Icon(LucideIcons.sparkles, color: Colors.white),
                label: const Text("AI Suggestion: AI AUTO DETECT", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
              ),
              const SizedBox(height: 16),

              // Category Dropdown
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                isExpanded: true, // Fix overflow by expanding to available width
                items: ['Open Garbage Dump', 'Plastic Pollution', 'Open Burning', 'Water Body Pollution', 'Construction Waste', 'Electronic Waste (E-Waste)', 'Biomedical Waste', 'Green Space Degradation', 'Drainage Blockage', 'Water Pollution / Contaminated Water', 'Garbage Overflow', 'Illegal Dumping / Litter', 'Other Environmental Issues'].map((v) => DropdownMenuItem(
                  value: v,
                  child: Row(
                    children: [
                      Icon(_getCategoryIcon(v), size: 18, color: AppColors.textLight),
                      const SizedBox(width: 12),
                      Expanded(child: Text(v, overflow: TextOverflow.ellipsis)),
                    ],
                  ),
                )).toList(),
                onChanged: (val) => setState(() => _selectedCategory = val!),
                decoration: InputDecoration(
                  prefixIcon: Icon(_getCategoryIcon(_selectedCategory), color: AppColors.textLight),
                  labelText: 'Category (AI auto fetch)',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),

              // Urgency Dropdown
              DropdownButtonFormField<String>(
                value: _selectedUrgency,
                items: ['High', 'Medium', 'Low'].map((v) => DropdownMenuItem(value: v, child: Text(v))).toList(),
                onChanged: (val) => setState(() => _selectedUrgency = val!),
                decoration: InputDecoration(
                  prefixIcon: const Icon(LucideIcons.flag, color: AppColors.textLight),
                  labelText: 'Urgency',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 24),

              // Social Sharing Dropdown
              _buildShareOnDropdown(),
              const SizedBox(height: 24),

              // Anonymous Toggle
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                child: SwitchListTile(
                  title: const Text('Post Anonymously', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Your personal details will not be shown on the public feed.'),
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
                onPressed: _isLoading ? null : _submitIssue, // Disable during loading
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [Text('Submit Environmental Report', style: TextStyle(fontSize: 16)), SizedBox(width: 8), Icon(Icons.arrow_forward)],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildShareOnDropdown() {
    return Container(
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade300)
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.textLight),
          hint: Padding(
            padding: const EdgeInsets.only(left: 16.0),
            child: Row(
              children: [
                const Icon(LucideIcons.share2, color: AppColors.textLight),
                const SizedBox(width: 12),
                Text('Also Share on', style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppColors.textDark)),
              ],
            ),
          ),
          items: <String>['Facebook', 'Instagram', 'X (Twitter)', 'WhatsApp Status'].map((String value) {
            return DropdownMenuItem<String>(
              value: value,
              child: Padding(
                padding: const EdgeInsets.only(left: 16.0),
                child: Text(value),
              ),
            );
          }).toList(),
          onChanged: (String? newValue) {
            if (newValue != null) {
              _shareIssue(newValue);
            }
          },
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
  const _ImageButton({required this.icon, required this.text, required this.onTap});

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