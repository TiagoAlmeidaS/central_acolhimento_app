import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ChatMessage {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;

  ChatMessage({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
  });
}

class ChatController extends GetxController {
  final messages = <ChatMessage>[].obs;
  final isLoading = false.obs;
  final messageController = TextEditingController();

  @override
  void onInit() {
    super.onInit();
    // Add initial message
    messages.add(ChatMessage(
      id: '1',
      text:
          'Olá! Como posso ajudar na Central de Acolhimento hoje? Você pode cadastrar novos irmãos, consultar status ou buscar orientações.',
      isUser: false,
      timestamp: DateTime.now(),
    ));
  }

  Future<void> sendMessage() async {
    if (messageController.text.trim().isEmpty) return;

    final userMessage = ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      text: messageController.text,
      isUser: true,
      timestamp: DateTime.now(),
    );

    messages.add(userMessage);
    messageController.clear();

    // Simulate AI response
    isLoading.value = true;
    await Future.delayed(const Duration(seconds: 1));
    isLoading.value = false;

    messages.add(ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      text: 'Entendido. Como posso ajudar com isso?',
      isUser: false,
      timestamp: DateTime.now(),
    ));
  }

  @override
  void onClose() {
    messageController.dispose();
    super.onClose();
  }
}

