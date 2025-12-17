import 'package:flutter/material.dart';
import 'package:flutter_modular/flutter_modular.dart';
import 'core/config/dependency_injection.dart';
import 'core/theme/app_theme.dart';
import 'presentation/routes/app_module.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await setupDependencyInjection();
  runApp(ModularApp(module: AppModule(), child: const MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Central de Acolhimento',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: Modular.routerConfig,
    );
  }
}
