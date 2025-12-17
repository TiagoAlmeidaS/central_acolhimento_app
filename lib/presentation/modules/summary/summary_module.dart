import 'package:flutter_modular/flutter_modular.dart';
import 'summary_page.dart';

class SummaryModule extends Module {
  @override
  void binds(i) {}

  @override
  void routes(r) {
    r.child('/', child: (_) => const SummaryPage());
  }
}

