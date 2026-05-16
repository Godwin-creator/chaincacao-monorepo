import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../models/lot.dart';
import '../../services/lot_service.dart';
import '../../services/connectivity_service.dart';
import '../../widgets/offline_banner.dart';
import '../../widgets/primary_button.dart';

class TransferScreen extends StatefulWidget {
  const TransferScreen({super.key});

  @override
  State<TransferScreen> createState() => _TransferScreenState();
}

class _TransferScreenState extends State<TransferScreen> {
  final _formKey = GlobalKey<FormState>();
  final _verifiedWeightController = TextEditingController();
  final _notesController = TextEditingController();

  bool _isSubmitting = false;
  double? _weightDelta; // Écart en %
  String? _txHash;

  Lot? _lot;
  bool _confirmed = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Récupère le lot passé en argument depuis CollectorHomeScreen ou QRScannerScreen
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is Lot) {
      _lot = args;
    }
  }

  @override
  void dispose() {
    _verifiedWeightController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Calcul de l'écart de poids
  // ─────────────────────────────────────────────────────────────────────────

  void _onWeightChanged(String value) {
    if (_lot == null) return;
    final verifiedKg = double.tryParse(value.replaceAll(',', '.'));
    if (verifiedKg != null && verifiedKg > 0) {
      final originalKg = _lot!.weightGrams / 1000;
      final delta = ((verifiedKg - originalKg) / originalKg) * 100;
      setState(() => _weightDelta = delta);
    } else {
      setState(() => _weightDelta = null);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Soumission du transfert
  // ─────────────────────────────────────────────────────────────────────────

  Future<void> _submitTransfer() async {
    if (!_formKey.currentState!.validate()) return;
    if (_lot == null) return;

    // Confirmation si écart > 2%
    if (_weightDelta != null && _weightDelta!.abs() > 2.0) {
      final confirm = await _showWeightAlert();
      if (!confirm) return;
    }

    setState(() => _isSubmitting = true);

    try {
      final lotService = context.read<LotService>();
      final verifiedKg = double.parse(
        _verifiedWeightController.text.replaceAll(',', '.'),
      );

      final transfer = await lotService.transferLot(
        lotId: _lot!.id ?? _lot!.localId ?? '',
        toUserId: 'cooperative-mock-id', // En V2 : sélection depuis liste
        newStatus: LotStatus.collected,
        contextData: {
          'weightVerified': (verifiedKg * 1000).round(),
          'weightOriginal': _lot!.weightGrams,
          'weightDeltaPct': _weightDelta?.toStringAsFixed(2),
          'notes': _notesController.text,
        },
      );

      setState(() {
        _txHash = transfer.blockchainTxHash;
        _confirmed = true;
        _isSubmitting = false;
      });
    } catch (e) {
      setState(() => _isSubmitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors du transfert : $e'),
            backgroundColor: AppTheme.error,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }

  Future<bool> _showWeightAlert() async {
    final delta = _weightDelta!;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded,
                color: AppTheme.warning, size: 28),
            const SizedBox(width: 10),
            const Expanded(
              child: Text(
                'Écart de poids détecté',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            RichText(
              text: TextSpan(
                style: const TextStyle(
                    fontSize: 15, color: AppTheme.grayText, height: 1.5),
                children: [
                  const TextSpan(text: 'L\'écart constaté est de '),
                  TextSpan(
                    text: '${delta.abs().toStringAsFixed(2)} %',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppTheme.error,
                    ),
                  ),
                  TextSpan(
                    text: delta < 0 ? ' (manquant).' : ' (excédent).',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            const Text(
              'La règle ChainCacao autorise un écart maximal de 2 %. Voulez-vous quand même confirmer ce transfert ?',
              style: TextStyle(fontSize: 14, color: AppTheme.grayMedium),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text(
              'Annuler',
              style: TextStyle(color: AppTheme.grayMedium),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.warning,
                foregroundColor: AppTheme.blackSoft),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Confirmer quand même'),
          ),
        ],
      ),
    );
    return confirmed ?? false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Build
  // ─────────────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final isOnline = context.watch<ConnectivityService>().isOnline;

    // Écran de succès après transfert confirmé
    if (_confirmed) {
      return _SuccessScreen(
        txHash: _txHash,
        isOnline: isOnline,
        onBack: () => Navigator.of(context).pop(),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        title: const Text('Confirmer la Collecte'),
        backgroundColor: AppTheme.cacaoGreenDark,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          const OfflineBanner(),
          Expanded(
            child: _lot == null
                ? _buildNoLotState()
                : Form(
                    key: _formKey,
                    child: ListView(
                      padding: const EdgeInsets.all(20),
                      children: [
                        // ── Résumé du lot ─────────────────────────────────
                        _buildLotSummary(),
                        const SizedBox(height: 24),

                        // ── Pesée de vérification ─────────────────────────
                        const _SectionTitle(
                            title: '⚖️ Pesée de vérification'),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _verifiedWeightController,
                          keyboardType: const TextInputType.numberWithOptions(
                              decimal: true),
                          inputFormatters: [
                            FilteringTextInputFormatter.allow(
                                RegExp(r'[0-9,.]')),
                          ],
                          onChanged: _onWeightChanged,
                          decoration: InputDecoration(
                            labelText: 'Poids constaté (kg) *',
                            hintText: 'ex : 51.5',
                            suffixText: 'kg',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12)),
                            filled: true,
                            fillColor: AppTheme.cream,
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 14),
                          ),
                          style: const TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
                          validator: (v) {
                            if (v == null || v.isEmpty) return 'Requis';
                            final n =
                                double.tryParse(v.replaceAll(',', '.'));
                            if (n == null || n <= 0)
                              return 'Poids invalide';
                            return null;
                          },
                        ),

                        // ── Indicateur d'écart ────────────────────────────
                        if (_weightDelta != null) ...[
                          const SizedBox(height: 12),
                          _buildDeltaIndicator(),
                        ],

                        const SizedBox(height: 20),

                        // ── Notes ──────────────────────────────────────────
                        const _SectionTitle(title: '📝 Notes (optionnel)'),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _notesController,
                          maxLines: 3,
                          decoration: InputDecoration(
                            hintText:
                                'Observations, condition du lot, lieu de collecte…',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12)),
                            filled: true,
                            fillColor: AppTheme.cream,
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 14),
                          ),
                        ),

                        const SizedBox(height: 12),

                        // ── Info blockchain ───────────────────────────────
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppTheme.blockchainCyanLight,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.info_outline,
                                  color: AppTheme.blockchainCyanDark,
                                  size: 18),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  isOnline
                                      ? 'Ce transfert sera enregistré sur la blockchain Polygon Amoy.'
                                      : 'Hors-ligne : le transfert sera enregistré localement et synchronisé plus tard.',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppTheme.blockchainCyanDark,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 32),

                        // ── Bouton de confirmation ────────────────────────
                        PrimaryButton(
                          text: 'Confirmer la collecte',
                          onPressed: _submitTransfer,
                          isLoading: _isSubmitting,
                          backgroundColor: AppTheme.harvestGold,
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

  Widget _buildLotSummary() {
    if (_lot == null) return const SizedBox.shrink();

    final speciesLabel = switch (_lot!.species) {
      SpeciesType.cacao => '🌿 Cacao',
      SpeciesType.robusta_coffee => '☕ Café Robusta',
      SpeciesType.arabica_coffee => '☕ Café Arabica',
    };

    final id = _lot!.id ?? _lot!.localId ?? '—';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cream,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.grayLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.inventory_2_outlined,
                  color: AppTheme.cacaoGreenDark, size: 22),
              const SizedBox(width: 10),
              const Text(
                'Lot à collecter',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: AppTheme.cacaoGreenDark,
                ),
              ),
            ],
          ),
          const Divider(height: 20),
          _SummaryRow(label: 'Espèce', value: speciesLabel),
          _SummaryRow(
            label: 'Poids déclaré',
            value: '${(_lot!.weightGrams / 1000).toStringAsFixed(2)} kg',
            bold: true,
          ),
          _SummaryRow(
            label: 'Date de récolte',
            value:
                '${_lot!.harvestDate.day.toString().padLeft(2, '0')}/${_lot!.harvestDate.month.toString().padLeft(2, '0')}/${_lot!.harvestDate.year}',
          ),
          const SizedBox(height: 6),
          Text(
            'ID : ${id.length > 12 ? id.substring(0, 12).toUpperCase() : id.toUpperCase()}',
            style: GoogleFonts.jetBrainsMono(
                fontSize: 11, color: AppTheme.grayMedium),
          ),
        ],
      ),
    );
  }

  Widget _buildDeltaIndicator() {
    final abs = _weightDelta!.abs();
    final isOver2pct = abs > 2.0;
    final isNegative = _weightDelta! < 0;

    Color bgColor;
    Color textColor;
    IconData icon;

    if (abs <= 0.5) {
      bgColor = AppTheme.success.withOpacity(0.1);
      textColor = AppTheme.success;
      icon = Icons.check_circle_outline;
    } else if (abs <= 2.0) {
      bgColor = AppTheme.warning.withOpacity(0.1);
      textColor = AppTheme.warning;
      icon = Icons.warning_amber_outlined;
    } else {
      bgColor = AppTheme.error.withOpacity(0.1);
      textColor = AppTheme.error;
      icon = Icons.error_outline;
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: textColor.withOpacity(0.4)),
      ),
      child: Row(
        children: [
          Icon(icon, color: textColor, size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${isNegative ? '▼' : '▲'} Écart : ${isNegative ? '-' : '+'}${abs.toStringAsFixed(2)} %',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: textColor,
                    fontSize: 15,
                  ),
                ),
                if (isOver2pct)
                  const Text(
                    'Écart supérieur à la tolérance de 2 % — une confirmation sera demandée.',
                    style: TextStyle(fontSize: 12, color: AppTheme.error),
                  )
                else
                  Text(
                    abs <= 0.5
                        ? 'Écart acceptable — dans les normes.'
                        : 'Écart modéré — dans la tolérance de 2 %.',
                    style:
                        TextStyle(fontSize: 12, color: textColor),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoLotState() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.qr_code_scanner,
                size: 64, color: AppTheme.grayMedium),
            SizedBox(height: 16),
            Text(
              'Scannez un QR Code de lot\npour démarrer la collecte.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                color: AppTheme.grayMedium,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Écran de succès après transfert
// ─────────────────────────────────────────────────────────────────────────────

class _SuccessScreen extends StatelessWidget {
  final String? txHash;
  final bool isOnline;
  final VoidCallback onBack;

  const _SuccessScreen({
    required this.txHash,
    required this.isOnline,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppTheme.success.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  color: AppTheme.success,
                  size: 80,
                ),
              ),
              const SizedBox(height: 28),
              const Text(
                'Collecte confirmée !',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.cacaoGreenDark,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                isOnline
                    ? 'Le transfert a été enregistré sur la blockchain Polygon Amoy.'
                    : 'Le transfert a été enregistré localement et sera synchronisé automatiquement.',
                style: const TextStyle(
                    fontSize: 15, color: AppTheme.grayMedium, height: 1.5),
                textAlign: TextAlign.center,
              ),
              if (txHash != null) ...[
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.blockchainCyanLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    children: [
                      const Text(
                        'Transaction Hash',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.blockchainCyanDark,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        txHash!.length > 20
                            ? '${txHash!.substring(0, 10)}…${txHash!.substring(txHash!.length - 8)}'
                            : txHash!,
                        style: GoogleFonts.jetBrainsMono(
                          fontSize: 13,
                          color: AppTheme.grayText,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ],
              const Spacer(),
              SizedBox(
                height: 56,
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.cacaoGreen,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: onBack,
                  child: const Text(
                    'Retour aux collectes',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Widgets utilitaires
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

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.bold = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(
                  color: AppTheme.grayMedium, fontSize: 13)),
          Text(
            value,
            style: TextStyle(
              fontWeight: bold ? FontWeight.bold : FontWeight.w500,
              fontSize: bold ? 16 : 14,
              color: AppTheme.grayText,
            ),
          ),
        ],
      ),
    );
  }
}
