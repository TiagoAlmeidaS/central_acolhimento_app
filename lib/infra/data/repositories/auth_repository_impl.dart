import 'package:shared_preferences/shared_preferences.dart';
import '../../../domain/entities/caregiver.dart';
import '../../../domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final SharedPreferences sharedPreferences;
  static const String _isAuthenticatedKey = 'is_authenticated';
  static const String _caregiverPhoneKey = 'caregiver_phone';

  AuthRepositoryImpl(this.sharedPreferences);

  @override
  Future<void> loginWithWhatsApp() async {
    // TODO: Implementar integração real com WhatsApp
    await Future.delayed(const Duration(milliseconds: 500));
    await sharedPreferences.setBool(_isAuthenticatedKey, true);
  }

  @override
  Future<void> registerCaregiver(Caregiver caregiver) async {
    // TODO: Implementar registro real
    await Future.delayed(const Duration(milliseconds: 500));
    await sharedPreferences.setString(_caregiverPhoneKey, caregiver.phone);
  }

  @override
  Future<String> checkRegistrationStatus(String phone) async {
    // TODO: Implementar verificação real de status
    await Future.delayed(const Duration(milliseconds: 300));
    return 'pending'; // pending, approved, rejected
  }

  @override
  Future<void> logout() async {
    await sharedPreferences.remove(_isAuthenticatedKey);
    await sharedPreferences.remove(_caregiverPhoneKey);
  }

  @override
  Future<bool> isAuthenticated() async {
    return sharedPreferences.getBool(_isAuthenticatedKey) ?? false;
  }
}

