import 'package:flutter_modular/flutter_modular.dart';
import 'auth_controller.dart';
import 'login_page.dart';
import 'register_page.dart';
import 'pending_page.dart';

class AuthModule extends Module {
  @override
  void binds(i) {
    i.addSingleton(AuthController.new);
  }

  @override
  void routes(r) {
    r.child('/', child: (_) => const LoginPage());
    r.child('/register', child: (_) => const RegisterPage());
    r.child('/pending', child: (_) => const PendingPage());
  }
}

