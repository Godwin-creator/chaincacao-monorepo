import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_map/flutter_map.dart';
import '../../widgets/primary_button.dart';
import '../../services/gps_service.dart';
import '../../config/theme.dart';

class NewParcelScreen extends StatefulWidget {
  const NewParcelScreen({super.key});

  @override
  State<NewParcelScreen> createState() => _NewParcelScreenState();
}

class _NewParcelScreenState extends State<NewParcelScreen> {
  final List<LatLng> _points = [];
  final _nameController = TextEditingController();
  final _gpsService = GpsService();
  bool _isRecording = false;

  void _addPoint() async {
    final pos = await _gpsService.getCurrentPosition();
    setState(() {
      _points.add(LatLng(pos.latitude, pos.longitude));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nouvelle Parcelle')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Nom de la parcelle'),
            ),
          ),
          Expanded(
            child: FlutterMap(
              options: const MapOptions(
                initialCenter: LatLng(7.123, 0.901),
                initialZoom: 15.0,
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.chaincacao.app',
                ),
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: _points,
                      color: AppTheme.cacaoGreen,
                      strokeWidth: 4,
                    ),
                  ],
                ),
                MarkerLayer(
                  markers: _points.map((p) => Marker(
                    point: p,
                    child: const Icon(Icons.location_on, color: AppTheme.error, size: 20),
                  )).toList(),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10)],
            ),
            child: Row(
              children: [
                Expanded(
                  child: PrimaryButton(
                    text: _isRecording ? 'Marquer Point' : 'Démarrer Capture',
                    onPressed: () {
                      if (!_isRecording) {
                        setState(() => _isRecording = true);
                      }
                      _addPoint();
                    },
                    backgroundColor: _isRecording ? AppTheme.harvestGold : AppTheme.cacaoGreen,
                  ),
                ),
                if (_isRecording) ...[
                  const SizedBox(width: 12),
                  IconButton(
                    icon: const Icon(Icons.check_circle, color: AppTheme.success, size: 48),
                    onPressed: () {
                      // Save logic
                    },
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
