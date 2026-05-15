import 'package:uuid/uuid.dart';
import '../models/lot.dart';
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
    // Combine local and remote lots
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> localMaps = await db.query('lots_local');
    final localLots = localMaps.map((m) => Lot.fromLocalMap(m)).toList();

    try {
      final remoteData = await SupabaseClientManager.client
          .from('lots')
          .select()
          .order('created_at', ascending: false);
      final remoteLots = (remoteData as List).map((m) => Lot.fromJson(m)).toList();
      
      // Basic merge: remote lots usually replace local ones if they have the same ID
      return [...localLots.where((l) => l.id == null), ...remoteLots];
    } catch (e) {
      return localLots;
    }
  }

  Future<void> createLot(Lot lot) async {
    final localId = const Uuid().v4();
    final db = await _dbHelper.database;
    
    final lotToSave = Lot(
      localId: localId,
      parcelId: lot.parcelId,
      producerId: lot.producerId,
      species: lot.species,
      weightGrams: lot.weightGrams,
      harvestDate: lot.harvestDate,
      status: lot.status,
      createdAt: DateTime.now(),
    );

    await db.insert('lots_local', lotToSave.toLocalMap());
    await _syncQueueRepository.addToQueue('lot', localId, 'create', lotToSave.toJson());
  }

  Future<void> syncWithServer(String localId) async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'lots_local',
      where: 'local_id = ?',
      whereArgs: [localId],
    );

    if (maps.isEmpty) return;
    final lot = Lot.fromLocalMap(maps.first);

    final response = await _apiClient.post('/lots/register', {
      'parcelId': lot.parcelId,
      'species': lot.species.name,
      'weightGrams': lot.weightGrams,
      'harvestDate': lot.harvestDate.toIso8601String().split('T')[0],
      'createdOffline': true,
      'offlineCreatedAt': lot.createdAt?.toIso8601String(),
    });

    if (response.statusCode == 201) {
      // Update local record with server ID
      // final data = jsonDecode(response.body);
      // await db.update('lots_local', {'server_id': data['lotId'], 'is_synced': 1}, ...);
    }
  }
}
