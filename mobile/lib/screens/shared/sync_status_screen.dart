import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/sync_service.dart';
import '../../config/theme.dart';

class SyncStatusScreen extends StatelessWidget {
  const SyncStatusScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final syncService = context.watch<SyncService>();

    return Scaffold(
      appBar: AppBar(title: const Text('État de Synchronisation')),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            color: syncService.isSyncing ? AppTheme.blockchainCyanLight : AppTheme.cream,
            child: Row(
              children: [
                Icon(
                  syncService.isSyncing ? Icons.sync : Icons.cloud_done,
                  size: 48,
                  color: AppTheme.cacaoGreen,
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        syncService.isSyncing ? 'Synchronisation en cours' : 'Tout est à jour',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const Text('Dernière sync: Aujourd\'hui, 10:45', style: TextStyle(color: AppTheme.grayMedium)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Expanded(
            child: Center(child: Text('Historique des synchronisations')),
          ),
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: ElevatedButton(
              onPressed: syncService.isSyncing ? null : () => syncService.syncAll(),
              child: const Text('Synchroniser Maintenant'),
            ),
          ),
        ],
      ),
    );
  }
}
