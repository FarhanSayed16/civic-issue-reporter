// Optimized cached network image widget for better performance
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'dart:typed_data';
import '../services/cache_service.dart';
import 'dart:convert';

class CachedNetworkImage extends StatefulWidget {
  final String imageUrl;
  final BoxFit? fit;
  final Widget? placeholder;
  final Widget? errorWidget;
  final double? width;
  final double? height;
  final Duration cacheDuration;

  const CachedNetworkImage({
    Key? key,
    required this.imageUrl,
    this.fit,
    this.placeholder,
    this.errorWidget,
    this.width,
    this.height,
    this.cacheDuration = const Duration(days: 7),
  }) : super(key: key);

  @override
  State<CachedNetworkImage> createState() => _CachedNetworkImageState();
}

class _CachedNetworkImageState extends State<CachedNetworkImage> {
  Uint8List? _cachedImageBytes;
  bool _isLoading = true;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _loadImage();
  }

  Future<void> _loadImage() async {
    try {
      // Check cache first
      final cacheKey = 'image_${widget.imageUrl.hashCode}';
      final cachedData = await CacheService.getFromCache(cacheKey);
      
      if (cachedData != null && cachedData is String) {
        // Decode base64 cached image
        final imageBytes = base64Decode(cachedData);
        if (mounted) {
          setState(() {
            _cachedImageBytes = Uint8List.fromList(imageBytes);
            _isLoading = false;
          });
          return;
        }
      }

      // If not in cache, fetch from network
      if (widget.imageUrl.startsWith('data:')) {
        // Handle data URL
        final match = RegExp(r'data:image/[^;]+;base64,(.+)$').firstMatch(widget.imageUrl);
        if (match != null) {
          final base64Data = match.group(1);
          if (base64Data != null) {
            final imageBytes = base64Decode(base64Data);
            // Cache the image
            await CacheService.saveToCache(cacheKey, base64Encode(imageBytes), expiration: widget.cacheDuration);
            if (mounted) {
              setState(() {
                _cachedImageBytes = Uint8List.fromList(imageBytes);
                _isLoading = false;
              });
            }
            return;
          }
        }
      } else {
        // Fetch from network URL
        final dio = Dio();
        final response = await dio.get<List<int>>(
          widget.imageUrl,
          options: Options(responseType: ResponseType.bytes),
        );
        
        if (response.data != null) {
          final imageBytes = Uint8List.fromList(response.data!);
          // Cache the image
          await CacheService.saveToCache(cacheKey, base64Encode(imageBytes), expiration: widget.cacheDuration);
          if (mounted) {
            setState(() {
              _cachedImageBytes = imageBytes;
              _isLoading = false;
            });
          }
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

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return widget.placeholder ?? 
        SizedBox(
          width: widget.width,
          height: widget.height,
          child: const Center(child: CircularProgressIndicator()),
        );
    }

    if (_hasError || _cachedImageBytes == null) {
      return widget.errorWidget ?? 
        SizedBox(
          width: widget.width,
          height: widget.height,
          child: const Icon(Icons.broken_image, color: Colors.grey, size: 48),
        );
    }

    return Image.memory(
      _cachedImageBytes!,
      fit: widget.fit,
      width: widget.width,
      height: widget.height,
    );
  }
}

