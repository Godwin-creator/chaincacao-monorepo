import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../models/user.dart';
import '../config/theme.dart';
import '../config/routes.dart';

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

    final authService = context.read<AuthService>();
    if (authService.isAuthenticated) {
      final user = authService.currentUser;
      if (user?.role == UserRole.cooperative ||
          user?.role == UserRole.processor ||
          user?.role == UserRole.exporter ||
          user?.role == UserRole.verifier ||
          user?.role == UserRole.admin) {
        Navigator.pushReplacementNamed(context, AppRoutes.collectorHome);
      } else {
        Navigator.pushReplacementNamed(context, AppRoutes.producerHome);
      }
    } else {
      Navigator.pushReplacementNamed(context, AppRoutes.login);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.cacaoGreenDark,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
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
                color: AppTheme.cacaoGreen,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'ChainCacao',
              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                    color: Colors.white,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'La technologie au service de la terre',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppTheme.blockchainCyan,
                    fontStyle: FontStyle.italic,
                  ),
            ),
            const SizedBox(height: 48),
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppTheme.blockchainCyan),
            ),
          ],
        ),
      ),
    );
  }
}
