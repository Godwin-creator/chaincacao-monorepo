class Parcel {
  final String? id;
  final String? localId;
  final String? producerId;
  final String name;
  final double areaHectares;
  final Map<String, dynamic> geojson;
  final String? geojsonUrl;
  final String? geojsonHash;
  final bool isEudrCompliant;
  final DateTime? createdAt;

  Parcel({
    this.id,
    this.localId,
    this.producerId,
    required this.name,
    required this.areaHectares,
    required this.geojson,
    this.geojsonUrl,
    this.geojsonHash,
    this.isEudrCompliant = false,
    this.createdAt,
  });

  factory Parcel.fromJson(Map<String, dynamic> json) {
    return Parcel(
      id: json['id'],
      producerId: json['producer_id'],
      name: json['name'],
      areaHectares: (json['area_hectares'] as num).toDouble(),
      geojson: json['geojson'] ?? {},
      geojsonUrl: json['geojson_url'],
      geojsonHash: json['geojson_hash'],
      isEudrCompliant: json['is_eudr_compliant'] ?? false,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'producer_id': producerId,
      'name': name,
      'area_hectares': areaHectares,
      'geojson': geojson,
      'geojson_url': geojsonUrl,
      'geojson_hash': geojsonHash,
      'is_eudr_compliant': isEudrCompliant,
    };
  }

  factory Parcel.fromLocalMap(Map<String, dynamic> map) {
    return Parcel(
      localId: map['local_id'],
      id: map['server_id'],
      name: map['name'],
      areaHectares: map['area_hectares'],
      geojson: {}, // Usually parsed from geojson_data string
      createdAt: DateTime.parse(map['created_at']),
    );
  }

  Map<String, dynamic> toLocalMap() {
    return {
      'local_id': localId,
      'server_id': id,
      'name': name,
      'area_hectares': areaHectares,
      'geojson_data': '', // Needs to be serialized geojson
      'is_synced': id != null ? 1 : 0,
      'created_at': createdAt?.toIso8601String() ?? DateTime.now().toIso8601String(),
    };
  }
}
