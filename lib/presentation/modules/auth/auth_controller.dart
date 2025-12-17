import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_modular/flutter_modular.dart';
import '../../../../core/config/dependency_injection.dart';
import '../../../../domain/entities/caregiver.dart';
import '../../../../domain/usecases/auth/login_usecase.dart';
import '../../../../domain/usecases/auth/register_usecase.dart';

class AuthController extends GetxController {
  final LoginUseCase loginUseCase = getIt<LoginUseCase>();
  final RegisterUseCase registerUseCase = getIt<RegisterUseCase>();

  final isLoading = false.obs;
  final registrationStatus = 'pending'.obs;

  // Register form fields
  final fullNameController = TextEditingController();
  final phoneController = TextEditingController();
  final stateController = TextEditingController();
  final cityController = TextEditingController();
  final churchLocationController = TextEditingController();
  final biographyController = TextEditingController();

  Future<void> loginWithWhatsApp() async {
    try {
      isLoading.value = true;
      await loginUseCase();
      Modular.to.navigate('/home');
    } catch (e) {
      Get.snackbar('Erro', 'Falha ao fazer login');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> register() async {
    try {
      isLoading.value = true;
      final caregiver = Caregiver(
        fullName: fullNameController.text,
        phone: phoneController.text,
        state: stateController.text,
        city: cityController.text,
        churchLocation: churchLocationController.text,
        biography: biographyController.text,
      );
      await registerUseCase(caregiver);
      Modular.to.navigate('/pending');
    } catch (e) {
      Get.snackbar('Erro', 'Falha ao registrar');
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    fullNameController.dispose();
    phoneController.dispose();
    stateController.dispose();
    cityController.dispose();
    churchLocationController.dispose();
    biographyController.dispose();
    super.onClose();
  }
}

