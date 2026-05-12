import 'package:flutter/material.dart';

class ChainCacaoTheme {
  // ═══════════════════════════════════════════════════════
  //  COULEURS PRIMAIRES — Verts cacao
  // ═══════════════════════════════════════════════════════
  static const Color cacaoGreenDark  = Color(0xFF2D5F2E); // Titres, navbar
  static const Color cacaoGreen      = Color(0xFF4A9B3E); // Boutons, accents
  static const Color cacaoGreenLight = Color(0xFF7DC96F); // Succès, highlights

  // ═══════════════════════════════════════════════════════
  //  COULEURS BLOCKCHAIN — Cyans
  // ═══════════════════════════════════════════════════════
  static const Color blockchainCyan      = Color(0xFF4FC3E8); // Éléments tech
  static const Color blockchainCyanDark  = Color(0xFF2196C7); // Liens, boutons sec.
  static const Color blockchainCyanLight = Color(0xFFB3E5F2); // Fonds tech, badges

  // ═══════════════════════════════════════════════════════
  //  COULEURS TERRE — Bruns & ors
  // ═══════════════════════════════════════════════════════
  static const Color cocoaBrown      = Color(0xFF5D3A1F); // Accents forts
  static const Color cocoaBrownLight = Color(0xFF8B5E3C); // Texte mis en avant
  static const Color earthOchre      = Color(0xFFD4A574); // Fonds chaleureux
  static const Color harvestGold     = Color(0xFFE8B547); // CTA premium, EUDR

  // ═══════════════════════════════════════════════════════
  //  NEUTRES
  // ═══════════════════════════════════════════════════════
  static const Color whiteWarm  = Color(0xFFFDFCF8); // Fond principal
  static const Color cream      = Color(0xFFF5F1E8); // Sections alternées
  static const Color grayLight  = Color(0xFFE8E5DD); // Bordures, séparateurs
  static const Color grayMedium = Color(0xFF9B9489); // Texte secondaire
  static const Color grayText   = Color(0xFF3D3530); // Texte courant
  static const Color blackSoft  = Color(0xFF1A1612); // Titres principaux

  // ═══════════════════════════════════════════════════════
  //  ÉTATS & FEEDBACK
  // ═══════════════════════════════════════════════════════
  static const Color success = Color(0xFF4A9B3E); // Lot validé
  static const Color warning = Color(0xFFE8B547); // Données incomplètes
  static const Color error   = Color(0xFFC1440E); // Erreur, fraude détectée
  static const Color info    = Color(0xFF4FC3E8); // Informations blockchain

  // ═══════════════════════════════════════════════════════
  //  STATUTS MÉTIER — Couleur par étape du lot
  // ═══════════════════════════════════════════════════════
  static const Color statusHarvest   = Color(0xFF4A9B3E); // Récolté
  static const Color statusTransit   = Color(0xFFE8B547); // En transit / Collecté
  static const Color statusProcessed = Color(0xFF8B5E3C); // Transformé
  static const Color statusExported  = Color(0xFF2196C7); // Exporté
  static const Color statusVerified  = Color(0xFF2D5F2E); // Vérifié EUDR

  // Retourne la couleur correspondant au statut d'un lot
  static Color forLotStatus(String status) {
    switch (status) {
      case 'harvested':  return statusHarvest;
      case 'collected':  return statusTransit;
      case 'processed':  return statusProcessed;
      case 'exported':   return statusExported;
      case 'verified':   return statusVerified;
      default:           return grayMedium;
    }
  }

  // Retourne le label français correspondant au statut d'un lot
  static String labelForLotStatus(String status) {
    switch (status) {
      case 'harvested':  return 'Récolté';
      case 'collected':  return 'Collecté';
      case 'processed':  return 'Transformé';
      case 'exported':   return 'Exporté';
      case 'verified':   return 'Vérifié EUDR';
      default:           return status;
    }
  }

  // ═══════════════════════════════════════════════════════
  //  THEMEDATA PRINCIPAL
  // ═══════════════════════════════════════════════════════
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: cacaoGreen,
      scaffoldBackgroundColor: whiteWarm,

      // ── Schème de couleurs Material 3 ─────────────────
      colorScheme: const ColorScheme.light(
        primary:              cacaoGreen,
        onPrimary:            whiteWarm,
        primaryContainer:     cacaoGreenLight,
        onPrimaryContainer:   cacaoGreenDark,
        secondary:            blockchainCyanDark,
        onSecondary:          whiteWarm,
        secondaryContainer:   blockchainCyanLight,
        onSecondaryContainer: blockchainCyanDark,
        tertiary:             harvestGold,
        onTertiary:           blackSoft,
        error:                error,
        onError:              whiteWarm,
        surface:              whiteWarm,
        onSurface:            grayText,
        outline:              grayLight,
        outlineVariant:       grayMedium,
        shadow:               blackSoft,
      ),

      // ── Polices ───────────────────────────────────────
      // Corps : Inter | Titres : Plus Jakarta Sans | Données : JetBrains Mono
      // → Ajouter google_fonts: ^6.2.1 dans pubspec.yaml
      fontFamily: 'Inter',

