// File: lib/core/services/encryption_service.dart

import 'dart:convert';
import 'dart:typed_data';
import 'dart:math';
import 'package:pointycastle/export.dart';

class EncryptionService {
  /// Get the secure encryption key exactly like the web site
  String _getSecureEncryptionKey() {
    const chars = [
      46, 58, 65, 50, 15, 13, 75, 78, 65, 40, 44, 61, 46, 10, 60, 78, 44, 83,
      30, 60, 26, 87, 30, 43, 53, 78, 75, 40, 87, 15, 23, 75, 77, 1, 76, 79,
      53, 16, 11, 29, 41, 59, 11, 69
    ];
    const xorKey = 120;
    return chars.map((c) => String.fromCharCode(c ^ xorKey)).join('');
  }

  /// Get the secure AAD string exactly like the web site
  String _getSecureAAD() {
    const chars = [
      249, 249, 178, 214, 250, 211, 180, 244, 231, 211, 204, 242, 234, 194,
      228, 178, 238, 183, 219, 193, 182, 244, 190, 190
    ];
    const xorKey = 131;
    return chars.map((c) => String.fromCharCode(c ^ xorKey)).join('');
  }

  /// Convert base64 string to bytes
  Uint8List _base64ToBytes(String base64) {
    return base64Decode(base64);
  }

  /// Convert bytes to base64 string
  String _bytesToBase64(Uint8List bytes) {
    return base64Encode(bytes);
  }

  /// Generate SHA-256 hash of data
  Uint8List _sha256Bytes(Uint8List data) {
    final digest = SHA256Digest();
    return digest.process(data);
  }

  /// Get the encryption key exactly like the backend
  Future<Uint8List> _getCryptoKey() async {
    final encryptionKeyB64 = _getSecureEncryptionKey();
    const clientKeyFallback = 'set-a-strong-shared-key-here';

    Uint8List keyBytes;
    if (encryptionKeyB64.isNotEmpty) {
      keyBytes = _base64ToBytes(encryptionKeyB64);
    } else {
      keyBytes = _sha256Bytes(utf8.encode(clientKeyFallback));
    }

    if (keyBytes.length != 32) {
      throw Exception('Encryption key must be 32 bytes');
    }

    return keyBytes;
  }

  /// Generate random nonce (12 bytes for GCM)
  Uint8List _generateNonce() {
    final random = Random.secure();
    return Uint8List.fromList(
        List<int>.generate(12, (i) => random.nextInt(256)));
  }

  /// Encrypt JSON object using AES-GCM exactly like the backend
  Future<Map<String, String>> encryptJson(Map<String, dynamic> jsonObj) async {
    try {
      final keyBytes = await _getCryptoKey();
      final nonce = _generateNonce();
      final plaintext = utf8.encode(json.encode(jsonObj));
      final aad = utf8.encode(_getSecureAAD());

      // Create AES-GCM cipher
      final cipher = GCMBlockCipher(AESEngine());
      final params = AEADParameters(KeyParameter(keyBytes), 128, nonce, aad);
      cipher.init(true, params);

      // Encrypt
      final ciphertext = cipher.process(plaintext);

      return {
        'nonce': _bytesToBase64(nonce),
        'ciphertext': _bytesToBase64(ciphertext),
      };
    } catch (e) {
      throw Exception('Encryption failed: $e');
    }
  }

  /// Decrypt to JSON object
  Future<Map<String, dynamic>> decryptToJson(
      String nonceB64, String ciphertextB64) async {
    try {
      final keyBytes = await _getCryptoKey();
      final nonce = _base64ToBytes(nonceB64);
      final ciphertext = _base64ToBytes(ciphertextB64);
      final aad = utf8.encode(_getSecureAAD());

      // Create AES-GCM cipher
      final cipher = GCMBlockCipher(AESEngine());
      final params = AEADParameters(KeyParameter(keyBytes), 128, nonce, aad);
      cipher.init(false, params);

      // Decrypt
      final plaintext = cipher.process(ciphertext);
      final jsonString = utf8.decode(plaintext);

      return json.decode(jsonString);
    } catch (e) {
      throw Exception('Decryption failed: $e');
    }
  }

  /// Pack password for transmission exactly like the backend
  String packPasswordB64(String nonceB64, String ciphertextB64) {
    final nonce = _base64ToBytes(nonceB64);
    final cipher = _base64ToBytes(ciphertextB64);
    final packed = Uint8List(nonce.length + cipher.length);
    packed.setRange(0, nonce.length, nonce);
    packed.setRange(nonce.length, packed.length, cipher);
    return _bytesToBase64(packed);
  }

  /// Unpack password from transmission exactly like the backend
  Map<String, String> unpackPasswordB64(String packedB64) {
    final raw = _base64ToBytes(packedB64);
    final nonce = _bytesToBase64(raw.sublist(0, 12));
    final ciphertext = _bytesToBase64(raw.sublist(12));
    return {
      'nonce': nonce,
      'ciphertext': ciphertext,
    };
  }
}

