import '../entities/caregiver.dart';

abstract class AuthRepository {
  Future<void> loginWithWhatsApp();
  Future<void> registerCaregiver(Caregiver caregiver);
  Future<String> checkRegistrationStatus(String phone);
  Future<void> logout();
  Future<bool> isAuthenticated();
}

