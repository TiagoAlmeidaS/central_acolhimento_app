import 'package:flutter_modular/flutter_modular.dart';
import 'chat_page.dart';

class ChatModule extends Module {
  @override
  void binds(i) {}

  @override
  void routes(r) {
    r.child('/', child: (_) => const ChatPage());
  }
}

