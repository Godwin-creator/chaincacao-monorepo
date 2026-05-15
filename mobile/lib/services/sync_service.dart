import 'package:flutter/material.dart';
import '../repositories/sync_queue_repository.dart';
import '../repositories/lot_repository.dart';
import '../repositories/parcel_repository.dart';
import 'connectivity_service.dart';

class SyncService extends ChangeNotifier {
  final SyncQueueRepository _syncQueueRepository;
  final LotRepository _lotRepository;
  final ParcelRepository _parcelRepository;
  final ConnectivityService _connectivityService;

  bool _isSyncing = false;
  bool get isSyncing => _isSyncing;

  SyncService(
    this._syncQueueRepository,
    this._lotRepository,
    this._parcelRepository,
    this._connectivityService,
  ) {
    _connectivityService.addListener(_onConnectivityChanged);
  }

  void _onConnectivityChanged() {
    if (_connectivityService.isOnline) {
      syncAll();
    }
  }

  Future<void> syncAll() async {
    if (_isSyncing || !_connectivityService.isOnline) return;

    _isSyncing = true;
    notifyListeners();

    try {
      final pendingItems = await _syncQueueRepository.getPendingItems();
      for (var item in pendingItems) {
        try {
          if (item['entity_type'] == 'lot') {
            await _lotRepository.syncWithServer(item['entity_local_id']);
          } else if (item['entity_type'] == 'parcel') {
            await _parcelRepository.syncWithServer(item['entity_local_id']);
          }
          await _syncQueueRepository.removeItem(item['id']);
        } catch (e) {
          await _syncQueueRepository.updateError(item['id'], e.toString());
        }
      }
    } finally {
      _isSyncing = false;
      notifyListeners();
    }
  }
}
