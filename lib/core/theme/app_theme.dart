import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.primaryDark,
        surface: AppColors.surfaceLight,
        background: AppColors.backgroundLight,
        error: AppColors.urgent,
      ),
      scaffoldBackgroundColor: AppColors.backgroundLight,
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.backgroundLight.withOpacity(0.95),
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.textPrimaryLight),
        titleTextStyle: GoogleFonts.manrope(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimaryLight,
        ),
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.manrope(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          color: AppColors.textPrimaryLight,
        ),
        displayMedium: GoogleFonts.manrope(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimaryLight,
        ),
        headlineLarge: GoogleFonts.manrope(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimaryLight,
        ),
        headlineMedium: GoogleFonts.manrope(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimaryLight,
        ),
        bodyLarge: GoogleFonts.notoSans(
          fontSize: 16,
          fontWeight: FontWeight.normal,
          color: AppColors.textPrimaryLight,
        ),
        bodyMedium: GoogleFonts.notoSans(
          fontSize: 14,
          fontWeight: FontWeight.normal,
          color: AppColors.textSecondaryLight,
        ),
        bodySmall: GoogleFonts.notoSans(
          fontSize: 12,
          fontWeight: FontWeight.normal,
          color: AppColors.textSecondaryLight,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surfaceLight,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceLight,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 8,
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.primaryDark,
        surface: AppColors.surfaceDark,
        background: AppColors.backgroundDark,
        error: AppColors.urgent,
      ),
      scaffoldBackgroundColor: AppColors.backgroundDark,
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.backgroundDark.withOpacity(0.95),
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.textPrimaryDark),
        titleTextStyle: GoogleFonts.manrope(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimaryDark,
        ),
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.manrope(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          color: AppColors.textPrimaryDark,
        ),
        displayMedium: GoogleFonts.manrope(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimaryDark,
        ),
        headlineLarge: GoogleFonts.manrope(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimaryDark,
        ),
        headlineMedium: GoogleFonts.manrope(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimaryDark,
        ),
        bodyLarge: GoogleFonts.notoSans(
          fontSize: 16,
          fontWeight: FontWeight.normal,
          color: AppColors.textPrimaryDark,
        ),
        bodyMedium: GoogleFonts.notoSans(
          fontSize: 14,
          fontWeight: FontWeight.normal,
          color: AppColors.textSecondaryDark,
        ),
        bodySmall: GoogleFonts.notoSans(
          fontSize: 12,
          fontWeight: FontWeight.normal,
          color: AppColors.textSecondaryDark,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surfaceDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceDark,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade700),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade700),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 8,
      ),
    );
  }
}

