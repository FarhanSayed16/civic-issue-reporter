// File: lib/features/auth/data/auth_repository.dart
import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../data/models/token.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/services/encryption_service.dart'; // ✅ Add encryption service

class AuthRepository {
  final _storageService = StorageService();
  final _encryptionService = EncryptionService();

  // 👇 LOGIN with encrypted password
  Future<Token> login(String phoneNumber, String password) async {
    try {
      // Encrypt password like web app
      final encryptedPassword =
          await _encryptionService.encryptJson({'secret': password});
      final packedPassword = _encryptionService.packPasswordB64(
          encryptedPassword['nonce']!, encryptedPassword['ciphertext']!);

      final response = await dio.post(
        '/auth/login',
        data: {
          'phone_number': phoneNumber, // Phone number (not encrypted)
          'password': packedPassword, // Encrypted password
        },
      );

      final token = Token.fromJson(response.data);

      // Save token securely
      await _storageService.saveToken(token.accessToken);

      return token;
    } on DioException catch (e) {
      print('Login Error: ${e.response?.data ?? e.message}');
      throw Exception(
          'Failed to login: ${e.response?.data['detail'] ?? e.message}');
    }
  }

  // 👇 REGISTER with encrypted password
  Future<void> register({
    required String fullName,
    required String phoneNumber,
    required String password,
  }) async {
    try {
      // Encrypt password and fingerprint check like web app
      final encPwd =
          await _encryptionService.encryptJson({'secret': password});
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
          'phone_number': phoneNumber, // Phone number (not encrypted)
          'password': packedPassword, // Encrypted password
          'fp_check': packedFp, // Encrypted fingerprint check
        },
      );
      // ✅ On success: user is created in backend.
    } on DioException catch (e) {
      print('Register Error: ${e.response?.data ?? e.message}');
      throw Exception(
        'Failed to register: ${e.response?.data['detail'] ?? e.message}',
      );
    }
  }
}
