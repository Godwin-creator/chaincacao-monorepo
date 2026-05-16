enum LotStatus { harvested, collected, processed, exported, verified }

enum SpeciesType { cacao, robusta_coffee, arabica_coffee }

class Lot {
  final String? id; // UUID from Supabase
  final String? localId; // UUID generated locally
  final int? blockchainTokenId;
  final String? blockchainTxHash;
  final String parcelId;
  final String producerId;
  final String? currentOwnerId;
  final SpeciesType species;
  final int weightGrams;
  final DateTime harvestDate;
  final LotStatus status;
  final List<String> photoUrls;
  final List<String> photoHashes;
  final Map<String, dynamic>? qualityData;
  final bool isSyncedBlockchain;
  final bool isSyncedLocal;
  final DateTime? createdAt;

  Lot({
    this.id,
    this.localId,
    this.blockchainTokenId,
    this.blockchainTxHash,
    required this.parcelId,
    required this.producerId,
    this.currentOwnerId,
    required this.species,
    required this.weightGrams,
    required this.harvestDate,
    this.status = LotStatus.harvested,
    this.photoUrls = const [],
    this.photoHashes = const [],
    this.qualityData,
    this.isSyncedBlockchain = false,
    this.isSyncedLocal = false,
    this.createdAt,
  });

  factory Lot.fromJson(Map<String, dynamic> json) {
    return Lot(
      id: json['id'],
      blockchainTokenId: json['blockchain_token_id'],
      blockchainTxHash: json['blockchain_tx_hash'],
      parcelId: json['parcel_id'],
      producerId: json['producer_id'],
      currentOwnerId: json['current_owner_id'],
      species: SpeciesType.values.firstWhere((e) => e.name == json['species']),
      weightGrams: json['weight_grams'],
      harvestDate: DateTime.parse(json['harvest_date']),
      status: LotStatus.values.firstWhere((e) => e.name == json['status']),
      photoUrls: List<String>.from(json['photo_urls'] ?? []),
      photoHashes: List<String>.from(json['photo_hashes'] ?? []),
      qualityData: json['quality_data'],
      isSyncedBlockchain: json['is_synced_blockchain'] ?? false,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'blockchain_token_id': blockchainTokenId,
      'blockchain_tx_hash': blockchainTxHash,
      'parcel_id': parcelId,
      'producer_id': producerId,
      'current_owner_id': currentOwnerId,
      'species': species.name,
      'weight_grams': weightGrams,
      'harvest_date': harvestDate.toIso8601String().split('T')[0],
      'status': status.name,
      'photo_urls': photoUrls,
      'photo_hashes': photoHashes,
      'quality_data': qualityData,
      'is_synced_blockchain': isSyncedBlockchain,
    };
  }

  factory Lot.fromLocalMap(Map<String, dynamic> map) {
    return Lot(
      localId: map['local_id'],
      id: map['server_id'],
      parcelId: map['parcel_id'],
      producerId: '', // Need to handle producerId in local storage or get from user service
      species: SpeciesType.values.firstWhere((e) => e.name == map['species']),
      weightGrams: map['weight_grams'],
      harvestDate: DateTime.parse(map['harvest_date']),
      status: LotStatus.values.firstWhere((e) => e.name == map['status']),
      isSyncedLocal: map['is_synced'] == 1,
      createdAt: DateTime.parse(map['created_at']),
    );
  }

  Map<String, dynamic> toLocalMap() {
    return {
      'local_id': localId,
      'server_id': id,
      'parcel_id': parcelId,
      'species': species.name,
      'weight_grams': weightGrams,
      'harvest_date': harvestDate.toIso8601String().split('T')[0],
      'status': status.name,
      'is_synced': isSyncedLocal ? 1 : 0,
      'created_at': createdAt?.toIso8601String() ?? DateTime.now().toIso8601String(),
    };
  }
}
