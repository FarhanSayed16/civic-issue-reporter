// Safe image widget that handles both base64 data URLs and network URLs
import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:typed_data';
import 'package:dio/dio.dart';

class SafeImageWidget extends StatefulWidget {
  final String? imageUrl;
  final BoxFit? fit;
  final double? width;
  final double? height;
  final Widget? placeholder;
  final Widget? errorWidget;

  const SafeImageWidget({
    Key? key,
    this.imageUrl,
    this.fit,
    this.width,
    this.height,
    this.placeholder,
    this.errorWidget,
  }) : super(key: key);

  @override
  State<SafeImageWidget> createState() => _SafeImageWidgetState();
}

class _SafeImageWidgetState extends State<SafeImageWidget> {
  Uint8List? _imageBytes;
  bool _isLoading = true;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    if (widget.imageUrl != null && widget.imageUrl!.isNotEmpty) {
      _loadImage();
    } else {
      setState(() {
        _isLoading = false;
        _hasError = true;
      });
    }
  }

  @override
  void didUpdateWidget(SafeImageWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.imageUrl != widget.imageUrl) {
      _loadImage();
    }
  }

  Future<void> _loadImage() async {
    if (widget.imageUrl == null || widget.imageUrl!.isEmpty) {
      setState(() {
        _isLoading = false;
        _hasError = true;
      });
      return;
    }

    try {
      setState(() {
        _isLoading = true;
        _hasError = false;
      });

      // Handle base64 data URLs
      if (widget.imageUrl!.startsWith('data:')) {
        final match = RegExp(r'data:image/[^;]+;base64,(.+)$').firstMatch(widget.imageUrl!);
        if (match != null) {
          final base64Data = match.group(1);
          if (base64Data != null) {
            // Decode base64 safely with size limit
            final decodedBytes = base64Decode(base64Data);
            if (decodedBytes.length > 10 * 1024 * 1024) { // 10MB limit
              throw Exception('Image too large');
            }
            if (mounted) {
              setState(() {
                _imageBytes = Uint8List.fromList(decodedBytes);
                _isLoading = false;
              });
            }
            return;
          }
        }
      }

      // Handle network URLs
      final dio = Dio();
      final response = await dio.get<List<int>>(
        widget.imageUrl!,
        options: Options(
          responseType: ResponseType.bytes,
          receiveTimeout: const Duration(seconds: 10),
        ),
      );

      if (response.data != null) {
        final bytes = Uint8List.fromList(response.data!);
        if (bytes.length > 10 * 1024 * 1024) { // 10MB limit
          throw Exception('Image too large');
        }
        if (mounted) {
          setState(() {
            _imageBytes = bytes;
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _hasError = true;
          _isLoading = false;
        });
      }
    }
  }

  /// Safely convert double to int, handling Infinity and NaN
  int? _safeToInt(double? value) {
    if (value == null) return null;
    if (!value.isFinite || value.isNaN) return null;
    if (value <= 0) return null;
    try {
      return value.toInt();
    } catch (e) {
      return null;
    }
  }

  /// Get safe width value (clamp Infinity to null)
  double? _safeWidth() {
    if (widget.width == null) return null;
    if (!widget.width!.isFinite || widget.width!.isNaN) return null;
    return widget.width;
  }

  /// Get safe height value (clamp Infinity to null)
  double? _safeHeight() {
    if (widget.height == null) return null;
    if (!widget.height!.isFinite || widget.height!.isNaN) return null;
    return widget.height;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      final safeWidth = _safeWidth();
      final safeHeight = _safeHeight();
      return widget.placeholder ??
          SizedBox(
            width: safeWidth,
            height: safeHeight,
            child: const Center(child: CircularProgressIndicator()),
          );
    }

    if (_hasError || _imageBytes == null) {
      final safeWidth = _safeWidth();
      final safeHeight = _safeHeight();
      return widget.errorWidget ??
          SizedBox(
            width: safeWidth,
            height: safeHeight,
            child: const Icon(Icons.broken_image, color: Colors.grey, size: 48),
          );
    }

    final safeWidth = _safeWidth();
    final safeHeight = _safeHeight();
    final cacheWidth = _safeToInt(safeWidth);
    final cacheHeight = _safeToInt(safeHeight);

    return Image.memory(
      _imageBytes!,
      fit: widget.fit ?? BoxFit.cover,
      width: safeWidth,
      height: safeHeight,
      cacheWidth: cacheWidth,
      cacheHeight: cacheHeight,
    );
  }
}