      // ── TextTheme ─────────────────────────────────────
      // Minimum 16 sp corps (accessibilité terrain §5.2)
      textTheme: const TextTheme(
        // Titres — Plus Jakarta Sans
        displayLarge: TextStyle(
          fontFamily: 'PlusJakartaSans',
          fontSize: 32, fontWeight: FontWeight.w700,
          color: blackSoft, letterSpacing: -0.5, height: 1.2,
        ),
        headlineLarge: TextStyle(
          fontFamily: 'PlusJakartaSans',
          fontSize: 24, fontWeight: FontWeight.w700,
          color: blackSoft, height: 1.3,
        ),
        headlineMedium: TextStyle(
          fontFamily: 'PlusJakartaSans',
          fontSize: 20, fontWeight: FontWeight.w600,
          color: blackSoft, height: 1.35,
        ),
        headlineSmall: TextStyle(
          fontFamily: 'PlusJakartaSans',
          fontSize: 18, fontWeight: FontWeight.w600,
          color: blackSoft, height: 1.4,
        ),
        // Corps — Inter
        bodyLarge: TextStyle(
          fontSize: 18, fontWeight: FontWeight.w500,
          color: grayText, height: 1.6,
        ),
        bodyMedium: TextStyle(
          fontSize: 16, fontWeight: FontWeight.w400,
          color: grayText, height: 1.6,
        ),
        bodySmall: TextStyle(
          fontSize: 14, fontWeight: FontWeight.w400,
          color: grayMedium, height: 1.5,
        ),
        // Labels
        labelLarge: TextStyle(
          fontSize: 16, fontWeight: FontWeight.w600,
          color: whiteWarm, letterSpacing: 0.1,
        ),
        labelMedium: TextStyle(
          fontSize: 14, fontWeight: FontWeight.w600,
          color: grayText, letterSpacing: 0.1,
        ),
        labelSmall: TextStyle(
          fontSize: 12, fontWeight: FontWeight.w500,
          color: grayMedium, letterSpacing: 0.2,
        ),
      ),

      // ── AppBar ────────────────────────────────────────
      appBarTheme: const AppBarTheme(
        backgroundColor: cacaoGreenDark,
        foregroundColor: whiteWarm,
        centerTitle: false,
        elevation: 0,
        scrolledUnderElevation: 2,
        toolbarHeight: 60,
        titleTextStyle: TextStyle(
          fontFamily: 'PlusJakartaSans',
          fontSize: 20, fontWeight: FontWeight.w700,
          color: whiteWarm, letterSpacing: -0.2,
        ),
        iconTheme: IconThemeData(color: whiteWarm, size: 24),
      ),

      // ── Bouton principal (vert cacao) ─────────────────
      // Minimum 56 dp — accessibilité terrain §5.2
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: cacaoGreen,
          foregroundColor: whiteWarm,
          minimumSize: const Size(double.infinity, 56),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 2,
          textStyle: const TextStyle(
            fontSize: 16, fontWeight: FontWeight.w600, letterSpacing: 0.1,
          ),
        ),
      ),

      // ── Bouton outlined (vert contour) ────────────────
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: cacaoGreenDark,
          minimumSize: const Size(double.infinity, 56),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          side: const BorderSide(color: cacaoGreen, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 16, fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // ── Bouton texte (cyan blockchain) ────────────────
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: blockchainCyanDark,
          minimumSize: const Size(0, 48),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          textStyle: const TextStyle(
            fontSize: 14, fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // ── Champs de saisie ──────────────────────────────
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cream,
        contentPadding:
        const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: grayLight, width: 1.5),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: grayLight, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: cacaoGreen, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: error, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: error, width: 2),
        ),
        labelStyle: const TextStyle(fontSize: 16, color: grayMedium),
        hintStyle: const TextStyle(fontSize: 16, color: grayMedium),
        errorStyle: const TextStyle(fontSize: 13, color: error),
        floatingLabelStyle: const TextStyle(
          fontSize: 14, fontWeight: FontWeight.w600, color: cacaoGreenDark,
        ),
      ),

      // ── Cards ─────────────────────────────────────────
      cardTheme: CardThemeData(
        color: whiteWarm,
        elevation: 2,
        shadowColor: blackSoft.withValues(alpha: 0.08),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: grayLight, width: 1),
        ),
        margin: const EdgeInsets.symmetric(vertical: 8),
      ),

      // ── Chips (badges statut lot) ─────────────────────
      chipTheme: ChipThemeData(
        backgroundColor: cream,
        labelStyle: const TextStyle(
          fontSize: 12, fontWeight: FontWeight.w600, color: grayText,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(999),
          side: const BorderSide(color: grayLight),
        ),
      ),

      // ── BottomNavigationBar ───────────────────────────
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: whiteWarm,
        selectedItemColor: cacaoGreen,
        unselectedItemColor: grayMedium,
        selectedLabelStyle:
        TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
        unselectedLabelStyle:
        TextStyle(fontSize: 11, fontWeight: FontWeight.w400),
        elevation: 8,
        type: BottomNavigationBarType.fixed,
        showUnselectedLabels: true,
      ),

      // ── SnackBar ──────────────────────────────────────
      snackBarTheme: SnackBarThemeData(
        backgroundColor: blackSoft,
        contentTextStyle: const TextStyle(fontSize: 14, color: whiteWarm),
        actionTextColor: cacaoGreenLight,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        behavior: SnackBarBehavior.floating,
        elevation: 8,
      ),

      // ── Divider ───────────────────────────────────────
      dividerTheme: const DividerThemeData(
        color: grayLight,
        thickness: 1,
        space: 24,
      ),

      // ── ProgressIndicator (loader blockchain) ─────────
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: cacaoGreen,
        linearTrackColor: grayLight,
        circularTrackColor: grayLight,
      ),

      // ── Switch ────────────────────────────────────────
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return cacaoGreen;
          return grayMedium;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return cacaoGreenLight;
          return grayLight;
        }),
      ),

      // ── Ripple / focus ────────────────────────────────
      splashColor: cacaoGreen.withValues(alpha: 0.1),
      highlightColor: cacaoGreen.withValues(alpha: 0.05),
      focusColor: blockchainCyanDark,
    );
  }
}