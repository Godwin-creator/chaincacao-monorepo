import 'package:flutter/material.dart';
import '../models/lot.dart';
import '../models/transfer.dart';
import '../repositories/lot_repository.dart';

class LotService extends ChangeNotifier {
  final LotRepository _repository;
  List<Lot> _lots = [];
  bool _isLoading = false;
  String? _lastError;

  LotService(this._repository);

  List<Lot> get lots => _lots;
  bool get isLoading => _isLoading;
  String? get lastError => _lastError;

  /// Lots dont le statut est 'harvested' (en attente de collecte)
  List<Lot> get harvestedLots =>
      _lots.where((l) => l.status == LotStatus.harvested).toList();

  /// Lots non synchronisés avec le serveur
  List<Lot> get pendingLots =>
      _lots.where((l) => !l.isSyncedLocal && l.id == null).toList();

  int get pendingCount => pendingLots.length;

  Future<void> fetchLots() async {
    _isLoading = true;
    _lastError = null;
    notifyListeners();
    try {
      _lots = await _repository.getLots();
    } catch (e) {
      _lastError = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Crée un lot — offline first : sauvegarde SQLite immédiate,
  /// puis tente la sync Supabase si connecté.
  Future<Lot> createLot(Lot lot) async {
    _isLoading = true;
    _lastError = null;
    notifyListeners();
    try {
      final created = await _repository.createLot(lot);
      await fetchLots();
      return created;
    } catch (e) {
      _lastError = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Transfère un lot vers un autre acteur
  Future<Transfer> transferLot({
    required String lotId,
    required String toUserId,
    required LotStatus newStatus,
    Map<String, dynamic>? contextData,
  }) async {
    _isLoading = true;
    _lastError = null;
    notifyListeners();
    try {
      final transfer = await _repository.transferLot(
        lotId: lotId,
        toUserId: toUserId,
        newStatus: newStatus,
        contextData: contextData,
      );
      await fetchLots();
      return transfer;
    } catch (e) {
      _lastError = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Récupère un lot par son ID local ou serveur
  Lot? getLotById(String id) {
    try {
      return _lots.firstWhere((l) => l.id == id || l.localId == id);
    } catch (_) {
      return null;
    }
  }
}
