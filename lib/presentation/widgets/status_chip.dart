import 'package:flutter/material.dart';
import '../../../domain/entities/status.dart';
import '../../../core/constants/app_colors.dart';

class StatusChip extends StatelessWidget {
  final AssistedStatus status;

  const StatusChip({
    super.key,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    Color backgroundColor;
    Color textColor;

    switch (status) {
      case AssistedStatus.urgent:
        backgroundColor = isDark
            ? const Color(0xFF991B1B).withOpacity(0.3)
            : const Color(0xFFFEE2E2);
        textColor = isDark ? const Color(0xFFFCA5A5) : const Color(0xFFDC2626);
        break;
      case AssistedStatus.waiting:
        backgroundColor = isDark
            ? const Color(0xFF92400E).withOpacity(0.3)
            : const Color(0xFFFEF3C7);
        textColor = isDark ? const Color(0xFFFCD34D) : const Color(0xFFD97706);
        break;
      case AssistedStatus.inProgress:
        backgroundColor = isDark
            ? const Color(0xFF1E3A8A).withOpacity(0.3)
            : const Color(0xFFDBEAFE);
        textColor = isDark ? const Color(0xFF93C5FD) : AppColors.primary;
        break;
      case AssistedStatus.completed:
        backgroundColor = isDark
            ? const Color(0xFF065F46).withOpacity(0.3)
            : const Color(0xFFD1FAE5);
        textColor = isDark ? const Color(0xFF6EE7B7) : const Color(0xFF059669);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: textColor,
        ),
      ),
    );
  }
}

