import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/connectivity_service.dart';
import '../services/sync_service.dart';
import '../config/theme.dart';

/// Bannière contextuelle en haut d'écran reflétant l'état réseau et la sync.
/// ─ Orange  : hors-ligne, N éléments en attente
/// ─ Cyan    : synchronisation en cours
/// ─ Vert    : tout synchronisé
class OfflineBanner extends StatelessWidget {
  const OfflineBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final isOnline = context.watch<ConnectivityService>().isOnline;
    final syncService = context.watch<SyncService>();

    // Synchronisation en cours (online)
    if (isOnline && syncService.isSyncing) {
      return _Banner(
        color: AppTheme.blockchainCyanDark,
        icon: Icons.sync,
        text: 'Synchronisation en cours…',
        spinning: true,
      );
    }

    // Tout synchronisé (brève affichage)
    if (isOnline && syncService.syncState == SyncState.success && syncService.pendingCount == 0) {
      return const SizedBox.shrink(); // Silencieux quand tout va bien
    }

    // Hors-ligne avec éléments en attente
    if (!isOnline) {
      final n = syncService.pendingCount;
      final label = n > 0
          ? 'Hors-ligne — $n élément${n > 1 ? 's' : ''} en attente de sync'
          : 'Mode Hors-ligne — Sera synchronisé';
      return _Banner(
        color: AppTheme.warning,
        icon: Icons.cloud_off,
        text: label,
      );
    }

    // En ligne mais éléments en attente (après retour réseau)
    if (isOnline && syncService.pendingCount > 0) {
      return _Banner(
        color: AppTheme.blockchainCyan,
        icon: Icons.cloud_upload_outlined,
        text: 'En ligne — ${syncService.pendingCount} élément(s) à synchroniser',
      );
    }

    return const SizedBox.shrink();
  }
}

class _Banner extends StatelessWidget {
  final Color color;
  final IconData icon;
  final String text;
  final bool spinning;

  const _Banner({
    required this.color,
    required this.icon,
    required this.text,
    this.spinning = false,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      width: double.infinity,
      color: color,
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          spinning
              ? SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Colors.white.withOpacity(0.9),
                    ),
                  ),
                )
              : Icon(icon, color: Colors.white, size: 18),
          const SizedBox(width: 10),
          Flexible(
            child: Text(
              text,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
