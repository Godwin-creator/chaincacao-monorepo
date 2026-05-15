import 'dart:convert';
import 'package:crypto/crypto.dart';

class HashHelper {
  static String calculateHash(String input) {
    final bytes = utf8.encode(input);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  static String calculateFileHash(List<int> bytes) {
    final digest = sha256.convert(bytes);
    return digest.toString();
  }
}
