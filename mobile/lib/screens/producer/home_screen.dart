import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/lot_service.dart';
import '../../services/auth_service.dart';
import '../../widgets/lot_card.dart';
import '../../widgets/offline_banner.dart';
import '../../widgets/sync_indicator.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';

class ProducerHomeScreen extends StatefulWidget {
  const ProducerHomeScreen({super.key});

  @override
  State<ProducerHomeScreen> createState() => _ProducerHomeScreenState();
}

class _ProducerHomeScreenState extends State<ProducerHomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<LotService>().fetchLots();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authService = context.watch<AuthService>();
    final lotService = context.watch<LotService>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tableau de bord'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => authService.signOut(),
          ),
        ],
      ),
      body: Column(
        children: [
          const OfflineBanner(),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Bonjour, ${authService.currentUser?.fullName ?? "Producteur"}',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SyncIndicator(),
              ],
            ),
          ),
          _buildKPIs(lotService),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => lotService.fetchLots(),
              child: lotService.lots.isEmpty
                  ? const Center(child: Text('Aucun lot enregistré'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: lotService.lots.length,
                      itemBuilder: (context, index) {
                        return LotCard(
                          lot: lotService.lots[index],
                          onTap: () {
                            Navigator.pushNamed(
                              context,
                              AppRoutes.lotDetails,
                              arguments: lotService.lots[index],
                            );
                          },
                        );
                      },
                    ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, AppRoutes.newLot),
        label: const Text('Nouveau Lot'),
        icon: const Icon(Icons.add),
        backgroundColor: AppTheme.cacaoGreen,
      ),
    );
  }

  Widget _buildKPIs(LotService lotService) {
    final totalWeight = lotService.lots.fold(0, (sum, lot) => sum + lot.weightGrams);
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Row(
        children: [
          _buildKPICard('Lots', '${lotService.lots.length}', AppTheme.blockchainCyan),
          const SizedBox(width: 12),
          _buildKPICard('Poids Total', '${(totalWeight / 1000).toStringAsFixed(1)} kg', AppTheme.harvestGold),
        ],
      ),
    );
  }

  Widget _buildKPICard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.5)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
