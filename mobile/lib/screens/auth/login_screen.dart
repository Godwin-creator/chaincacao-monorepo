import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../widgets/primary_button.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _login() async {
    setState(() => _isLoading = true);
    try {
      await context.read<AuthService>().signIn(
            _emailController.text,
            _passwordController.text,
          );
      // Logic to redirect based on role
      if (mounted) {
        Navigator.pushReplacementNamed(context, AppRoutes.producerHome);
      }
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

  static const _demoEmails = {
    'Producteur':     'producteur@chaincacao.tg',
    'Coopérative':    'cooperative@chaincacao.tg',
    'Collecteur':     'collecteur@chaincacao.tg',
    'Transformateur': 'transformateur@chaincacao.tg',
    'Exportateur':    'exportateur@chaincacao.tg',
  };

  void _loginAsDemo(String role) {
    _emailController.text = _demoEmails[role] ?? 'producteur@chaincacao.tg';
    _passwordController.text = 'Demo1234!';
    _login();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),
              Center(
                child: Image.network(
                  'https://chaincacao.vercel.app/logo-chaincacao-sans-fond.png',
                  height: 100,
                  errorBuilder: (context, error, stackTrace) => const Icon(
                    Icons.eco,
                    size: 80,
                    color: AppTheme.cacaoGreen,
                  ),
                ),
              ),
              const SizedBox(height: 40),
              Text(
                'Bienvenue sur ChainCacao',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 24),
              ),
              const SizedBox(height: 8),
              const Text(
                'La technologie au service de la terre',
                style: TextStyle(color: AppTheme.grayMedium),
              ),
              const SizedBox(height: 40),
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.email),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                decoration: const InputDecoration(
                  labelText: 'Mot de passe',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.lock),
                ),
                obscureText: true,
              ),
              const SizedBox(height: 24),
              PrimaryButton(
                text: 'Se connecter',
                onPressed: _login,
                isLoading: _isLoading,
              ),
              const SizedBox(height: 40),
              const Divider(),
              const SizedBox(height: 20),
              const Text(
                'Accès rapide (Démo)',
                style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.grayMedium),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildDemoChip('Producteur'),
                  _buildDemoChip('Coopérative'),
                  _buildDemoChip('Collecteur'),
                  _buildDemoChip('Transformateur'),
                  _buildDemoChip('Exportateur'),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDemoChip(String label) {
    return ActionChip(
      label: Text(label),
      onPressed: () => _loginAsDemo(label),
      backgroundColor: AppTheme.cream,
      labelStyle: const TextStyle(color: AppTheme.cacaoGreenDark, fontSize: 12),
    );
  }
}
