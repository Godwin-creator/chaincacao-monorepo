import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../models/parcel.dart';
import '../../services/parcel_service.dart';
import '../../services/auth_service.dart';
import '../../services/gps_service.dart';
import '../../utils/geojson_helper.dart';
import '../../widgets/offline_banner.dart';
import '../../widgets/primary_button.dart';

class NewParcelScreen extends StatefulWidget {
  const NewParcelScreen({super.key});

  @override
  State<NewParcelScreen> createState() => _NewParcelScreenState();
}

class _NewParcelScreenState extends State<NewParcelScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _areaController = TextEditingController();
  final _gpsService = GpsService();
  final _mapController = MapController();

  Position? _centerPosition;
  bool _isLocating = false;
  bool _isSubmitting = false;
  bool _useAutoArea = true;

  // Pour la capture de polygone multi-points
  final List<LatLng> _polygonPoints = [];
  bool _isCapturingPolygon = false;

  @override
  void dispose() {
    _nameController.dispose();
    _areaController.dispose();
    super.dispose();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Capture du point GPS central
  // ─────────────────────────────────────────────────────────────────────────

  Future<void> _captureCenter() async {
    setState(() {
      _isLocating = true;
      _polygonPoints.clear();
    });
    try {
      final pos = await _gpsService.getCurrentPosition();
      setState(() {
        _centerPosition = pos;
        _isLocating = false;
      });
      // Déplace la carte sur la position capturée
      _mapController.move(
        LatLng(pos.latitude, pos.longitude),
        16.0,
      );
      // Génère un polygone carré autour du point central (MVP simplifié)
      _generateSquarePolygon(pos);
    } catch (e) {
      setState(() => _isLocating = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur GPS : $e'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  /// Génère un polygone carré autour du point GPS.
  /// `radiusMeters` est calculé depuis la superficie saisie ou depuis un défaut de 50 m.
  void _generateSquarePolygon(Position center) {
    double areaHa = double.tryParse(_areaController.text.replaceAll(',', '.')) ?? 0;
    // Si pas de superficie saisie, on suppose un carré de 50 m de côté
    double halfSideMeters = areaHa > 0
        ? math.sqrt(areaHa * 10000) / 2
        : 50.0;

    // Conversion mètres → degrés (approximation locale)
    const metersPerDegLat = 111320.0;
    final metersPerDegLng =
        111320.0 * math.cos(center.latitude * math.pi / 180);

    final dLat = halfSideMeters / metersPerDegLat;
    final dLng = halfSideMeters / metersPerDegLng;

    final lat = center.latitude;
    final lng = center.longitude;

    setState(() {
      _polygonPoints.clear();
      _polygonPoints.addAll([
        LatLng(lat - dLat, lng - dLng), // SW
        LatLng(lat + dLat, lng - dLng), // NW
        LatLng(lat + dLat, lng + dLng), // NE
        LatLng(lat - dLat, lng + dLng), // SE
      ]);

      // Calcul automatique de la superficie si pas encore saisie
      if (_useAutoArea && areaHa == 0) {
        final areaSqM = (2 * halfSideMeters) * (2 * halfSideMeters);
        final computedHa = areaSqM / 10000;
        _areaController.text = computedHa.toStringAsFixed(4);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Soumission
  // ─────────────────────────────────────────────────────────────────────────

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_centerPosition == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez d\'abord capturer votre position GPS.'),
          backgroundColor: AppTheme.warning,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final authService = context.read<AuthService>();
      final parcelService = context.read<ParcelService>();

      // Génère le GeoJSON depuis les points du polygone
      final geojson = GeoJsonHelper.pointsToPolygon(_polygonPoints);
      final areaHa = double.parse(_areaController.text.replaceAll(',', '.'));

      final parcel = Parcel(
        producerId: authService.currentUser?.id,
        name: _nameController.text.trim(),
        areaHectares: areaHa,
        geojson: geojson,
      );

      final created = await parcelService.createParcel(parcel);
      if (mounted) {
        _showSuccessDialog(created.id ?? created.localId ?? '');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur : $e'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showSuccessDialog(String parcelId) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        icon: const Icon(Icons.map, color: AppTheme.cacaoGreen, size: 56),
        title: const Text(
          'Parcelle enregistrée !',
          textAlign: TextAlign.center,
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'La parcelle a été enregistrée et sera synchronisée avec les serveurs.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              'ID : $parcelId',
              style: GoogleFonts.jetBrainsMono(
                fontSize: 11,
                color: AppTheme.cocoaBrown,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.cacaoGreen,
              ),
              onPressed: () {
                Navigator.of(ctx).pop();
                Navigator.of(context).pop();
              },
              child: const Text('Retour aux parcelles'),
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Build
  // ─────────────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        title: const Text('Nouvelle Parcelle'),
        backgroundColor: AppTheme.cacaoGreenDark,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          const OfflineBanner(),
          Expanded(
            child: Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  // ── Nom de la parcelle ──────────────────────────────────
                  const _SectionTitle(title: '🗺️ Nom de la parcelle'),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _nameController,
                    textCapitalization: TextCapitalization.words,
                    decoration: InputDecoration(
                      hintText: 'ex : Parcelle Nord Wawa',
                      prefixIcon: const Icon(Icons.label_outline,
                          color: AppTheme.cacaoGreen),
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12)),
                      filled: true,
                      fillColor: AppTheme.cream,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 14),
                    ),
                    validator: (v) =>
                        (v == null || v.trim().isEmpty) ? 'Requis' : null,
                  ),

                  const SizedBox(height: 20),

                  // ── Superficie ─────────────────────────────────────────
                  const _SectionTitle(title: '📐 Superficie estimée'),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _areaController,
                          keyboardType: const TextInputType.numberWithOptions(
                              decimal: true),
                          inputFormatters: [
                            FilteringTextInputFormatter.allow(
                                RegExp(r'[0-9,.]')),
                          ],
                          decoration: InputDecoration(
                            hintText: 'ex : 2.5',
                            suffixText: 'ha',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12)),
                            filled: true,
                            fillColor: AppTheme.cream,
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 14),
                          ),
                          onChanged: (_) {
                            // Si l'utilisateur saisit manuellement, désactive le calcul auto
                            setState(() => _useAutoArea = false);
                          },
                          validator: (v) {
                            if (v == null || v.isEmpty) return 'Requis';
                            final n = double.tryParse(v.replaceAll(',', '.'));
                            if (n == null || n <= 0) return 'Valeur invalide';
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Tooltip(
                        message: 'La superficie sera calculée automatiquement depuis le GPS',
                        child: IconButton(
                          onPressed: () =>
                              setState(() => _useAutoArea = true),
                          icon: Icon(
                            Icons.auto_fix_high,
                            color: _useAutoArea
                                ? AppTheme.cacaoGreen
                                : AppTheme.grayMedium,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // ── GPS ────────────────────────────────────────────────
                  const _SectionTitle(title: '📡 Position GPS'),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 52,
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _isLocating ? null : _captureCenter,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.blockchainCyanDark,
                        side: const BorderSide(
                            color: AppTheme.blockchainCyanDark),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: _isLocating
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation(
                                    AppTheme.blockchainCyanDark),
                              ),
                            )
                          : const Icon(Icons.my_location),
                      label: Text(
                        _isLocating
                            ? 'Localisation…'
                            : _centerPosition != null
                                ? 'Actualiser la position'
                                : 'Capturer la position GPS',
                        style: const TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  if (_centerPosition != null) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.blockchainCyanLight,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppTheme.blockchainCyan),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Lat : ${_centerPosition!.latitude.toStringAsFixed(6)}',
                            style: GoogleFonts.jetBrainsMono(
                                fontSize: 13, color: AppTheme.grayText),
                          ),
                          Text(
                            'Lng : ${_centerPosition!.longitude.toStringAsFixed(6)}',
                            style: GoogleFonts.jetBrainsMono(
                                fontSize: 13, color: AppTheme.grayText),
                          ),
                          Text(
                            'Précision : ±${_centerPosition!.accuracy.toStringAsFixed(1)} m',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: _centerPosition!.accuracy > 10
                                  ? AppTheme.warning
                                  : AppTheme.success,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 20),

                  // ── Carte de prévisualisation ───────────────────────────
                  if (_centerPosition != null) ...[
                    const _SectionTitle(title: '🗺️ Aperçu de la parcelle'),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: SizedBox(
                        height: 220,
                        child: FlutterMap(
                          mapController: _mapController,
                          options: MapOptions(
                            initialCenter: LatLng(
                              _centerPosition!.latitude,
                              _centerPosition!.longitude,
                            ),
                            initialZoom: 16.0,
                          ),
                          children: [
                            TileLayer(
                              urlTemplate:
                                  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                              userAgentPackageName: 'com.chaincacao.app',
                            ),
                            if (_polygonPoints.isNotEmpty) ...[
                              PolygonLayer(
                                polygons: [
                                  Polygon(
                                    points: [
                                      ..._polygonPoints,
                                      _polygonPoints.first,
                                    ],
                                    color: AppTheme.cacaoGreen.withOpacity(0.25),
                                    borderColor: AppTheme.cacaoGreen,
                                    borderStrokeWidth: 2.5,
                                  ),
                                ],
                              ),
                            ],
                            MarkerLayer(
                              markers: [
                                Marker(
                                  point: LatLng(
                                    _centerPosition!.latitude,
                                    _centerPosition!.longitude,
                                  ),
                                  child: const Icon(
                                    Icons.location_pin,
                                    color: AppTheme.error,
                                    size: 36,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Le polygone carré est généré automatiquement depuis votre position GPS et la superficie indiquée.',
                      style: TextStyle(
                          fontSize: 11,
                          color: AppTheme.grayMedium,
                          fontStyle: FontStyle.italic),
                      textAlign: TextAlign.center,
                    ),
                  ],

                  const SizedBox(height: 32),

                  // ── Bouton de soumission ────────────────────────────────
                  PrimaryButton(
                    text: 'Enregistrer la parcelle',
                    onPressed: _submit,
                    isLoading: _isSubmitting,
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.bold,
        color: AppTheme.cacaoGreenDark,
      ),
    );
  }
}
