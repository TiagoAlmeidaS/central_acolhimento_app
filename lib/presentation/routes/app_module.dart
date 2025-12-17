import 'package:flutter_modular/flutter_modular.dart';
import '../modules/auth/auth_module.dart';
import '../modules/home/home_module.dart';
import '../modules/details/details_module.dart';
import '../modules/summary/summary_module.dart';
import '../modules/settings/settings_module.dart';
import '../modules/chat/chat_module.dart';

class AppModule extends Module {
  @override
  void binds(i) {}

  @override
  void routes(r) {
    r.module('/', module: AuthModule());
    r.module('/home', module: HomeModule());
    r.module('/details', module: DetailsModule());
    r.module('/summary', module: SummaryModule());
    r.module('/settings', module: SettingsModule());
    r.module('/chat', module: ChatModule());
  }
}

