import 'package:get/get.dart';
import 'package:flutter_modular/flutter_modular.dart';
import '../../../../core/config/dependency_injection.dart';
import '../../../../domain/repositories/auth_repository.dart';

class SettingsController extends GetxController {
  final AuthRepository authRepository = getIt<AuthRepository>();

  final notificationsEnabled = true.obs;

  Future<void> logout() async {
    try {
      await authRepository.logout();
      Modular.to.navigate('/');
    } catch (e) {
      Get.snackbar('Erro', 'Falha ao fazer logout');
    }
  }
}

