import 'package:flutter/material.dart';
import 'package:flutter_modular/flutter_modular.dart';
import '../../../core/constants/app_colors.dart';

class PendingPage extends StatelessWidget {
  const PendingPage({super.key});

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      appBar: AppBar(
        title: const Text('Central de Acolhimento'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline),
            onPressed: () {},
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Illustration
              Container(
                width: 280,
                height: 280,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: AppColors.primary.withOpacity(0.05),
                ),
                child: const Icon(
                  Icons.hourglass_top,
                  size: 120,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 32),
              // Title
              Text(
                'Cadastro em Análise',
                style: Theme.of(context).textTheme.headlineLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              // Description
              Text(
                'Sua solicitação foi recebida com sucesso. Nossa equipe de liderança está validando seu perfil.',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
                maxLines: 3,
              ),
              const SizedBox(height: 48),
              // Stepper
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _StepperItem(
                    icon: Icons.check,
                    label: 'Enviado',
                    isCompleted: true,
                  ),
                  _StepperItem(
                    icon: Icons.hourglass_top,
                    label: 'Análise',
                    isActive: true,
                  ),
                  _StepperItem(
                    icon: Icons.lock_open,
                    label: 'Acesso',
                    isCompleted: false,
                  ),
                ],
              ),
              const SizedBox(height: 48),
              // Actions
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Verificar Status'),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton(
                  onPressed: () => Modular.to.navigate('/'),
                  style: OutlinedButton.styleFrom(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Sair / Logout'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StepperItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isCompleted;
  final bool isActive;

  const _StepperItem({
    required this.icon,
    required this.label,
    this.isCompleted = false,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    Color backgroundColor;
    Color iconColor;
    
    if (isCompleted) {
      backgroundColor = Colors.green;
      iconColor = Colors.white;
    } else if (isActive) {
      backgroundColor = AppColors.primary;
      iconColor = Colors.white;
    } else {
      backgroundColor = isDark
          ? Colors.grey.shade700
          : Colors.grey.shade300;
      iconColor = isDark
          ? Colors.grey.shade500
          : Colors.grey.shade600;
    }

    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: backgroundColor,
            shape: BoxShape.circle,
            border: Border.all(
              color: isDark
                  ? AppColors.backgroundDark
                  : AppColors.backgroundLight,
              width: 4,
            ),
          ),
          child: Icon(
            icon,
            size: 16,
            color: iconColor,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            color: isActive ? AppColors.primary : Colors.grey,
          ),
        ),
      ],
    );
  }
}

