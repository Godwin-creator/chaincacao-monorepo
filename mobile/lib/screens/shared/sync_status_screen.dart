import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../services/sync_service.dart';
import '../../services/connectivity_service.dart';
import '../../repositories/sync_queue_repository.dart';
import '../../widgets/offline_banner.dart';

class SyncStatusScreen extends StatefulWidget {
  const SyncStatusScreen({super.key});

  @override
  State<SyncStatusScreen> createState() => _SyncStatusScreenState();
}

class _SyncStatusScreenState extends State<SyncStatusScreen> {
  List<Map<String, dynamic>> _pendingItems = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPendingItems();
  }

  Future<void> _loadPendingItems() async {
    setState(() => _isLoading = true);
    try {
      final repo = context.read<SyncQueueRepository>();
      final items = await repo.getPendingItems();
      setState(() {
        _pendingItems = items;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _syncNow() async {
    final syncService = context.read<SyncService>();
    final isOnline = context.read<ConnectivityService>().isOnline;

    if (!isOnline) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Connexion requise pour synchroniser.'),
          backgroundColor: AppTheme.warning,
        ),
      );
      return;
    }

    await syncService.syncAll();
    await _loadPendingItems();

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _pendingItems.isEmpty
                ? 'Synchronisation réussie ✓'
                : 'Synchronisation partielle — ${_pendingItems.length} élément(s) restant(s).',
          ),
          backgroundColor:
              _pendingItems.isEmpty ? AppTheme.success : AppTheme.warning,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final syncService = context.watch<SyncService>();
    final isOnline = context.watch<ConnectivityService>().isOnline;

    return Scaffold(
      backgroundColor: AppTheme.white,
      appBar: AppBar(
        title: const Text('Synchronisation'),
        backgroundColor: AppTheme.cacaoGreenDark,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          const OfflineBanner(),

          // ── Carte de statut ───────────────────────────────────────────
          _buildStatusCard(syncService, isOnline),

          // ── Liste des éléments en attente ─────────────────────────────
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation(AppTheme.cacaoGreen)),
                  )
                : _pendingItems.isEmpty
                    ? _buildAllSyncedState()
                    : RefreshIndicator(
                        color: AppTheme.cacaoGreen,
                        onRefresh: _loadPendingItems,
                        child: ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                          itemCount: _pendingItems.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 8),
                          itemBuilder: (ctx, index) =>
                              _PendingItemCard(item: _pendingItems[index]),
                        ),
                      ),
          ),

          // ── Bouton Synchroniser maintenant ────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 28),
            child: SizedBox(
              height: 56,
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: (syncService.isSyncing || !isOnline)
                    ? null
                    : _syncNow,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.blockchainCyanDark,
                  disabledBackgroundColor:
                      AppTheme.grayLight,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                icon: syncService.isSyncing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation(Colors.white),
                        ),
                      )
                    : const Icon(Icons.sync, size: 22),
                label: Text(
                  syncService.isSyncing
                      ? 'Synchronisation en cours…'
                      : !isOnline
                          ? 'Hors-ligne — connexion requise'
                          : 'Synchroniser maintenant',
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusCard(SyncService syncService, bool isOnline) {
    Color cardColor;
    Color iconBg;
    IconData icon;
    String title;
    String subtitle;

    if (!isOnline) {
      cardColor = AppTheme.warning.withOpacity(0.08);
      iconBg = AppTheme.warning.withOpacity(0.15);
      icon = Icons.cloud_off_outlined;
      title = 'Mode Hors-ligne';
      subtitle = '${_pendingItems.length} élément(s) en attente de synchronisation.';
    } else if (syncService.isSyncing) {
      cardColor = AppTheme.blockchainCyanLight.withOpacity(0.5);
      iconBg = AppTheme.blockchainCyan.withOpacity(0.2);
      icon = Icons.sync;
      title = 'Synchronisation en cours…';
      subtitle = 'Envoi des données au serveur.';
    } else if (_pendingItems.isEmpty) {
      cardColor = AppTheme.success.withOpacity(0.08);
      iconBg = AppTheme.success.withOpacity(0.15);
      icon = Icons.cloud_done_outlined;
      title = 'Tout est synchronisé';
      subtitle = syncService.lastSyncTime != null
          ? 'Dernière sync : ${DateFormat('HH:mm', 'fr').format(syncService.lastSyncTime!)}'
          : 'Vos données sont à jour.';
    } else {
      cardColor = AppTheme.harvestGold.withOpacity(0.08);
      iconBg = AppTheme.harvestGold.withOpacity(0.15);
      icon = Icons.cloud_upload_outlined;
      title = '${_pendingItems.length} élément(s) en attente';
      subtitle = 'Appuyez sur "Synchroniser maintenant" pour envoyer.';
    }

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardColor.withOpacity(0.5)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: iconBg, shape: BoxShape.circle),
            child: Icon(icon, size: 32, color: AppTheme.cacaoGreenDark),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.blackSoft,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(
                      fontSize: 13, color: AppTheme.grayMedium),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAllSyncedState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: AppTheme.success.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.check_circle_rounded,
              color: AppTheme.success,
              size: 64,
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Tout est synchronisé ✓',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: AppTheme.cacaoGreenDark,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Aucun élément en attente.',
            style: TextStyle(color: AppTheme.grayMedium, fontSize: 15),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Card d'un élément de la file de sync
// ─────────────────────────────────────────────────────────────────────────────

class _PendingItemCard extends StatelessWidget {
  final Map<String, dynamic> item;
  const _PendingItemCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final entityType = item['entity_type'] as String? ?? '—';
    final action = item['action'] as String? ?? '—';
    final attempts = item['attempts'] as int? ?? 0;
    final lastError = item['last_error'] as String?;
    final createdAt = item['created_at'] != null
        ? DateFormat('dd/MM HH:mm', 'fr')
            .format(DateTime.parse(item['created_at'] as String))
        : '—';

    final typeLabel = switch (entityType) {
      'lot' => '📦 Lot',
      'parcel' => '🗺️ Parcelle',
      'transfer' => '🔄 Transfert',
      _ => entityType,
    };

    final actionLabel = switch (action) {
      'create' => 'Création',
      'update' => 'Mise à jour',
      _ => action,
    };

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.cream,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: attempts > 2 ? AppTheme.error.withOpacity(0.3) : AppTheme.grayLight,
        ),
      ),
      child: Row(
        children: [
          // Statut
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              color: attempts > 2 ? AppTheme.error : AppTheme.harvestGold,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      typeLabel,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: AppTheme.blackSoft,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.grayLight,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        actionLabel,
                        style: const TextStyle(
                            fontSize: 10, color: AppTheme.grayMedium),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Ajouté le $createdAt • $attempts tentative${attempts > 1 ? 's' : ''}',
                  style: const TextStyle(
                      fontSize: 11, color: AppTheme.grayMedium),
                ),
                if (lastError != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Erreur : $lastError',
                    style: const TextStyle(
                        fontSize: 11, color: AppTheme.error),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
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
