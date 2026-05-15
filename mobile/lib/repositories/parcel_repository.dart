import '../models/parcel.dart';
import '../data/local/database_helper.dart';
import '../data/remote/api_client.dart';
import '../data/remote/supabase_client.dart';
import 'sync_queue_repository.dart';
import 'package:uuid/uuid.dart';

class ParcelRepository {
  final DatabaseHelper _dbHelper;
  final ApiClient _apiClient;
  final SyncQueueRepository _syncQueueRepository;

  ParcelRepository(this._dbHelper, this._apiClient, this._syncQueueRepository);

  Future<List<Parcel>> getParcels() async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> localMaps = await db.query('parcels_local');
    final localParcels = localMaps.map((m) => Parcel.fromLocalMap(m)).toList();

    try {
      final remoteData = await SupabaseClientManager.client
          .from('parcels')
          .select();
      final remoteParcels = (remoteData as List).map((m) => Parcel.fromJson(m)).toList();
      return [...localParcels.where((p) => p.id == null), ...remoteParcels];
    } catch (e) {
      return localParcels;
    }
  }

  Future<void> createParcel(Parcel parcel) async {
    final localId = const Uuid().v4();
    final db = await _dbHelper.database;
    
    final parcelToSave = Parcel(
      localId: localId,
      name: parcel.name,
      areaHectares: parcel.areaHectares,
      geojson: parcel.geojson,
      createdAt: DateTime.now(),
    );

    await db.insert('parcels_local', parcelToSave.toLocalMap());
    await _syncQueueRepository.addToQueue('parcel', localId, 'create', parcelToSave.toJson());
  }

  Future<void> syncWithServer(String localId) async {
    // Implementation similar to LotRepository
  }
}
