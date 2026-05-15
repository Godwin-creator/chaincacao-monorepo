import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../config/constants.dart';
import 'supabase_client.dart';

class ApiClient {
  final String baseUrl = AppConstants.apiBaseUrl;

  Future<Map<String, String>> _getHeaders() async {
    final session = SupabaseClientManager.client.auth.currentSession;
    final token = session?.accessToken;
    
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<http.Response> post(String endpoint, Map<String, dynamic> body) async {
    final headers = await _getHeaders();
    return await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    );
  }

  Future<http.Response> get(String endpoint) async {
    final headers = await _getHeaders();
    return await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );
  }
}
