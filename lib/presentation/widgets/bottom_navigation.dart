import 'package:flutter/material.dart';
import 'package:flutter_modular/flutter_modular.dart';

class BottomNavigation extends StatelessWidget {
  final String currentRoute;

  const BottomNavigation({
    super.key,
    required this.currentRoute,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      decoration: BoxDecoration(
        color: isDark
            ? const Color(0xFF1C252E)
            : Colors.white,
        border: Border(
          top: BorderSide(
            color: isDark
                ? const Color(0xFF1E293B)
                : const Color(0xFFE2E8F0),
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        child: Container(
          height: 64,
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _NavItem(
                icon: Icons.home,
                label: 'Início',
                route: '/home',
                currentRoute: currentRoute,
                onTap: () => Modular.to.navigate('/home'),
              ),
              _NavItem(
                icon: Icons.dashboard,
                label: 'Resumo',
                route: '/summary',
                currentRoute: currentRoute,
                onTap: () => Modular.to.navigate('/summary'),
              ),
              _NavItem(
                icon: Icons.chat,
                label: 'Chat',
                route: '/chat',
                currentRoute: currentRoute,
                onTap: () => Modular.to.navigate('/chat'),
              ),
              _NavItem(
                icon: Icons.settings,
                label: 'Ajustes',
                route: '/settings',
                currentRoute: currentRoute,
                onTap: () => Modular.to.navigate('/settings'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String route;
  final String currentRoute;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.route,
    required this.currentRoute,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = currentRoute == route;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final activeColor = const Color(0xFF137FEC);
    final inactiveColor = isDark
        ? const Color(0xFF64748B)
        : const Color(0xFF94A3B8);

    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isActive ? activeColor : inactiveColor,
              size: 26,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                color: isActive ? activeColor : inactiveColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

