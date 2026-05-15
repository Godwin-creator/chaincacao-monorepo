import 'package:flutter/material.dart';
import '../models/lot.dart';
import '../repositories/lot_repository.dart';

class LotService extends ChangeNotifier {
  final LotRepository _repository;
  List<Lot> _lots = [];
  bool _isLoading = false;

  LotService(this._repository);

  List<Lot> get lots => _lots;
  bool get isLoading => _isLoading;

  Future<void> fetchLots() async {
    _isLoading = true;
    notifyListeners();
    try {
      _lots = await _repository.getLots();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createLot(Lot lot) async {
    await _repository.createLot(lot);
    await fetchLots();
  }
}
