import '../../entities/caregiver.dart';
import '../../repositories/auth_repository.dart';

class RegisterUseCase {
  final AuthRepository repository;

  RegisterUseCase(this.repository);

  Future<void> call(Caregiver caregiver) async {
    return await repository.registerCaregiver(caregiver);
  }
}

