import 'package:flutter/material.dart';
import '../models/parcel.dart';
import '../repositories/parcel_repository.dart';

class ParcelService extends ChangeNotifier {
  final ParcelRepository _repository;
  List<Parcel> _parcels = [];
  bool _isLoading = false;
  String? _lastError;

  ParcelService(this._repository);

  List<Parcel> get parcels => _parcels;
  bool get isLoading => _isLoading;
  String? get lastError => _lastError;

  Future<void> fetchParcels() async {
    _isLoading = true;
    _lastError = null;
    notifyListeners();
    try {
      _parcels = await _repository.getParcels();
    } catch (e) {
      _lastError = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Parcel> createParcel(Parcel parcel) async {
    _isLoading = true;
    _lastError = null;
    notifyListeners();
    try {
      final created = await _repository.createParcel(parcel);
      await fetchParcels();
      return created;
    } catch (e) {
      _lastError = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
