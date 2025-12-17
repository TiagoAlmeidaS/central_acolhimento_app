import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/constants/app_colors.dart';
import '../../widgets/back_button.dart';
import '../../widgets/status_chip.dart';
import '../details/details_controller.dart';

class DetailsPage extends StatelessWidget {
  final String id;

  const DetailsPage({super.key, required this.id});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(DetailsController());
    controller.loadAssistedDetails(id);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: const AppBackButton(),
        title: const Text('Detalhes do Assistido'),
        centerTitle: true,
      ),
      body: Obx(
        () => controller.isLoading.value
            ? const Center(child: CircularProgressIndicator())
            : controller.assisted.value == null
            ? const Center(child: Text('Assistido não encontrado'))
            : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Profile Section
                    Column(
                      children: [
                        Stack(
                          children: [
                            CircleAvatar(
                              radius: 64,
                              backgroundImage:
                                  controller.assisted.value!.photoUrl != null
                                  ? CachedNetworkImageProvider(
                                      controller.assisted.value!.photoUrl!,
                                    )
                                  : null,
                              child: controller.assisted.value!.photoUrl == null
                                  ? Text(
                                      controller.assisted.value!.name
                                          .substring(0, 2)
                                          .toUpperCase(),
                                      style: const TextStyle(
                                        fontSize: 32,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    )
                                  : null,
                            ),
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: Container(
                                width: 20,
                                height: 20,
                                decoration: BoxDecoration(
                                  color: Colors.green,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: isDark
                                        ? AppColors.backgroundDark
                                        : Colors.white,
                                    width: 3,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          controller.assisted.value!.name,
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                        const SizedBox(height: 8),
                        StatusChip(status: controller.assisted.value!.status),
                      ],
                    ),
                    const SizedBox(height: 24),
                    // Contact Card
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                Icons.phone,
                                color: AppColors.primary,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'CELULAR',
                                    style: Theme.of(context).textTheme.bodySmall
                                        ?.copyWith(fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    controller.assisted.value!.phone,
                                    style: Theme.of(
                                      context,
                                    ).textTheme.titleLarge,
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: AppColors.whatsappGreen,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.chat,
                                  color: Colors.white,
                                ),
                              ),
                              onPressed: () {},
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Action Buttons
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {},
                            icon: const Icon(Icons.edit_note),
                            label: const Text('Atualizar Status'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {},
                            icon: const Icon(Icons.calendar_month),
                            label: const Text('Gerar Reunião'),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    // History Section
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Histórico Recente',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        TextButton(
                          onPressed: () {},
                          child: const Text('Ver tudo'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Obx(
                      () => ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: controller.historyList.length,
                        itemBuilder: (context, index) {
                          final item = controller.historyList[index];
                          return _HistoryItemCard(item: item);
                        },
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }
}

class _HistoryItemCard extends StatelessWidget {
  final dynamic item;

  const _HistoryItemCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    IconData icon;
    Color iconColor;
    Color backgroundColor;

    switch (item.type) {
      case 'aiInsight':
        icon = Icons.smart_toy;
        iconColor = Colors.indigo;
        backgroundColor = Colors.indigo.withOpacity(0.1);
        break;
      default:
        icon = Icons.person;
        iconColor = AppColors.primary;
        backgroundColor = AppColors.primary.withOpacity(0.1);
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: backgroundColor,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 16, color: iconColor),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (item.type == 'aiInsight')
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.indigo.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'IA INSIGHT',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: iconColor,
                            ),
                          ),
                        )
                      else
                        Text(
                          item.author,
                          style: Theme.of(context).textTheme.titleSmall
                              ?.copyWith(fontWeight: FontWeight.bold),
                        ),
                      Text(
                        item.dateFormatted,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    item.title,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.description,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
