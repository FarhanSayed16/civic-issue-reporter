// File: frontend/apps/mobile/mobile/lib/core/services/encryption_test.dart

import 'dart:convert';
import 'encryption_service.dart';

class EncryptionTest {
  static Future<void> testEncryptionDecryption() async {
    final encryptionService = EncryptionService();
    
    print('=== Encryption Test ===');
    
    try {
      // Test data
      final testData = {'secret': 'testpassword123'};
      print('Original data: $testData');
      
      // Encrypt
      final encrypted = await encryptionService.encryptJson(testData);
      print('Encrypted nonce: ${encrypted['nonce']}');
      print('Encrypted ciphertext: ${encrypted['ciphertext']}');
      
      // Pack
      final packed = encryptionService.packPasswordB64(
        encrypted['nonce']!, 
        encrypted['ciphertext']!
      );
      print('Packed password: $packed');
      
      // Unpack
      final unpacked = encryptionService.unpackPasswordB64(packed);
      print('Unpacked nonce: ${unpacked['nonce']}');
      print('Unpacked ciphertext: ${unpacked['ciphertext']}');
      
      // Decrypt
      final decrypted = await encryptionService.decryptToJson(
        unpacked['nonce']!, 
        unpacked['ciphertext']!
      );
      print('Decrypted data: $decrypted');
      
      // Verify
      if (decrypted['secret'] == testData['secret']) {
        print('✅ Encryption/Decryption test PASSED');
      } else {
        print('❌ Encryption/Decryption test FAILED');
        print('Expected: ${testData['secret']}');
        print('Got: ${decrypted['secret']}');
      }
      
    } catch (e) {
      print('❌ Encryption test failed with error: $e');
    }
  }
}
