import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_modular/flutter_modular.dart';
import '../../../core/constants/app_colors.dart';
import 'auth_controller.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(AuthController());
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Logo
                    Container(
                      width: 128,
                      height: 128,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        color: isDark
                            ? AppColors.surfaceDark
                            : AppColors.surfaceLight,
                        border: Border.all(
                          color: isDark
                              ? Colors.grey.shade700
                              : Colors.grey.shade200,
                        ),
                      ),
                      child: const Icon(
                        Icons.church,
                        size: 64,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Title
                    Text(
                      'Central de Acolhimento',
                      style: Theme.of(context).textTheme.displayMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    // Subtitle
                    Text(
                      'Gerencie e cuide dos irmãos assistidos com amor e eficiência.',
                      style: Theme.of(context).textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                      maxLines: 2,
                    ),
                  ],
                ),
              ),
              // Actions
              Column(
                children: [
                  // WhatsApp Button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: Obx(
                      () => ElevatedButton(
                        onPressed: controller.isLoading.value
                            ? null
                            : controller.loginWithWhatsApp,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.whatsappGreen,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 4,
                        ),
                        child: controller.isLoading.value
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Colors.white,
                                  ),
                                ),
                              )
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: const [
                                  Icon(Icons.chat_bubble_outline, size: 24),
                                  SizedBox(width: 8),
                                  Text(
                                    'Entrar com WhatsApp',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Register Link
                  Text(
                    'Ainda não é um cuidador?',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  TextButton(
                    onPressed: () => Modular.to.navigate('/register'),
                    child: const Text(
                      'Cadastre-se aqui',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Footer
                  Text(
                    'Ao entrar, você concorda com nossos\nTermos de Uso e Política de Privacidade',
                    style: Theme.of(context).textTheme.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

