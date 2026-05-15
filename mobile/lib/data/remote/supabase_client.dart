import 'package:supabase_flutter/supabase_flutter.dart';
import '../../config/constants.dart';

class SupabaseClientManager {
  static Future<void> init() async {
    await Supabase.initialize(
      url: AppConstants.supabaseUrl,
      anonKey: AppConstants.supabaseAnonKey,
    );
  }

  static SupabaseClient get client => Supabase.instance.client;
}
