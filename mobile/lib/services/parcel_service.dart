import 'package:flutter/material.dart';
import '../models/parcel.dart';
import '../repositories/parcel_repository.dart';

class ParcelService extends ChangeNotifier {
  final ParcelRepository _repository;
  List<Parcel> _parcels = [];
  bool _isLoading = false;

  ParcelService(this._repository);

  List<Parcel> get parcels => _parcels;
  bool get isLoading => _isLoading;

  Future<void> fetchParcels() async {
    _isLoading = true;
    notifyListeners();
    try {
      _parcels = await _repository.getParcels();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createParcel(Parcel parcel) async {
    await _repository.createParcel(parcel);
    await fetchParcels();
  }
}
