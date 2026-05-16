import 'dart:io';
import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../models/lot.dart';
import '../../models/parcel.dart';
import '../../services/lot_service.dart';
import '../../services/parcel_service.dart';
import '../../services/auth_service.dart';
import '../../services/gps_service.dart';
import '../../services/connectivity_service.dart';
import '../../widgets/offline_banner.dart';
import '../../widgets/primary_button.dart';

class NewLotScreen extends StatefulWidget {
  const NewLotScreen({super.key});

  @override
  State<NewLotScreen> createState() => _NewLotScreenState();
}

class _NewLotScreenState extends State<NewLotScreen> {
  final _formKey = GlobalKey<FormState>();
  final _gpsService = GpsService();
  final _imagePicker = ImagePicker();

  // Champs du formulaire
  Parcel? _selectedParcel;
  SpeciesType _selectedSpecies = SpeciesType.cacao;
  final _weightController = TextEditingController();
  final _humidityController = TextEditingController();
  DateTime _harvestDate = DateTime.now();

  // GPS
  Position? _gpsPosition;
  bool _isLocating = false;
  String? _gpsError;

  // Photo
  XFile? _photoFile;
  String? _photoHash;
  bool _isProcessingPhoto = false;

  // Soumission
  bool _isSubmitting = false;
  String? _submitError;
  String? _createdLotId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ParcelService>().fetchParcels();
    });
  }

  @override
  void dispose() {
    _weightController.dispose();
    _humidityController.dispose();
    super.dispose();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Géolocalisation
  // ─────────────────────────────────────────────────────────────────────────

  Future<void> _locatePosition() async {
    setState(() {
      _isLocating = true;
      _gpsError = null;
    });
    try {
      final pos = await _gpsService.getCurrentPosition();
      setState(() {
        _gpsPosition = pos;
        _isLocating = false;
      });
    } catch (e) {
      setState(() {
        _gpsError = 'Impossible d\'obtenir la position : $e';
        _isLocating = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_gpsError!),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Photo & Hash SHA-256
  // ─────────────────────────────────────────────────────────────────────────

  Future<void> _pickPhoto() async {
    setState(() => _isProcessingPhoto = true);
    try {
      final picked = await _imagePicker.pickImage(
        source: ImageSource.camera,
        imageQuality: 80,
        maxWidth: 1920,
      );
      if (picked != null) {
        final bytes = await File(picked.path).readAsBytes();
        final hash = sha256.convert(bytes).toString();
        setState(() {
          _photoFile = picked;
          _photoHash = hash;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Impossible d\'accéder à la caméra.'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    } finally {
      setState(() => _isProcessingPhoto = false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Soumission du formulaire
  // ─────────────────────────────────────────────────────────────────────────

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedParcel == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez sélectionner une parcelle.'),
          backgroundColor: AppTheme.warning,
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
      _submitError = null;
      _createdLotId = null;
    });

    try {
      final authService = context.read<AuthService>();
      final lotService = context.read<LotService>();

      final weightKg = double.parse(_weightController.text.replaceAll(',', '.'));
      final humidityPct = _humidityController.text.isNotEmpty
          ? double.tryParse(_humidityController.text.replaceAll(',', '.'))
          : null;

      final lot = Lot(
        parcelId: _selectedParcel!.id ?? _selectedParcel!.localId ?? '',
        producerId: authService.currentUser?.id ?? '',
        species: _selectedSpecies,
        weightGrams: (weightKg * 1000).round(),
        harvestDate: _harvestDate,
        photoUrls: [],
        photoHashes: _photoHash != null ? [_photoHash!] : [],
        qualityData: {
          if (humidityPct != null) 'humidity_pct': humidityPct,
          if (_gpsPosition != null) ...{
            'gps_lat': _gpsPosition!.latitude,
            'gps_lng': _gpsPosition!.longitude,
            'gps_accuracy': _gpsPosition!.accuracy,
          },
        },
      );

      final created = await lotService.createLot(lot);
      final isOnline = context.read<ConnectivityService>().isOnline;

      if (mounted) {
        setState(() {
          _createdLotId = created.id ?? created.localId;
          _isSubmitting = false;
        });
        _showSuccessDialog(created.id ?? created.localId ?? '', isOnline);
      }
    } catch (e) {
      setState(() {
        _isSubmitting = false;
        _submitError = e.toString();
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur : $_submitError'),
            backgroundColor: AppTheme.error,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }

  void _showSuccessDialog(String lotId, bool isOnline) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        icon: const Icon(Icons.check_circle, color: AppTheme.success, size: 56),
        title: const Text(
          'Lot enregistré !',
          textAlign: TextAlign.center,
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              isOnline
                  ? 'Le lot a été enregistré et envoyé au serveur.'
                  : 'Le lot a été enregistré localement.\nIl sera synchronisé dès que vous retrouverez une connexion.',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.grayText),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppTheme.cream,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'ID: $lotId',
                style: GoogleFonts.jetBrainsMono(
                  fontSize: 11,
                  color: AppTheme.cocoaBrown,
                ),
                textAlign: TextAlign.center,
              ),
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
              child: const Text('Retour au tableau de bord'),
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
    final parcels = context.watch<ParcelService>().parcels;
    final isParcelLoading = context.watch<ParcelService>().isLoading;

    return Scaffold(
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        title: const Text('Enregistrer un lot'),
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
                  // ── Section : Parcelle ──────────────────────────────────
                  _SectionTitle(title: '📍 Parcelle d\'origine'),
                  const SizedBox(height: 8),
                  isParcelLoading
                      ? const Center(child: CircularProgressIndicator())
                      : _buildParcelDropdown(parcels),

                  const SizedBox(height: 24),

                  // ── Section : Espèce ────────────────────────────────────
                  _SectionTitle(title: '🌱 Espèce cultivée'),
                  const SizedBox(height: 12),
                  _buildSpeciesSelector(),

                  const SizedBox(height: 24),

                  // ── Section : Poids & Qualité ──────────────────────────
                  _SectionTitle(title: '⚖️ Poids et qualité'),
                  const SizedBox(height: 12),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        flex: 3,
                        child: _buildTextField(
                          controller: _weightController,
                          label: 'Poids (kg) *',
                          hint: 'ex : 50',
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          inputFormatters: [
                            FilteringTextInputFormatter.allow(RegExp(r'[0-9,.]')),
                          ],
                          validator: (v) {
                            if (v == null || v.isEmpty) return 'Requis';
                            final n = double.tryParse(v.replaceAll(',', '.'));
                            if (n == null || n <= 0) return 'Valeur invalide';
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: _buildTextField(
                          controller: _humidityController,
                          label: 'Humidité (%)',
                          hint: 'ex : 7.5',
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          inputFormatters: [
                            FilteringTextInputFormatter.allow(RegExp(r'[0-9,.]')),
                          ],
                          validator: (v) {
                            if (v == null || v.isEmpty) return null;
                            final n = double.tryParse(v.replaceAll(',', '.'));
                            if (n == null || n < 0 || n > 100) return 'Valeur 0-100';
                            return null;
                          },
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // ── Section : Date de récolte ───────────────────────────
                  _SectionTitle(title: '📅 Date de récolte'),
                  const SizedBox(height: 8),
                  _buildDatePicker(),

                  const SizedBox(height: 24),

                  // ── Section : Localisation GPS ─────────────────────────
                  _SectionTitle(title: '🛰️ Localisation GPS'),
                  const SizedBox(height: 8),
                  _buildGpsSection(),

                  const SizedBox(height: 24),

                  // ── Section : Photo ────────────────────────────────────
                  _SectionTitle(title: '📷 Photo du lot (optionnel)'),
                  const SizedBox(height: 8),
                  _buildPhotoSection(),

                  const SizedBox(height: 40),

                  // ── Bouton de soumission ────────────────────────────────
                  PrimaryButton(
                    text: 'Enregistrer le lot',
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

  // ─────────────────────────────────────────────────────────────────────────
  // Sous-widgets de construction
  // ─────────────────────────────────────────────────────────────────────────

  Widget _buildParcelDropdown(List<Parcel> parcels) {
    if (parcels.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.cream,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.grayLight),
        ),
        child: const Row(
          children: [
            Icon(Icons.info_outline, color: AppTheme.grayMedium),
            SizedBox(width: 12),
            Expanded(
              child: Text(
                'Aucune parcelle disponible. Enregistrez d\'abord une parcelle.',
                style: TextStyle(color: AppTheme.grayMedium, fontSize: 14),
              ),
            ),
          ],
        ),
      );
    }

    return DropdownButtonFormField<Parcel>(
      value: _selectedParcel,
      decoration: InputDecoration(
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        filled: true,
        fillColor: AppTheme.cream,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        prefixIcon: const Icon(Icons.map_outlined, color: AppTheme.cacaoGreen),
      ),
      hint: const Text('Sélectionner une parcelle'),
      items: parcels.map((p) {
        return DropdownMenuItem<Parcel>(
          value: p,
          child: Text(
            '${p.name} (${p.areaHectares.toStringAsFixed(2)} ha)',
            overflow: TextOverflow.ellipsis,
          ),
        );
      }).toList(),
      onChanged: (val) => setState(() => _selectedParcel = val),
    );
  }

  Widget _buildSpeciesSelector() {
    const species = [
      (SpeciesType.cacao, '🌿', 'Cacao'),
      (SpeciesType.robusta_coffee, '☕', 'Café Robusta'),
      (SpeciesType.arabica_coffee, '☕', 'Café Arabica'),
    ];

    return Column(
      children: species.map((s) {
        final isSelected = _selectedSpecies == s.$1;
        return GestureDetector(
          onTap: () => setState(() => _selectedSpecies = s.$1),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: isSelected ? AppTheme.cacaoGreen.withOpacity(0.1) : AppTheme.cream,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? AppTheme.cacaoGreen : AppTheme.grayLight,
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Row(
              children: [
                Text(s.$2, style: const TextStyle(fontSize: 20)),
                const SizedBox(width: 12),
                Text(
                  s.$3,
                  style: TextStyle(
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected ? AppTheme.cacaoGreenDark : AppTheme.grayText,
                    fontSize: 16,
                  ),
                ),
                const Spacer(),
                if (isSelected)
                  const Icon(Icons.check_circle, color: AppTheme.cacaoGreen),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    String? hint,
    TextInputType? keyboardType,
    List<TextInputFormatter>? inputFormatters,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      validator: validator,
      style: const TextStyle(fontSize: 16, color: AppTheme.grayText),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        filled: true,
        fillColor: AppTheme.cream,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  Widget _buildDatePicker() {
    return InkWell(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: _harvestDate,
          firstDate: DateTime(2020),
          lastDate: DateTime.now(),
          builder: (ctx, child) => Theme(
            data: Theme.of(ctx).copyWith(
              colorScheme: const ColorScheme.light(
                primary: AppTheme.cacaoGreen,
              ),
            ),
            child: child!,
          ),
        );
        if (picked != null) setState(() => _harvestDate = picked);
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppTheme.cream,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.grayLight),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today, color: AppTheme.cacaoGreen, size: 22),
            const SizedBox(width: 12),
            Text(
              DateFormat('dd MMMM yyyy', 'fr').format(_harvestDate),
              style: const TextStyle(fontSize: 16, color: AppTheme.grayText),
            ),
            const Spacer(),
            const Icon(Icons.chevron_right, color: AppTheme.grayMedium),
          ],
        ),
      ),
    );
  }

  Widget _buildGpsSection() {
    return Column(
      children: [
        if (_gpsPosition != null) ...[
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppTheme.blockchainCyanLight,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.blockchainCyan),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.my_location, color: AppTheme.blockchainCyanDark, size: 18),
                    const SizedBox(width: 8),
                    const Text(
                      'Position capturée',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.blockchainCyanDark,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Latitude : ${_gpsPosition!.latitude.toStringAsFixed(6)}',
                  style: GoogleFonts.jetBrainsMono(
                    fontSize: 13,
                    color: AppTheme.grayText,
                  ),
                ),
                Text(
                  'Longitude : ${_gpsPosition!.longitude.toStringAsFixed(6)}',
                  style: GoogleFonts.jetBrainsMono(
                    fontSize: 13,
                    color: AppTheme.grayText,
                  ),
                ),
                Text(
                  'Précision : ±${_gpsPosition!.accuracy.toStringAsFixed(1)} m',
                  style: TextStyle(
                    fontSize: 12,
                    color: _gpsPosition!.accuracy > 10
                        ? AppTheme.warning
                        : AppTheme.success,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (_gpsPosition!.accuracy > 10)
                  const Padding(
                    padding: EdgeInsets.only(top: 4),
                    child: Text(
                      '⚠ Précision insuffisante — attendez 30 s ou déplacez-vous à découvert.',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppTheme.warning,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 8),
        ],
        SizedBox(
          height: 52,
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: _isLocating ? null : _locatePosition,
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.blockchainCyanDark,
              side: const BorderSide(color: AppTheme.blockchainCyanDark),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            icon: _isLocating
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation(AppTheme.blockchainCyanDark),
                    ),
                  )
                : const Icon(Icons.my_location, size: 20),
            label: Text(
              _isLocating
                  ? 'Localisation en cours…'
                  : _gpsPosition != null
                      ? 'Actualiser la position'
                      : 'Localiser ma parcelle',
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPhotoSection() {
    return Column(
      children: [
        if (_photoFile != null) ...[
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.file(
              File(_photoFile!.path),
              height: 160,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppTheme.cream,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.fingerprint, size: 16, color: AppTheme.grayMedium),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'SHA-256 : ${_photoHash?.substring(0, 16)}…',
                    style: GoogleFonts.jetBrainsMono(
                      fontSize: 11,
                      color: AppTheme.grayMedium,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
        ],
        SizedBox(
          height: 52,
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: _isProcessingPhoto ? null : _pickPhoto,
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.cocoaBrown,
              side: const BorderSide(color: AppTheme.cocoaBrownLight),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            icon: _isProcessingPhoto
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.camera_alt_outlined, size: 20),
            label: Text(
              _photoFile != null ? 'Changer la photo' : 'Prendre une photo',
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
            ),
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget utilitaire : titre de section
// ─────────────────────────────────────────────────────────────────────────────

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
