import 'package:flutter/material.dart';
import '../screens/splash_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/signup_screen.dart';
import '../screens/producer/home_screen.dart';
import '../screens/producer/new_lot_screen.dart';
import '../screens/producer/lot_details_screen.dart';
import '../screens/producer/parcels_screen.dart';
import '../screens/producer/new_parcel_screen.dart';
import '../screens/collector/home_screen.dart';
import '../screens/collector/transfer_screen.dart';
import '../screens/shared/qr_scanner_screen.dart';
import '../screens/shared/sync_status_screen.dart';

class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String signup = '/signup';
  static const String producerHome = '/producer/home';
  static const String newLot = '/producer/new-lot';
  static const String lotDetails = '/producer/lot-details';
  static const String parcels = '/producer/parcels';
  static const String newParcel = '/producer/new-parcel';
  static const String collectorHome = '/collector/home';
  static const String transfer = '/collector/transfer';
  static const String qrScanner = '/shared/qr-scanner';
  static const String syncStatus = '/shared/sync-status';

  static Map<String, WidgetBuilder> get routes => {
        splash: (context) => const SplashScreen(),
        login: (context) => const LoginScreen(),
        signup: (context) => const SignupScreen(),
        producerHome: (context) => const ProducerHomeScreen(),
        newLot: (context) => const NewLotScreen(),
        lotDetails: (context) => const LotDetailsScreen(),
        parcels: (context) => const ParcelsScreen(),
        newParcel: (context) => const NewParcelScreen(),
        collectorHome: (context) => const CollectorHomeScreen(),
        transfer: (context) => const TransferScreen(),
        qrScanner: (context) => const QRScannerScreen(),
        syncStatus: (context) => const SyncStatusScreen(),
      };
}
