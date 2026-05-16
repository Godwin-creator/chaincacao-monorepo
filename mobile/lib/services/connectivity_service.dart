import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';

class ConnectivityService extends ChangeNotifier {
  bool _isOnline = true;
  bool get isOnline => _isOnline;

  ConnectivityService() {
    Connectivity().onConnectivityChanged.listen((List<ConnectivityResult> results) {
      _isOnline = results.isNotEmpty && results.first != ConnectivityResult.none;
      notifyListeners();
    });
  }

  Future<void> checkInitialStatus() async {
    final results = await Connectivity().checkConnectivity();
    _isOnline = results.isNotEmpty && results.first != ConnectivityResult.none;
    notifyListeners();
  }
}
