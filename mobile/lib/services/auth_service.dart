import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user.dart';
import '../data/remote/supabase_client.dart';

class AuthService extends ChangeNotifier {
  UserProfile? _currentUser;
  UserProfile? get currentUser => _currentUser;

  bool get isAuthenticated =>
      SupabaseClientManager.client.auth.currentSession != null;

  Future<void> signIn(String email, String password) async {
    final response = await SupabaseClientManager.client.auth.signInWithPassword(
      email: email,
      password: password,
    );

    if (response.user != null) {
      // fetchUserProfile peut échouer si la table users n'a pas d'entrée —
      // on attrape silencieusement pour ne pas bloquer la navigation.
      await fetchUserProfile();
    }
    notifyListeners();
  }

  Future<void> signUp(
      String email, String password, Map<String, dynamic> metadata) async {
    await SupabaseClientManager.client.auth.signUp(
      email: email,
      password: password,
      data: metadata,
    );
    notifyListeners();
  }

  Future<void> signOut() async {
    await SupabaseClientManager.client.auth.signOut();
    _currentUser = null;
    notifyListeners();
  }

  Future<void> fetchUserProfile() async {
    final user = SupabaseClientManager.client.auth.currentUser;
    if (user == null) return;

    try {
      final data = await SupabaseClientManager.client
          .from('users')
          .select()
          .eq('id', user.id)
          .single();
      _currentUser = UserProfile.fromJson(data);
      notifyListeners();
    } on PostgrestException catch (e) {
      // L'entrée utilisateur n'existe pas encore dans la table users
      // (compte auth créé mais pas encore de profil). On laisse _currentUser null.
      debugPrint('[AuthService] Profil utilisateur introuvable : ${e.message}');
    } catch (e) {
      debugPrint('[AuthService] Erreur fetchUserProfile : $e');
    }
  }
}
