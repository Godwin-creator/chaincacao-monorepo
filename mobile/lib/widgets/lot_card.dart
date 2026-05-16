import 'package:flutter/material.dart';
import '../models/lot.dart';
import '../config/theme.dart';
import 'package:intl/intl.dart';

class LotCard extends StatelessWidget {
  final Lot lot;
  final VoidCallback onTap;

  const LotCard({
    super.key,
    required this.lot,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd/MM/yyyy');
    
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    lot.species.name.toUpperCase().replaceAll('_', ' '),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: AppTheme.cacaoGreenDark,
                    ),
                  ),
                  _buildStatusBadge(lot.status),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Poids: ${(lot.weightGrams / 1000).toStringAsFixed(2)} kg',
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 4),
              Text(
                'Récolté le: ${dateFormat.format(lot.harvestDate)}',
                style: const TextStyle(fontSize: 14, color: AppTheme.grayMedium),
              ),
              const SizedBox(height: 8),
              if (!lot.isSyncedLocal)
                const Row(
                  children: [
                    Icon(Icons.sync_problem, size: 16, color: AppTheme.warning),
                    SizedBox(width: 4),
                    Text(
                      'En attente de synchronisation',
                      style: TextStyle(fontSize: 12, color: AppTheme.warning),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(LotStatus status) {
    Color color;
    switch (status) {
      case LotStatus.harvested:
        color = AppTheme.statusHarvest;
        break;
      case LotStatus.collected:
        color = AppTheme.statusTransit;
        break;
      case LotStatus.processed:
        color = AppTheme.statusProcessed;
        break;
      case LotStatus.exported:
        color = AppTheme.statusExported;
        break;
      case LotStatus.verified:
        color = AppTheme.statusVerified;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color),
      ),
      child: Text(
        status.name.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

