import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/constants/app_colors.dart';
import '../../widgets/back_button.dart';
import '../../widgets/bottom_navigation.dart';
import '../settings/settings_controller.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(SettingsController());
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: const AppBackButton(),
        title: const Text('Ajustes'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Profile Section
            Column(
              children: [
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 56,
                      backgroundColor: AppColors.primary.withOpacity(0.1),
                      child: const Icon(
                        Icons.person,
                        size: 56,
                        color: AppColors.primary,
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isDark
                                ? AppColors.backgroundDark
                                : Colors.white,
                            width: 3,
                          ),
                        ),
                        child: const Icon(
                          Icons.edit,
                          size: 16,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  'Maria Silva',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 4),
                Text(
                  'Líder de Acolhimento',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
            const SizedBox(height: 32),
            // Settings Sections
            _SettingsSection(
              title: 'Vínculo & Notificações',
              children: [
                _SettingsTile(
                  icon: Icons.church,
                  title: 'Vínculo Atual',
                  subtitle: 'Igreja Central - São Paulo',
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
                Obx(
                  () => SwitchListTile(
                    secondary: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.chat,
                        color: Colors.green,
                      ),
                    ),
                    title: const Text('Notificações WhatsApp'),
                    subtitle: const Text('Alertas sobre novos irmãos'),
                    value: controller.notificationsEnabled.value,
                    onChanged: (value) {
                      controller.notificationsEnabled.value = value;
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _SettingsSection(
              title: 'Conta',
              children: [
                ListTile(
                  leading: const Icon(Icons.logout, color: Colors.red),
                  title: const Text(
                    'Sair da conta',
                    style: TextStyle(color: Colors.red),
                  ),
                  onTap: controller.logout,
                ),
              ],
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
      bottomNavigationBar: const BottomNavigation(currentRoute: '/settings'),
    );
  }
}

class _SettingsSection extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _SettingsSection({
    required this.title,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Text(
            title,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1,
                ),
          ),
        ),
        Card(
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  const _SettingsTile({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: AppColors.primary),
      ),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle!) : null,
      trailing: trailing,
      onTap: onTap,
    );
  }
}

