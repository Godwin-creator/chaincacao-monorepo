import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Primary Colors
  static const Color cacaoGreenDark = Color(0xFF2D5F2E);
  static const Color cacaoGreen = Color(0xFF4A9B3E);
  static const Color cacaoGreenLight = Color(0xFF7DC96F);
  
  static const Color blockchainCyan = Color(0xFF4FC3E8);
  static const Color blockchainCyanDark = Color(0xFF2196C7);
  static const Color blockchainCyanLight = Color(0xFFB3E5F2);

  // Secondary Colors
  static const Color cocoaBrown = Color(0xFF5D3A1F);
  static const Color cocoaBrownLight = Color(0xFF8B5E3C);
  static const Color earthOchre = Color(0xFFD4A574);
  static const Color harvestGold = Color(0xFFE8B547);

  // Neutrals
  static const Color white = Color(0xFFFDFCF8);
  static const Color cream = Color(0xFFF5F1E8);
  static const Color grayLight = Color(0xFFE8E5DD);
  static const Color grayMedium = Color(0xFF9B9489);
  static const Color grayText = Color(0xFF3D3530);
  static const Color blackSoft = Color(0xFF1A1612);

  // Feedback
  static const Color success = Color(0xFF4A9B3E);
  static const Color warning = Color(0xFFE8B547);
  static const Color error = Color(0xFFC1440E);
  static const Color info = Color(0xFF4FC3E8);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: cacaoGreen,
        primary: cacaoGreen,
        onPrimary: Colors.white,
        secondary: blockchainCyan,
        onSecondary: Colors.white,
        surface: white,
        onSurface: grayText,
        error: error,
      ),
      scaffoldBackgroundColor: white,
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.plusJakartaSans(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: blackSoft,
        ),
        headlineMedium: GoogleFonts.plusJakartaSans(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: blackSoft,
        ),
        titleMedium: GoogleFonts.plusJakartaSans(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: grayText,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 16,
          color: grayText,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          color: grayText,
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: cacaoGreenDark,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: cacaoGreen,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 56),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.plusJakartaSans(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}