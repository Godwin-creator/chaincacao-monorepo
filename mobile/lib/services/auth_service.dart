import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user.dart';
import '../data/remote/supabase_client.dart';

class AuthService extends ChangeNotifier {
  UserProfile? _currentUser;
  UserProfile? get currentUser => _currentUser;

  bool get isAuthenticated => SupabaseClientManager.client.auth.currentSession != null;

  Future<void> signIn(String email, String password) async {
    try {
      final response = await SupabaseClientManager.client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      
      if (response.user != null) {
        await fetchUserProfile();
      }
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> signUp(String email, String password, Map<String, dynamic> metadata) async {
    try {
      await SupabaseClientManager.client.auth.signUp(
        email: email,
        password: password,
        data: metadata,
      );
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> signOut() async {
    await SupabaseClientManager.client.auth.signOut();
    _currentUser = null;
    notifyListeners();
  }

  Future<void> fetchUserProfile() async {
    final user = SupabaseClientManager.client.auth.currentUser;
    if (user != null) {
      final data = await SupabaseClientManager.client
          .from('users')
          .select()
          .eq('id', user.id)
          .single();
      _currentUser = UserProfile.fromJson(data);
      notifyListeners();
    }
  }
}