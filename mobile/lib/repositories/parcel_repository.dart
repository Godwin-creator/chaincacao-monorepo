import 'dart:convert';
import 'package:uuid/uuid.dart';
import '../models/parcel.dart';
import '../data/local/database_helper.dart';
import '../data/remote/api_client.dart';
import '../data/remote/supabase_client.dart';
import 'sync_queue_repository.dart';

class ParcelRepository {
  final DatabaseHelper _dbHelper;
  final ApiClient _apiClient;
  final SyncQueueRepository _syncQueueRepository;

  ParcelRepository(this._dbHelper, this._apiClient, this._syncQueueRepository);

  Future<List<Parcel>> getParcels() async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> localMaps = await db.query(
      'parcels_local',
      orderBy: 'created_at DESC',
    );
    final localParcels = localMaps.map((m) => Parcel.fromLocalMap(m)).toList();

    try {
      final remoteData = await SupabaseClientManager.client
          .from('parcels')
          .select();
      final remoteParcels = (remoteData as List).map((m) => Parcel.fromJson(m)).toList();
      final unsyncedLocal = localParcels.where((p) => p.id == null).toList();
      return [...unsyncedLocal, ...remoteParcels];
    } catch (_) {
      return localParcels;
    }
  }

  /// Sauvegarde locale immédiate + ajout à la file de sync
  Future<Parcel> createParcel(Parcel parcel) async {
    final localId = const Uuid().v4();
    final db = await _dbHelper.database;
    final now = DateTime.now();
    final geojsonStr = jsonEncode(parcel.geojson);

    final localMap = {
      'local_id': localId,
      'server_id': null,
      'name': parcel.name,
      'area_hectares': parcel.areaHectares,
      'geojson_data': geojsonStr,
      'is_synced': 0,
      'created_at': now.toIso8601String(),
    };

    await db.insert('parcels_local', localMap);
    await _syncQueueRepository.addToQueue('parcel', localId, 'create', {
      'name': parcel.name,
      'areaHectares': parcel.areaHectares,
      'geojson': parcel.geojson,
    });

    // Tentative de sync immédiate
    try {
      await syncWithServer(localId);
    } catch (_) {}

    return Parcel(
      localId: localId,
      name: parcel.name,
      areaHectares: parcel.areaHectares,
      geojson: parcel.geojson,
      createdAt: now,
    );
  }

  Future<void> syncWithServer(String localId) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'parcels_local',
      where: 'local_id = ?',
      whereArgs: [localId],
    );
    if (maps.isEmpty) return;
    final map = maps.first;

    final geojson = map['geojson_data'] != null
        ? jsonDecode(map['geojson_data'] as String)
        : {};

    final response = await _apiClient.post('/parcels/register', {
      'name': map['name'],
      'areaHectares': map['area_hectares'],
      'geojson': geojson,
    });

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      await db.update(
        'parcels_local',
        {'server_id': data['parcelId'], 'is_synced': 1},
        where: 'local_id = ?',
        whereArgs: [localId],
      );
    }
  }
}
