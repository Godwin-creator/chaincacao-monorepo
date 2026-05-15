import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/routes.dart';
import 'config/theme.dart';
import 'services/auth_service.dart';
import 'services/lot_service.dart';
import 'services/parcel_service.dart';
import 'services/sync_service.dart';
import 'services/connectivity_service.dart';
import 'repositories/lot_repository.dart';
import 'repositories/parcel_repository.dart';
import 'repositories/sync_queue_repository.dart';
import 'data/local/database_helper.dart';
import 'data/remote/api_client.dart';

class ChainCacaoApp extends StatelessWidget {
  const ChainCacaoApp({super.key});

  @override
  Widget build(BuildContext context) {
    final dbHelper = DatabaseHelper.instance;
    final apiClient = ApiClient();
    final syncQueueRepo = SyncQueueRepository(dbHelper);
    final lotRepo = LotRepository(dbHelper, apiClient, syncQueueRepo);
    final parcelRepo = ParcelRepository(dbHelper, apiClient, syncQueueRepo);

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()..fetchUserProfile()),
        ChangeNotifierProvider(create: (_) => ConnectivityService()..checkInitialStatus()),
        ChangeNotifierProvider(create: (context) => LotService(lotRepo)),
        ChangeNotifierProvider(create: (context) => ParcelService(parcelRepo)),
        ChangeNotifierProxyProvider<ConnectivityService, SyncService>(
          create: (context) => SyncService(
            syncQueueRepo,
            lotRepo,
            parcelRepo,
            context.read<ConnectivityService>(),
          ),
          update: (context, connectivity, sync) => sync!,
        ),
      ],
      child: MaterialApp(
        title: 'ChainCacao',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        initialRoute: AppRoutes.login,
        routes: AppRoutes.routes,
      ),
    );
  }
}
