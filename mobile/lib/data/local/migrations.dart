import 'package:sqflite/sqflite.dart';

class Migrations {
  static Future<void> runMigrations(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 1) {
      await _createV1(db);
    }
  }

  static Future<void> _createV1(Database db) async {
    // Lots créés offline en attente de sync
    await db.execute('''
      CREATE TABLE lots_local (
        local_id          TEXT PRIMARY KEY,
        server_id         TEXT,
        parcel_id         TEXT,
        species           TEXT,
        weight_grams      INTEGER,
        harvest_date      TEXT,
        photo_paths       TEXT,
        status            TEXT DEFAULT 'harvested',
        is_synced         INTEGER DEFAULT 0,
        created_at        TEXT,
        sync_attempts     INTEGER DEFAULT 0
      )
    ''');

    // Parcelles créées offline
    await db.execute('''
      CREATE TABLE parcels_local (
        local_id          TEXT PRIMARY KEY,
        server_id         TEXT,
        name              TEXT,
        area_hectares     REAL,
        geojson_data      TEXT,
        is_synced         INTEGER DEFAULT 0,
        created_at        TEXT
      )
    ''');

    // File d'attente de synchronisation
    await db.execute('''
      CREATE TABLE sync_queue (
        id                INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type       TEXT,
        entity_local_id   TEXT,
        action            TEXT,
        payload           TEXT,
        created_at        TEXT,
        attempts          INTEGER DEFAULT 0,
        last_error        TEXT
      )
    ''');
  }
}
