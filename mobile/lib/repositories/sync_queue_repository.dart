import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import '../data/local/database_helper.dart';

class SyncQueueRepository {
  final DatabaseHelper _dbHelper;

  SyncQueueRepository(this._dbHelper);

  Future<void> addToQueue(
    String type,
    String localId,
    String action,
    Map<String, dynamic> payload,
  ) async {
    final db = await _dbHelper.database;
    await db.insert('sync_queue', {
      'entity_type': type,
      'entity_local_id': localId,
      'action': action,
      'payload': jsonEncode(payload),
      'created_at': DateTime.now().toIso8601String(),
      'attempts': 0,
    });
  }

  Future<List<Map<String, dynamic>>> getPendingItems() async {
    final db = await _dbHelper.database;
    return await db.query('sync_queue', orderBy: 'created_at ASC');
  }

  Future<int> getPendingCount() async {
    final db = await _dbHelper.database;
    final result = await db.rawQuery('SELECT COUNT(*) as count FROM sync_queue');
    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<void> removeItem(int id) async {
    final db = await _dbHelper.database;
    await db.delete('sync_queue', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> incrementAttempts(int id, String error) async {
    final db = await _dbHelper.database;
    // Utilise un raw UPDATE pour incrémenter le compteur atomiquement
    await db.rawUpdate(
      'UPDATE sync_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?',
      [error, id],
    );
  }

  Future<void> updateError(int id, String error) async {
    await incrementAttempts(id, error);
  }

  Future<void> clearSynced() async {
    final db = await _dbHelper.database;
    // Supprime les éléments dont les tentatives ont trop échoué (> 5)
    await db.delete('sync_queue', where: 'attempts > ?', whereArgs: [5]);
  }
}
