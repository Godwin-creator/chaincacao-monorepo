import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';
import '../../widgets/primary_button.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController    = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading    = false;
  bool _showPassword = false;
  String? _errorMessage;

  // ── Comptes démo alignés sur les comptes web Supabase ──────────────────────
  // Seuls ces 4 comptes existent dans Supabase (mêmes que le web).
  // producteur@chaincacao.tg n'est PAS créé dans Supabase — utiliser cooperative.
  static const _demoAccounts = [
    _DemoAccount(
      label: 'Producteur (démo)',
      subtitle: 'Via compte coopérative',
      email: 'cooperative@chaincacao.tg',
      password: 'Demo1234!',
      icon: Icons.agriculture,
    ),
    _DemoAccount(
      label: 'Coopérative',
      subtitle: 'Réception et transfert de lots',
      email: 'cooperative@chaincacao.tg',
      password: 'Demo1234!',
      icon: Icons.store,
    ),
    _DemoAccount(
      label: 'Transformateur',
      subtitle: 'Contrôle qualité',
      email: 'transformateur@chaincacao.tg',
      password: 'Demo1234!',
      icon: Icons.precision_manufacturing,
    ),
    _DemoAccount(
      label: 'Exportateur',
      subtitle: 'EUDR et expéditions',
      email: 'exportateur@chaincacao.tg',
      password: 'Demo1234!',
      icon: Icons.directions_boat,
    ),
  ];

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // ── Traduit les erreurs Supabase en messages lisibles ──────────────────────
  String _formatError(Object e) {
    final msg = e.toString().toLowerCase();
    if (msg.contains('invalid login credentials') ||
        msg.contains('invalid_credentials')) {
      return 'Email ou mot de passe incorrect.';
    }
    if (msg.contains('email not confirmed') ||
        msg.contains('email_not_confirmed')) {
      return 'Veuillez confirmer votre adresse email.';
    }
    if (msg.contains('too many requests') ||
        msg.contains('too_many_requests')) {
      return 'Trop de tentatives. Réessayez dans quelques minutes.';
    }
    if (msg.contains('network') || msg.contains('socketexception')) {
      return 'Pas de connexion internet. Vérifiez votre réseau.';
    }
    if (msg.contains('user not found') ||
        msg.contains('no rows returned')) {
      return 'Compte non trouvé. Vérifiez vos informations.';
    }
    return 'Erreur de connexion. Réessayez.';
  }

  // ── Connexion ──────────────────────────────────────────────────────────────
  Future<void> _login() async {
    final email    = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'Veuillez remplir tous les champs.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final authService = context.read<AuthService>();
      await authService.signIn(email, password);

      if (!mounted) return;

      // Redirect selon le rôle de l'utilisateur
      final role = authService.currentUser?.role;
      final route = _routeForRole(role);
      Navigator.pushReplacementNamed(context, route);
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = _formatError(e);
        });
      }
    }
  }

  /// Redirige vers l'écran adapté au rôle.
  /// Le mobile ne couvre que producer et cooperative/collector pour l'instant.
  String _routeForRole(UserRole? role) {
    switch (role) {
      case UserRole.cooperative:
        return AppRoutes.collectorHome;
      case UserRole.producer:
      case UserRole.processor:
      case UserRole.exporter:
      case UserRole.verifier:
      case UserRole.admin:
      case null:
        return AppRoutes.producerHome;
    }
  }

  void _fillDemo(_DemoAccount account) {
    _emailController.text    = account.email;
    _passwordController.text = account.password;
    setState(() => _errorMessage = null);
    _login();
  }

  // ── UI ─────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Logo
              Center(
                child: Image.network(
                  'https://chaincacao.vercel.app/logo-chaincacao-sans-fond.png',
                  height: 80,
                  errorBuilder: (_, __, ___) => const Icon(
                    Icons.eco_rounded,
                    size: 72,
                    color: AppTheme.cacaoGreen,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Titre
              Text(
                'Bienvenue sur ChainCacao',
                style: Theme.of(context)
                    .textTheme
                    .headlineMedium
                    ?.copyWith(fontSize: 22),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              const Text(
                'La technologie au service de la terre',
                style: TextStyle(color: AppTheme.grayMedium, fontSize: 13),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 36),

              // ── Champ email ────────────────────────────────────────────────
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                autocorrect: false,
                textInputAction: TextInputAction.next,
                decoration: InputDecoration(
                  labelText: 'Adresse e-mail',
                  hintText: 'vous@exemple.com',
                  prefixIcon: const Icon(Icons.email_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: AppTheme.cream,
                ),
              ),
              const SizedBox(height: 14),

              // ── Champ mot de passe ─────────────────────────────────────────
              TextField(
                controller: _passwordController,
                obscureText: !_showPassword,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _login(),
                decoration: InputDecoration(
                  labelText: 'Mot de passe',
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _showPassword
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: AppTheme.grayMedium,
                    ),
                    onPressed: () =>
                        setState(() => _showPassword = !_showPassword),
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: AppTheme.cream,
                ),
              ),
              const SizedBox(height: 20),

              // ── Message d'erreur ──────────────────────────────────────────
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppTheme.error.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                        color: AppTheme.error.withOpacity(0.3)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.error_outline,
                          color: AppTheme.error, size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(
                              color: AppTheme.error, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // ── Bouton Se connecter ───────────────────────────────────────
              PrimaryButton(
                text: 'Se connecter',
                onPressed: _login,
                isLoading: _isLoading,
              ),
              const SizedBox(height: 32),

              // ── Séparateur démo ───────────────────────────────────────────
              Row(
                children: [
                  const Expanded(child: Divider()),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Text(
                      'Accès démo hackathon',
                      style: const TextStyle(
                        color: AppTheme.grayMedium,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const Expanded(child: Divider()),
                ],
              ),
              const SizedBox(height: 16),

              // ── Boutons démo ──────────────────────────────────────────────
              ..._demoAccounts.map((account) => _buildDemoButton(account)),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDemoButton(_DemoAccount account) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: _isLoading ? null : () => _fillDemo(account),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            border: Border.all(
              color: AppTheme.cacaoGreen.withOpacity(0.3),
            ),
            borderRadius: BorderRadius.circular(12),
            color: AppTheme.cream,
          ),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: AppTheme.cacaoGreen.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  account.icon,
                  color: AppTheme.cacaoGreen,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      account.label,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                        color: AppTheme.blackSoft,
                      ),
                    ),
                    Text(
                      account.subtitle,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppTheme.grayMedium,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.arrow_forward_ios,
                size: 14,
                color: AppTheme.grayMedium,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Modèle interne : compte démo
// ─────────────────────────────────────────────────────────────────────────────

class _DemoAccount {
  final String label;
  final String subtitle;
  final String email;
  final String password;
  final IconData icon;

  const _DemoAccount({
    required this.label,
    required this.subtitle,
    required this.email,
    required this.password,
    required this.icon,
  });
}
