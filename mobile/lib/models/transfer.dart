import 'lot.dart';

class Transfer {
  final String? id;
  final String lotId;
  final String fromUserId;
  final String toUserId;
  final LotStatus newStatus;
  final DateTime transferDate;
  final String? blockchainTxHash;
  final Map<String, dynamic>? contextData;
  final String? contextHash;
  final bool isSyncedBlockchain;

  Transfer({
    this.id,
    required this.lotId,
    required this.fromUserId,
    required this.toUserId,
    required this.newStatus,
    required this.transferDate,
    this.blockchainTxHash,
    this.contextData,
    this.contextHash,
    this.isSyncedBlockchain = false,
  });

  factory Transfer.fromJson(Map<String, dynamic> json) {
    return Transfer(
      id: json['id'],
      lotId: json['lot_id'],
      fromUserId: json['from_user_id'],
      toUserId: json['to_user_id'],
      newStatus: LotStatus.values.firstWhere((e) => e.name == json['new_status']),
      transferDate: DateTime.parse(json['transfer_date']),
      blockchainTxHash: json['blockchain_tx_hash'],
      contextData: json['context_data'],
      contextHash: json['context_hash'],
      isSyncedBlockchain: json['is_synced_blockchain'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'lot_id': lotId,
      'from_user_id': fromUserId,
      'to_user_id': toUserId,
      'new_status': newStatus.name,
      'transfer_date': transferDate.toIso8601String(),
      'blockchain_tx_hash': blockchainTxHash,
      'context_data': contextData,
      'context_hash': contextHash,
      'is_synced_blockchain': isSyncedBlockchain,
    };
  }
}
