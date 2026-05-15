import 'package:flutter/material.dart';
import '../../config/routes.dart';
import '../../config/theme.dart';

class CollectorHomeScreen extends StatelessWidget {
  const CollectorHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Collecte Terrain')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.local_shipping, size: 80, color: AppTheme.harvestGold),
            const SizedBox(height: 24),
            const Text(
              'Interface Collecteur',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 40),
            ElevatedButton.icon(
              onPressed: () => Navigator.pushNamed(context, AppRoutes.qrScanner),
              icon: const Icon(Icons.qr_code_scanner),
              label: const Text('Scanner un Lot'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(250, 60),
                backgroundColor: AppTheme.harvestGold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
