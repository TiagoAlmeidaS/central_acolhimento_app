import 'package:flutter_modular/flutter_modular.dart';
import 'details_page.dart';

class DetailsModule extends Module {
  @override
  void binds(i) {}

  @override
  void routes(r) {
    r.child('/:id', child: (_) {
      final id = r.args.params['id'] ?? '';
      return DetailsPage(id: id);
    });
  }
}

