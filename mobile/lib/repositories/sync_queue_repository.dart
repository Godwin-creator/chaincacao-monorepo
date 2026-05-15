import 'dart:convert';
import '../data/local/database_helper.dart';

class SyncQueueRepository {
  final DatabaseHelper _dbHelper;

  SyncQueueRepository(this._dbHelper);

  Future<void> addToQueue(String type, String localId, String action, Map<String, dynamic> payload) async {
    final db = await _dbHelper.database;
    await db.insert('sync_queue', {
      'entity_type': type,
      'entity_local_id': localId,
      'action': action,
      'payload': jsonEncode(payload),
      'created_at': DateTime.now().toIso8601String(),
    });
  }

  Future<List<Map<String, dynamic>>> getPendingItems() async {
    final db = await _dbHelper.database;
    return await db.query('sync_queue', orderBy: 'created_at ASC');
  }

  Future<void> removeItem(int id) async {
    final db = await _dbHelper.database;
    await db.delete('sync_queue', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> updateError(int id, String error) async {
    final db = await _dbHelper.database;
    await db.update('sync_queue', {
      'last_error': error,
      'attempts': 1, // Logic for incrementing attempts
    }, where: 'id = ?', whereArgs: [id]);
  }
}
