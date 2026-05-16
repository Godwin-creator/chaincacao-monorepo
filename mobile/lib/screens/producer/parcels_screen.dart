import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/parcel_service.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';

class ParcelsScreen extends StatefulWidget {
  const ParcelsScreen({super.key});

  @override
  State<ParcelsScreen> createState() => _ParcelsScreenState();
}

class _ParcelsScreenState extends State<ParcelsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ParcelService>().fetchParcels();
    });
  }

  @override
  Widget build(BuildContext context) {
    final parcelService = context.watch<ParcelService>();

    return Scaffold(
      appBar: AppBar(title: const Text('Mes Parcelles')),
      body: parcelService.parcels.isEmpty
          ? const Center(child: Text('Aucune parcelle enregistrée'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: parcelService.parcels.length,
              itemBuilder: (context, index) {
                final parcel = parcelService.parcels[index];
                return Card(
                  child: ListTile(
                    title: Text(parcel.name),
                    subtitle: Text('${parcel.areaHectares.toStringAsFixed(2)} hectares'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {},
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, AppRoutes.newParcel),
        backgroundColor: AppTheme.cacaoGreen,
        child: const Icon(Icons.add),
      ),
    );
  }
}
