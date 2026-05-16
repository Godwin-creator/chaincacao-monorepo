import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../config/routes.dart';
import '../../config/theme.dart';
import '../../models/lot.dart';
import '../../services/auth_service.dart';
import '../../services/lot_service.dart';
import '../../services/connectivity_service.dart';
import '../../widgets/offline_banner.dart';
import '../../widgets/sync_indicator.dart';

// ── Mock data pour la démo quand Supabase inaccessible ──────────────────────
final _mockLots = [
  Lot(
    localId: 'MOCK-001',
    parcelId: 'parcel-01',
    producerId: 'producer-01',
    species: SpeciesType.cacao,
    weightGrams: 52000,
    harvestDate: DateTime(2026, 5, 10),
    status: LotStatus.harvested,
    isSyncedLocal: false,
    createdAt: DateTime(2026, 5, 10),
  ),
  Lot(
    localId: 'MOCK-002',
    parcelId: 'parcel-02',
    producerId: 'producer-01',
    species: SpeciesType.robusta_coffee,
    weightGrams: 35000,
    harvestDate: DateTime(2026, 5, 12),
    status: LotStatus.harvested,
    isSyncedLocal: true,
    createdAt: DateTime(2026, 5, 12),
  ),
];

class CollectorHomeScreen extends StatefulWidget {
  const CollectorHomeScreen({super.key});

  @override
  State<CollectorHomeScreen> createState() => _CollectorHomeScreenState();
}

class _CollectorHomeScreenState extends State<CollectorHomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<LotService>().fetchLots();
    });
  }

  @override
  Widget build(BuildContext context) {
    final lotService = context.watch<LotService>();
    final authService = context.watch<AuthService>();
    final isOnline = context.watch<ConnectivityService>().isOnline;

    // Lots à collecter : statut 'harvested' (en attente de collecte)
    final List<Lot> lotsToCollect = lotService.lots.isNotEmpty
        ? lotService.harvestedLots
        : (!isOnline ? _mockLots : []);

    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        title: const Text('Collecte Terrain'),
        backgroundColor: AppTheme.cacaoGreenDark,
        foregroundColor: Colors.white,
        actions: [
          const SyncIndicator(),
          const SizedBox(width: 4),
        ],
      ),
      body: Column(
        children: [
          const OfflineBanner(),

          // ── En-tête collecteur ────────────────────────────────────────
          Container(
            color: AppTheme.white,
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppTheme.harvestGold.withOpacity(0.2),
                  radius: 26,
                  child: const Icon(
                    Icons.person_outline,
                    color: AppTheme.harvestGold,
                    size: 30,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        authService.currentUser?.fullName ?? 'Collecteur',
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.blackSoft,
                        ),
                      ),
                      Text(
                        '${lotsToCollect.length} lot${lotsToCollect.length > 1 ? 's' : ''} en attente de collecte',
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppTheme.grayMedium,
                        ),
                      ),
                    ],
                  ),
                ),
                // Bouton Scanner QR principal
                ElevatedButton.icon(
                  onPressed: () =>
                      Navigator.pushNamed(context, AppRoutes.qrScanner),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.harvestGold,
                    foregroundColor: AppTheme.blackSoft,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 10),
                    minimumSize: const Size(48, 48),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.qr_code_scanner, size: 20),
                  label: const Text(
                    'Scanner',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),

          // ── Liste des lots ────────────────────────────────────────────
          Expanded(
            child: lotService.isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                      valueColor:
                          AlwaysStoppedAnimation(AppTheme.cacaoGreen),
                    ),
                  )
                : lotsToCollect.isEmpty
                    ? _buildEmptyState()
                    : RefreshIndicator(
                        color: AppTheme.cacaoGreen,
                        onRefresh: () => lotService.fetchLots(),
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: lotsToCollect.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 8),
                          itemBuilder: (context, index) {
                            return _LotCollectCard(
                              lot: lotsToCollect[index],
                              onCollect: () {
                                Navigator.pushNamed(
                                  context,
                                  AppRoutes.transfer,
                                  arguments: lotsToCollect[index],
                                );
                              },
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.inventory_2_outlined,
            size: 72,
            color: AppTheme.grayMedium.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          const Text(
            'Aucun lot en attente de collecte',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppTheme.grayMedium,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Les lots enregistrés par les producteurs\napparaîtront ici.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppTheme.grayMedium, fontSize: 14),
          ),
          const SizedBox(height: 32),
          OutlinedButton.icon(
            onPressed: () =>
                Navigator.pushNamed(context, AppRoutes.qrScanner),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.harvestGold,
              side: const BorderSide(color: AppTheme.harvestGold),
              padding:
                  const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.qr_code_scanner),
            label: const Text(
              'Scanner un QR Code',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Card d'un lot à collecter
// ─────────────────────────────────────────────────────────────────────────────

class _LotCollectCard extends StatelessWidget {
  final Lot lot;
  final VoidCallback onCollect;

  const _LotCollectCard({required this.lot, required this.onCollect});

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd MMM yyyy', 'fr');

    final speciesLabel = switch (lot.species) {
      SpeciesType.cacao => 'Cacao',
      SpeciesType.robusta_coffee => 'Café Robusta',
      SpeciesType.arabica_coffee => 'Café Arabica',
    };

    final id = lot.id ?? lot.localId ?? '—';
    final shortId = id.length > 8 ? id.substring(0, 8).toUpperCase() : id.toUpperCase();

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: AppTheme.blackSoft.withOpacity(0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── En-tête ──────────────────────────────────────────────────
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.cacaoGreenDark.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    speciesLabel.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.cacaoGreenDark,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                Row(
                  children: [
                    if (!lot.isSyncedLocal)
                      const Padding(
                        padding: EdgeInsets.only(right: 6),
                        child: Icon(
                          Icons.cloud_off,
                          size: 14,
                          color: AppTheme.warning,
                        ),
                      ),
                    Text(
                      '#$shortId',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.grayMedium,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 12),

            // ── Infos principales ─────────────────────────────────────────
            Row(
              children: [
                _InfoItem(
                  icon: Icons.scale,
                  label: 'Poids',
                  value: '${(lot.weightGrams / 1000).toStringAsFixed(1)} kg',
                ),
                const SizedBox(width: 20),
                _InfoItem(
                  icon: Icons.calendar_today,
                  label: 'Récolté le',
                  value: dateFormat.format(lot.harvestDate),
                ),
              ],
            ),

            const SizedBox(height: 14),

            // ── Bouton Collecter ──────────────────────────────────────────
            SizedBox(
              height: 48,
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: onCollect,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.harvestGold,
                  foregroundColor: AppTheme.blackSoft,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.local_shipping_outlined, size: 20),
                label: const Text(
                  'Collecter ce lot',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoItem({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppTheme.grayMedium),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                color: AppTheme.grayMedium,
              ),
            ),
            Text(
              value,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: AppTheme.blackSoft,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
