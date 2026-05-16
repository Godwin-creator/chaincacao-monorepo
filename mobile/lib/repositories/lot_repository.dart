import 'dart:convert';
import 'package:uuid/uuid.dart';
import '../models/lot.dart';
import '../models/transfer.dart';
import '../data/local/database_helper.dart';
import '../data/remote/api_client.dart';
import '../data/remote/supabase_client.dart';
import 'sync_queue_repository.dart';

class LotRepository {
  final DatabaseHelper _dbHelper;
  final ApiClient _apiClient;
  final SyncQueueRepository _syncQueueRepository;

  LotRepository(this._dbHelper, this._apiClient, this._syncQueueRepository);

  Future<List<Lot>> getLots() async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> localMaps = await db.query(
      'lots_local',
      orderBy: 'created_at DESC',
    );
    final localLots = localMaps.map((m) => Lot.fromLocalMap(m)).toList();

    try {
      final remoteData = await SupabaseClientManager.client
          .from('lots')
          .select()
          .order('created_at', ascending: false);
      final remoteLots = (remoteData as List).map((m) => Lot.fromJson(m)).toList();
      // Garde uniquement les lots locaux non encore synchronisés
      final unsyncedLocal = localLots.where((l) => l.id == null).toList();
      return [...unsyncedLocal, ...remoteLots];
    } catch (_) {
      // Mode offline : on retourne uniquement les lots locaux
      return localLots;
    }
  }

  /// Sauvegarde locale immédiate + ajout à la file de sync
  Future<Lot> createLot(Lot lot) async {
    final localId = const Uuid().v4();
    final db = await _dbHelper.database;
    final now = DateTime.now();

    final lotToSave = Lot(
      localId: localId,
      parcelId: lot.parcelId,
      producerId: lot.producerId,
      species: lot.species,
      weightGrams: lot.weightGrams,
      harvestDate: lot.harvestDate,
      status: LotStatus.harvested,
      photoUrls: lot.photoUrls,
      photoHashes: lot.photoHashes,
      qualityData: lot.qualityData,
      isSyncedLocal: false,
      createdAt: now,
    );

    final localMap = {
      'local_id': localId,
      'server_id': null,
      'parcel_id': lot.parcelId,
      'species': lot.species.name,
      'weight_grams': lot.weightGrams,
      'harvest_date': lot.harvestDate.toIso8601String().split('T')[0],
      'photo_paths': jsonEncode(lot.photoUrls),
      'status': 'harvested',
      'is_synced': 0,
      'created_at': now.toIso8601String(),
      'sync_attempts': 0,
      'quality_data': jsonEncode(lot.qualityData ?? {}),
    };

    await db.insert('lots_local', localMap);
    await _syncQueueRepository.addToQueue('lot', localId, 'create', {
      'parcelId': lot.parcelId,
      'species': lot.species.name,
      'weightGrams': lot.weightGrams,
      'harvestDate': lot.harvestDate.toIso8601String().split('T')[0],
      'photoHashes': lot.photoHashes,
      'qualityData': lot.qualityData,
      'createdOffline': true,
      'offlineCreatedAt': now.toIso8601String(),
    });

    // Tentative de sync immédiate (sera silencieusement ignorée si offline)
    try {
      await syncWithServer(localId);
    } catch (_) {}

    return lotToSave;
  }

  Future<Transfer> transferLot({
    required String lotId,
    required String toUserId,
    required LotStatus newStatus,
    Map<String, dynamic>? contextData,
  }) async {
    // Mock transfer si offline ou si pas d'ID serveur
    final mockTransfer = Transfer(
      lotId: lotId,
      fromUserId: 'local',
      toUserId: toUserId,
      newStatus: newStatus,
      transferDate: DateTime.now(),
      blockchainTxHash: '0xMOCK_${DateTime.now().millisecondsSinceEpoch}',
      contextData: contextData,
      isSyncedBlockchain: false,
    );

    try {
      final response = await _apiClient.post('/lots/transfer', {
        'lotId': lotId,
        'toUserId': toUserId,
        'newStatus': newStatus.name,
        'contextData': contextData ?? {},
      });

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Transfer(
          id: data['transferId'],
          lotId: lotId,
          fromUserId: 'local',
          toUserId: toUserId,
          newStatus: newStatus,
          transferDate: DateTime.now(),
          blockchainTxHash: data['blockchainTxHash'],
          contextData: contextData,
          isSyncedBlockchain: true,
        );
      }
    } catch (_) {
      // Offline : on enregistre dans la file de sync
      await _syncQueueRepository.addToQueue('transfer', lotId, 'create', {
        'lotId': lotId,
        'toUserId': toUserId,
        'newStatus': newStatus.name,
        'contextData': contextData ?? {},
      });
    }

    return mockTransfer;
  }

  Future<void> syncWithServer(String localId) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'lots_local',
      where: 'local_id = ?',
      whereArgs: [localId],
    );
    if (maps.isEmpty) return;
    final map = maps.first;

    final response = await _apiClient.post('/lots/register', {
      'parcelId': map['parcel_id'],
      'species': map['species'],
      'weightGrams': map['weight_grams'],
      'harvestDate': map['harvest_date'],
      'qualityData': map['quality_data'] != null
          ? jsonDecode(map['quality_data'] as String)
          : null,
      'createdOffline': true,
      'offlineCreatedAt': map['created_at'],
    });

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      await db.update(
        'lots_local',
        {'server_id': data['lotId'], 'is_synced': 1},
        where: 'local_id = ?',
        whereArgs: [localId],
      );
    }
  }
}
