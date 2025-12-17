import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/constants/app_colors.dart';
import '../../widgets/bottom_navigation.dart';
import '../summary/summary_controller.dart';

class SummaryPage extends StatelessWidget {
  const SummaryPage({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(SummaryController());
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              radius: 20,
              backgroundColor: AppColors.primary.withOpacity(0.1),
              child: const Icon(Icons.person, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'LÍDER',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Text(
                  'Resumo',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: Obx(
        () => controller.isLoading.value
            ? const Center(child: CircularProgressIndicator())
            : controller.metrics.value == null
                ? const Center(child: Text('Nenhuma métrica disponível'))
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Greeting
                        Text(
                          'Segunda, 24 Out',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Olá, Pastor João 👋',
                          style: Theme.of(context).textTheme.displayMedium,
                        ),
                        const SizedBox(height: 24),
                        // Metrics Cards
                        Row(
                          children: [
                            Expanded(
                              child: _MetricCard(
                                icon: Icons.people,
                                label: 'Cuidados',
                                value: '${controller.metrics.value!.totalCares}',
                                subtitle: '+${controller.metrics.value!.newCares} novos',
                                color: AppColors.primary,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: _MetricCard(
                                icon: Icons.schedule,
                                label: 'Tempo Médio',
                                value: controller.metrics.value!.averageTime,
                                color: Colors.blue,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        // Status Chart
                        Text(
                          'Status do Acolhimento',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 16),
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              children: [
                                // Simple chart representation
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                                  children: [
                                    _ChartItem(
                                      label: 'Novos',
                                      value: '${controller.metrics.value!.newCares} (40%)',
                                      color: Colors.amber,
                                    ),
                                    _ChartItem(
                                      label: 'Em Andamento',
                                      value: '${controller.metrics.value!.inProgressCares} (30%)',
                                      color: AppColors.primary,
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Total: ${controller.metrics.value!.totalCares}',
                                  style: Theme.of(context).textTheme.titleLarge,
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 80),
                      ],
                    ),
                  ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        icon: const Icon(Icons.picture_as_pdf),
        label: const Text('Disparar Relatório Semanal'),
        backgroundColor: isDark ? Colors.white : Colors.black,
        foregroundColor: isDark ? Colors.black : Colors.white,
      ),
      bottomNavigationBar: const BottomNavigation(currentRoute: '/summary'),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final String? subtitle;
  final Color color;

  const _MetricCard({
    required this.icon,
    required this.label,
    required this.value,
    this.subtitle,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 24),
                const SizedBox(width: 8),
                Text(
                  label,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: Theme.of(context).textTheme.displaySmall,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 4),
              Text(
                subtitle!,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.green,
                    ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ChartItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _ChartItem({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
      ],
    );
  }
}

