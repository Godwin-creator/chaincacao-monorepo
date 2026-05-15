import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'migrations.dart';
import '../../config/constants.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB(AppConstants.dbName);
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: AppConstants.dbVersion,
      onCreate: _createDB,
      onUpgrade: _upgradeDB,
    );
  }

  Future _createDB(Database db, int version) async {
    await Migrations.runMigrations(db, 0, version);
  }

  Future _upgradeDB(Database db, int oldVersion, int newVersion) async {
    await Migrations.runMigrations(db, oldVersion, newVersion);
  }

  Future<void> close() async {
    final db = await instance.database;
    db.close();
  }
}
