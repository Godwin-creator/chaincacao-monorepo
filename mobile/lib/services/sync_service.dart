import 'package:flutter/material.dart';
import '../repositories/sync_queue_repository.dart';
import '../repositories/lot_repository.dart';
import '../repositories/parcel_repository.dart';
import 'connectivity_service.dart';

enum SyncState { idle, syncing, success, error }

class SyncService extends ChangeNotifier {
  final SyncQueueRepository _syncQueueRepository;
  final LotRepository _lotRepository;
  final ParcelRepository _parcelRepository;
  final ConnectivityService _connectivityService;

  bool _isSyncing = false;
  SyncState _syncState = SyncState.idle;
  int _pendingCount = 0;
  String? _lastSyncError;
  DateTime? _lastSyncTime;

  bool get isSyncing => _isSyncing;
  SyncState get syncState => _syncState;
  int get pendingCount => _pendingCount;
  String? get lastSyncError => _lastSyncError;
  DateTime? get lastSyncTime => _lastSyncTime;

  SyncService(
    this._syncQueueRepository,
    this._lotRepository,
    this._parcelRepository,
    this._connectivityService,
  ) {
    _connectivityService.addListener(_onConnectivityChanged);
    _refreshPendingCount();
  }

  void _onConnectivityChanged() {
    if (_connectivityService.isOnline) {
      syncAll();
    } else {
      _refreshPendingCount();
    }
  }

  Future<void> _refreshPendingCount() async {
    _pendingCount = await _syncQueueRepository.getPendingCount();
    notifyListeners();
  }

  Future<void> syncAll() async {
    if (_isSyncing || !_connectivityService.isOnline) return;

    _isSyncing = true;
    _syncState = SyncState.syncing;
    _lastSyncError = null;
    notifyListeners();

    bool hasError = false;

    try {
      final pendingItems = await _syncQueueRepository.getPendingItems();
      for (final item in pendingItems) {
        try {
          if (item['entity_type'] == 'lot') {
            await _lotRepository.syncWithServer(item['entity_local_id'] as String);
          } else if (item['entity_type'] == 'parcel') {
            await _parcelRepository.syncWithServer(item['entity_local_id'] as String);
          }
          await _syncQueueRepository.removeItem(item['id'] as int);
        } catch (e) {
          hasError = true;
          await _syncQueueRepository.updateError(item['id'] as int, e.toString());
        }
      }
      _lastSyncTime = DateTime.now();
      _syncState = hasError ? SyncState.error : SyncState.success;
    } catch (e) {
      _lastSyncError = e.toString();
      _syncState = SyncState.error;
    } finally {
      _isSyncing = false;
      await _refreshPendingCount();
      notifyListeners();
    }
  }
}
