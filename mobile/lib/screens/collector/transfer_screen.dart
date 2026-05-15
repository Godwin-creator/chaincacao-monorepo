import 'package:flutter/material.dart';
import '../../widgets/primary_button.dart';

class TransferScreen extends StatelessWidget {
  const TransferScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Confirmer le Transfert')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const Card(
              child: ListTile(
                title: Text('Lot #CACAO-2026-001'),
                subtitle: Text('Producteur: Kossi AYITE\nPoids: 50.0 kg'),
              ),
            ),
            const SizedBox(height: 32),
            const TextField(
              decoration: InputDecoration(
                labelText: 'Poids vérifié (kg)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const Spacer(),
            PrimaryButton(
              text: 'Confirmer le Transfert',
              onPressed: () {
                // Transfer logic
              },
            ),
          ],
        ),
      ),
    );
  }
}
