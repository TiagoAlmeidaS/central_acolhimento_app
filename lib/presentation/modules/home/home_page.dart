import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_modular/flutter_modular.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/constants/app_colors.dart';
import '../../../domain/entities/status.dart';
import '../../widgets/bottom_navigation.dart';
import '../../widgets/status_chip.dart';
import '../home/home_controller.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(HomeController());
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Meus Assistidos'),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle),
            onPressed: () => Modular.to.navigate('/settings'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              onChanged: controller.onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Buscar por nome ou cidade',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: isDark ? AppColors.surfaceDark : Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: isDark ? Colors.grey.shade700 : Colors.grey.shade200,
                  ),
                ),
              ),
            ),
          ),
          // Filters
          SizedBox(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _FilterChip(
                  label: 'Todos',
                  isSelected: controller.selectedFilter.value == null,
                  onTap: () => controller.onFilterSelected(null),
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: AssistedStatus.urgent.label,
                  isSelected: controller.selectedFilter.value == AssistedStatus.urgent,
                  onTap: () => controller.onFilterSelected(AssistedStatus.urgent),
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: AssistedStatus.waiting.label,
                  isSelected: controller.selectedFilter.value == AssistedStatus.waiting,
                  onTap: () => controller.onFilterSelected(AssistedStatus.waiting),
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: AssistedStatus.inProgress.label,
                  isSelected: controller.selectedFilter.value == AssistedStatus.inProgress,
                  onTap: () => controller.onFilterSelected(AssistedStatus.inProgress),
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: AssistedStatus.completed.label,
                  isSelected: controller.selectedFilter.value == AssistedStatus.completed,
                  onTap: () => controller.onFilterSelected(AssistedStatus.completed),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // List
          Expanded(
            child: Obx(
              () => controller.isLoading.value
                  ? const Center(child: CircularProgressIndicator())
                  : controller.assistedList.isEmpty
                      ? Center(
                          child: Text(
                            'Nenhum assistido encontrado',
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: controller.assistedList.length,
                          itemBuilder: (context, index) {
                            final assisted = controller.assistedList[index];
                            return _AssistedCard(assisted: assisted);
                          },
                        ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Modular.to.navigate('/chat'),
        child: const Icon(Icons.add),
      ),
      bottomNavigationBar: const BottomNavigation(currentRoute: '/home'),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary
              : (isDark ? AppColors.surfaceDark : Colors.white),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : (isDark ? Colors.grey.shade700 : Colors.grey.shade200),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected
                ? Colors.white
                : (isDark ? Colors.white : Colors.black),
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}

class _AssistedCard extends StatelessWidget {
  final dynamic assisted;

  const _AssistedCard({required this.assisted});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => Modular.to.navigate('/details/${assisted.id}'),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Avatar
              CircleAvatar(
                radius: 32,
                backgroundImage: assisted.photoUrl != null
                    ? CachedNetworkImageProvider(assisted.photoUrl!)
                    : null,
                child: assisted.photoUrl == null
                    ? Text(
                        assisted.name.substring(0, 2).toUpperCase(),
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      )
                    : null,
              ),
              const SizedBox(width: 16),
              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            assisted.name,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        StatusChip(status: assisted.status),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.location_on,
                          size: 16,
                          color: Theme.of(context).textTheme.bodySmall?.color,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${assisted.city}, ${assisted.state}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                    if (assisted.lastContactFormatted != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        'Último contato: ${assisted.lastContactFormatted}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ],
                ),
              ),
              Icon(
                Icons.chevron_right,
                color: Colors.grey.shade400,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

