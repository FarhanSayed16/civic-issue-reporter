// File: frontend/apps/mobile/mobile/lib/core/services/reverse_geocoding_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;

class ReverseGeocodingService {
  static const String _nominatimUrl =
      'https://nominatim.openstreetmap.org/reverse';
  static const String _geocodeUrl = 'https://geocode.maps.co/reverse';

  /// Reverse geocode coordinates to address using the same logic as web site
  static Future<AddressData?> reverseGeocode(double lat, double lng) async {
    // Try Nominatim first (same as web site)
    try {
      final url1 =
          '$_nominatimUrl?format=jsonv2&lat=${lat.toString()}&lon=${lng.toString()}&zoom=18&addressdetails=1';
      final response1 = await http.get(
        Uri.parse(url1),
        headers: {'Accept': 'application/json'},
      );

      if (response1.statusCode == 200) {
        final data1 = json.decode(response1.body);
        if (data1 != null && data1['address'] != null) {
          return _buildAddress(data1['address'], data1['display_name']);
        }
      }
    } catch (e) {
      // Continue to next service
    }

    // Try geocode.maps.co as fallback (same as web site)
    try {
      final url2 = '$_geocodeUrl?lat=${lat.toString()}&lon=${lng.toString()}';
      final response2 = await http.get(
        Uri.parse(url2),
        headers: {'Accept': 'application/json'},
      );

      if (response2.statusCode == 200) {
        final data2 = json.decode(response2.body);
        final address = data2['address'] ?? {};
        return _buildAddress(address, data2['display_name']);
      }
    } catch (e) {
      // Return null if both services fail
    }

    return null;
  }

  /// Build address data from geocoding response (same logic as web site)
  static AddressData _buildAddress(
      Map<String, dynamic> address, String displayName) {
    final house = address['house_number'] ?? '';
    final road = address['road'] ??
        address['street'] ??
        address['residential'] ??
        address['pedestrian'] ??
        '';
    final neighbourhood = address['neighbourhood'] ??
        address['suburb'] ??
        address['locality'] ??
        '';
    final city = address['city'] ??
        address['town'] ??
        address['village'] ??
        address['county'] ??
        '';
    final state = address['state'] ?? '';
    final poi = address['public_building'] ??
        address['school'] ??
        address['hospital'] ??
        address['shop'] ??
        address['poi'] ??
        '';

    // Build address components (same logic as web site)
    final line1Parts = [house, road].where((part) => part.isNotEmpty).toList();
    final line1 =
        line1Parts.isNotEmpty ? line1Parts.join(' ').trim() : displayName;

    final line2Parts =
        [neighbourhood, city, state].where((part) => part.isNotEmpty).toList();
    final line2 = line2Parts.join(', ');

    final street = road;
    final landmark = poi.isNotEmpty ? poi : neighbourhood;
    final pincode = address['postcode'] ?? '';

    return AddressData(
      line1: line1,
      line2: line2,
      street: street,
      landmark: landmark,
      pincode: pincode,
    );
  }
}

class AddressData {
  final String line1;
  final String line2;
  final String street;
  final String landmark;
  final String pincode;

  AddressData({
    required this.line1,
    required this.line2,
    required this.street,
    required this.landmark,
    required this.pincode,
  });
}
