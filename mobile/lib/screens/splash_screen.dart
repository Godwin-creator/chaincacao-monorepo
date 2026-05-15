import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app.dart';
import '../config/theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;

    final authProvider = context.read<AuthStateProvider>();
    if (authProvider.isAuthenticated) {
      Navigator.pushReplacementNamed(context, '/dashboard');
    } else {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CacaoTheme.chainBg,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Placeholder pour le logo
            Container(
              width: 120,
              height: 120,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.eco,
                size: 80,
                color: CacaoTheme.cacaoGreen,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'ChainCacao',
              style: CacaoTheme.headingXL.copyWith(color: Colors.white),
            ),
            const SizedBox(height: 8),
            Text(
              'La technologie au service de la terre',
              style: CacaoTheme.bodyLarge.copyWith(
                color: CacaoTheme.chainCyan,
                fontStyle: FontStyle.italic,
              ),
            ),
            const SizedBox(height: 48),
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(CacaoTheme.chainCyan),
            ),
          ],
        ),
      ),
    );
  }
}
