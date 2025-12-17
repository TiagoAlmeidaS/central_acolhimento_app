import 'package:flutter_modular/flutter_modular.dart';
import 'settings_page.dart';

class SettingsModule extends Module {
  @override
  void binds(i) {}

  @override
  void routes(r) {
    r.child('/', child: (_) => const SettingsPage());
  }
}

