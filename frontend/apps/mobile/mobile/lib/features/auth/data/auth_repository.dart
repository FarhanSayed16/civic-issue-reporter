// File: lib/features/auth/data/auth_repository.dart
import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../data/models/token.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/services/encryption_service.dart';

class AuthRepository {
  final _storageService = StorageService();
  final _encryptionService = EncryptionService();

  // 👇 LOGIN
  Future<Token> login(String phoneNumber, String password) async {
    try {
      // Encrypt password like web site (phone number is NOT encrypted)
      final encryptedPassword =
          await _encryptionService.encryptJson({'secret': password});
      final packedPassword = _encryptionService.packPasswordB64(
          encryptedPassword['nonce']!, encryptedPassword['ciphertext']!);

      final response = await dio.post(
        '/auth/login',
        data: {
          'phone_number': phoneNumber, // NOT encrypted like web site
          'password': packedPassword,
        },
      );

      final token = Token.fromJson(response.data);

      // Save complete session with user data
      await _storageService.saveSession(
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        userData: {
          'phone_number': phoneNumber,
          'login_time': DateTime.now().toIso8601String(),
        },
      );

      return token;
    } on DioException catch (e) {
      throw Exception('Failed to login: ${e.message}');
    }
  }

  // 👇 REGISTER
  Future<void> register({
    required String fullName,
    required String phoneNumber,
    required String password,
  }) async {
    try {
      // Encrypt password and fingerprint check like web site (phone number is NOT encrypted)
      final encPwd = await _encryptionService.encryptJson({'secret': password});
      final packedPassword = _encryptionService.packPasswordB64(
          encPwd['nonce']!, encPwd['ciphertext']!);

      final encFp =
          await _encryptionService.encryptJson({'fp_check': 'SECURE_FP_CHECK'});
      final packedFp = _encryptionService.packPasswordB64(
          encFp['nonce']!, encFp['ciphertext']!);

      await dio.post(
        '/auth/register',
        data: {
          'full_name': fullName,
          'phone_number': phoneNumber, // NOT encrypted like web site
          'password': packedPassword,
          'fp_check': packedFp,
        },
      );
      // ✅ On success: user is created in backend.
      // You can redirect to login screen in the UI layer.
    } on DioException catch (e) {
      throw Exception(
        'Failed to register: ${e.response?.data['detail'] ?? e.message}',
      );
    }
  }

  // 👇 LOGOUT
  Future<void> logout() async {
    try {
      // Clear session data
      await _storageService.clearSession();
    } catch (e) {
      // Even if clearing fails, we should still proceed with logout
      print('Error during logout: $e');
    }
  }

  // 👇 CHECK SESSION
  Future<bool> hasValidSession() async {
    return await _storageService.hasValidSession();
  }

  // 👇 GET SESSION DATA
  Future<Map<String, dynamic>?> getSessionData() async {
    return await _storageService.getSession();
  }

  // 👇 GET USER PROFILE
  Future<Map<String, dynamic>> getUserProfile() async {
    try {
      final token = await _storageService.getToken();
      if (token == null) {
        throw Exception('No valid session found');
      }

      final response = await dio.get(
        '/users/me',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      return response.data;
    } on DioException catch (e) {
      throw Exception('Failed to get user profile: ${e.message}');
    }
  }

  // 👇 UPDATE USER PROFILE
  Future<void> updateProfile(Map<String, dynamic> profileData) async {
    try {
      final token = await _storageService.getToken();
      if (token == null) {
        throw Exception('No valid session found');
      }

      await dio.put(
        '/users/me',
        data: profileData,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
    } on DioException catch (e) {
      throw Exception('Failed to update profile: ${e.message}');
    }
  }
}
