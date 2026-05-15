import 'package:flutter/material.dart';
import '../../models/lot.dart';
import '../../config/theme.dart';
import '../../utils/formatters.dart';
import 'package:qr_flutter/qr_flutter.dart';

class LotDetailsScreen extends StatelessWidget {
  const LotDetailsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lot = ModalRoute.of(context)!.settings.arguments as Lot;

    return Scaffold(
      appBar: AppBar(title: const Text('Détails du Lot')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: QrImageView(
                data: 'https://chaincacao.vercel.app/verify/${lot.id ?? lot.localId}',
                version: QrVersions.auto,
                size: 200.0,
                foregroundColor: AppTheme.cacaoGreenDark,
              ),
            ),
            const SizedBox(height: 32),
            _buildInfoRow('Espèce', lot.species.name.toUpperCase()),
            _buildInfoRow('Poids', Formatters.formatWeight(lot.weightGrams)),
            _buildInfoRow('Date de récolte', Formatters.formatDate(lot.harvestDate)),
            _buildInfoRow('Statut', lot.status.name.toUpperCase()),
            const Divider(height: 40),
            const Text('Traçabilité Blockchain', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 16),
            _buildInfoRow('Token ID', lot.blockchainTokenId?.toString() ?? 'En attente'),
            _buildInfoRow('Transaction', lot.blockchainTxHash != null 
                ? '${lot.blockchainTxHash!.substring(0, 10)}...' 
                : 'En attente'),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.grayMedium)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
