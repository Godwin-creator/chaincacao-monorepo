import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'app.dart';
import 'data/remote/supabase_client.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Portrait uniquement pour usage terrain
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
  ]);

  // Initialise les données de locale fr AVANT runApp
  // Nécessaire pour DateFormat('dd MMMM yyyy', 'fr') dans new_lot_screen
  await initializeDateFormatting('fr', null);

  // Initialise Supabase
  await SupabaseClientManager.init();

  runApp(const ChainCacaoApp());
}
