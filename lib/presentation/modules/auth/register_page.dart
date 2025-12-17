import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/constants/app_colors.dart';
import 'auth_controller.dart';
import '../../widgets/back_button.dart';

class RegisterPage extends StatelessWidget {
  const RegisterPage({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<AuthController>();

    return Scaffold(
      appBar: AppBar(
        leading: const AppBackButton(),
        title: const Text('Cadastro de Cuidador'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Image
            Container(
              height: 160,
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withOpacity(0.6),
                  ],
                ),
              ),
              child: Stack(
                children: [
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.network(
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuAmVXjcFoovOxD9LBIhGFCDraUHjyL-yh4w3TQHCt-0vv_eOqUL6hyEhw_TJ8rEkwTVNPFUThlMRFO-FnG3amrzwhUnxTNYJrEg_YwmD8CyzxKbSNl5xlauky0FaNcywTaK2VVGIxyC2JOREUhSa1-5XuuKJWNIDAobfRgk7mqKjD0xbTBqgK9B7IxY7DEyv-I-wVB8rPvUiNbcWkJitK1mqbd7hKso3ShODujwZ5FhFNR7QDDwPiTfI0KPSYqQXeuEGhMm_r6AzcRD',
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 12,
                    left: 16,
                    child: Text(
                      'Central de Acolhimento',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Junte-se à equipe',
              style: Theme.of(context).textTheme.headlineLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'Preencha os campos abaixo para solicitar seu acesso como cuidador e comece a impactar vidas.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            // Form Fields
            TextField(
              controller: controller.fullNameController,
              decoration: const InputDecoration(
                labelText: 'Nome Completo',
                hintText: 'Ex: Maria Silva',
                prefixIcon: Icon(Icons.person),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: controller.phoneController,
              decoration: const InputDecoration(
                labelText: 'Telefone (Whatsapp)',
                hintText: '(00) 00000-0000',
                prefixIcon: Icon(Icons.phone_iphone),
              ),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  flex: 1,
                  child: DropdownButtonFormField<String>(
                    value: controller.stateController.text.isEmpty
                        ? null
                        : controller.stateController.text,
                    decoration: const InputDecoration(
                      labelText: 'Estado',
                      prefixIcon: Icon(Icons.location_city),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'SP', child: Text('SP')),
                      DropdownMenuItem(value: 'RJ', child: Text('RJ')),
                      DropdownMenuItem(value: 'MG', child: Text('MG')),
                    ],
                    onChanged: (value) {
                      controller.stateController.text = value ?? '';
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: TextField(
                    controller: controller.cityController,
                    decoration: const InputDecoration(
                      labelText: 'Cidade',
                      hintText: 'Nome da cidade',
                      prefixIcon: Icon(Icons.location_city),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextField(
              controller: controller.churchLocationController,
              decoration: const InputDecoration(
                labelText: 'Localidade da Igreja',
                hintText: 'Ex: Central - Zona Sul',
                prefixIcon: Icon(Icons.church),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: controller.biographyController,
              decoration: const InputDecoration(
                labelText: 'Mini-biografia',
                hintText: 'Conte um pouco sobre sua experiência...',
                alignLabelWithHint: true,
              ),
              maxLines: 5,
            ),
            const SizedBox(height: 32),
            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: Obx(
                () => ElevatedButton(
                  onPressed: controller.isLoading.value
                      ? null
                      : controller.register,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28),
                    ),
                    elevation: 8,
                  ),
                  child: controller.isLoading.value
                      ? const CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Text(
                              'Solicitar Acesso',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(width: 8),
                            Icon(Icons.arrow_forward),
                          ],
                        ),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

