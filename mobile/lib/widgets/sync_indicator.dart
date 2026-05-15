import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/sync_service.dart';
import '../services/connectivity_service.dart';
import '../config/theme.dart';
import '../config/routes.dart';

/// Icône dans l'AppBar indiquant l'état de synchronisation.
/// Un tap navigue vers SyncStatusScreen.
class SyncIndicator extends StatefulWidget {
  const SyncIndicator({super.key});

  @override
  State<SyncIndicator> createState() => _SyncIndicatorState();
}

class _SyncIndicatorState extends State<SyncIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _rotationController;

  @override
  void initState() {
    super.initState();
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    );
  }

  @override
  void dispose() {
    _rotationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final syncService = context.watch<SyncService>();
    final isOnline = context.watch<ConnectivityService>().isOnline;

    // Contrôle l'animation de rotation
    if (syncService.isSyncing) {
      _rotationController.repeat();
    } else {
      _rotationController.stop();
      _rotationController.reset();
    }

    Color iconColor;
    IconData iconData;
    String tooltip;

    if (!isOnline) {
      iconColor = AppTheme.warning;
      iconData = Icons.cloud_off_outlined;
      tooltip = 'Hors-ligne — ${syncService.pendingCount} en attente';
    } else if (syncService.isSyncing) {
      iconColor = AppTheme.blockchainCyanLight;
      iconData = Icons.sync;
      tooltip = 'Synchronisation en cours…';
    } else if (syncService.pendingCount > 0) {
      iconColor = AppTheme.harvestGold;
      iconData = Icons.cloud_upload_outlined;
      tooltip = '${syncService.pendingCount} élément(s) en attente';
    } else {
      iconColor = AppTheme.cacaoGreenLight;
      iconData = Icons.cloud_done_outlined;
      tooltip = 'Tout synchronisé';
    }

    return Stack(
      children: [
        IconButton(
          tooltip: tooltip,
          onPressed: () =>
              Navigator.pushNamed(context, AppRoutes.syncStatus),
          icon: syncService.isSyncing
              ? RotationTransition(
                  turns: _rotationController,
                  child: Icon(iconData, color: iconColor, size: 24),
                )
              : Icon(iconData, color: iconColor, size: 24),
        ),
        // Badge rouge si éléments en attente et offline
        if (!isOnline && syncService.pendingCount > 0)
          Positioned(
            right: 6,
            top: 6,
            child: Container(
              padding: const EdgeInsets.all(3),
              decoration: const BoxDecoration(
                color: AppTheme.error,
                shape: BoxShape.circle,
              ),
              constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
              child: Text(
                '${syncService.pendingCount > 9 ? '9+' : syncService.pendingCount}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }
}
