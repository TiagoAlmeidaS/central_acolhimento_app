import '../../repositories/auth_repository.dart';

class LoginUseCase {
  final AuthRepository repository;

  LoginUseCase(this.repository);

  Future<void> call() async {
    return await repository.loginWithWhatsApp();
  }
}

