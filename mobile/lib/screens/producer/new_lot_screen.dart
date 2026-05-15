import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/lot.dart';
import '../../services/lot_service.dart';
import '../../services/parcel_service.dart';
import '../../widgets/primary_button.dart';
import '../../config/theme.dart';

class NewLotScreen extends StatefulWidget {
  const NewLotScreen({super.key});

  @override
  State<NewLotScreen> createState() => _NewLotScreenState();
}

class _NewLotScreenState extends State<NewLotScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedParcelId;
  SpeciesType _selectedSpecies = SpeciesType.cacao;
  final _weightController = TextEditingController();
  DateTime _harvestDate = DateTime.now();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    context.read<ParcelService>().fetchParcels();
  }

  Future<void> _saveLot() async {
    if (!_formKey.currentState!.validate() || _selectedParcelId == null) return;

    setState(() => _isLoading = true);
    try {
      final lot = Lot(
        parcelId: _selectedParcelId!,
        producerId: '', // Get from auth
        species: _selectedSpecies,
        weightGrams: int.parse(_weightController.text) * 1000,
        harvestDate: _harvestDate,
      );
      await context.read<LotService>().createLot(lot);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final parcels = context.watch<ParcelService>().parcels;

    return Scaffold(
      appBar: AppBar(title: const Text('Enregistrer un lot')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Parcelle d\'origine', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedParcelId,
                items: parcels.map((p) {
                  return DropdownMenuItem(value: p.id ?? p.localId, child: Text(p.name));
                }).toList(),
                onChanged: (val) => setState(() => _selectedParcelId = val),
                decoration: const InputDecoration(border: OutlineInputBorder()),
                hint: const Text('Sélectionner une parcelle'),
                validator: (val) => val == null ? 'Requis' : null,
              ),
              const SizedBox(height: 20),
              const Text('Espèce', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              SegmentedButton<SpeciesType>(
                segments: const [
                  ButtonSegment(value: SpeciesType.cacao, label: Text('Cacao')),
                  ButtonSegment(value: SpeciesType.robusta_coffee, label: Text('Café Robusta')),
                  ButtonSegment(value: SpeciesType.arabica_coffee, label: Text('Café Arabica')),
                ],
                selected: {_selectedSpecies},
                onSelectionChanged: (val) => setState(() => _selectedSpecies = val.first),
              ),
              const SizedBox(height: 20),
              const Text('Poids (kg)', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              TextFormField(
                controller: _weightController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(border: OutlineInputBorder()),
                validator: (val) => (val == null || val.isEmpty) ? 'Requis' : null,
              ),
              const SizedBox(height: 20),
              ListTile(
                title: const Text('Date de récolte'),
                subtitle: Text('${_harvestDate.day}/${_harvestDate.month}/${_harvestDate.year}'),
                trailing: const Icon(Icons.calendar_today),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _harvestDate,
                    firstDate: DateTime(2020),
                    lastDate: DateTime.now(),
                  );
                  if (picked != null) setState(() => _harvestDate = picked);
                },
              ),
              const SizedBox(height: 40),
              PrimaryButton(
                text: 'Enregistrer (Offline OK)',
                onPressed: _saveLot,
                isLoading: _isLoading,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
