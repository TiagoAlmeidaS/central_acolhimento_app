import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/constants/app_colors.dart';
import '../../widgets/back_button.dart';
import '../../widgets/bottom_navigation.dart';
import '../chat/chat_controller.dart';

class ChatPage extends StatelessWidget {
  const ChatPage({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(ChatController());
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: const AppBackButton(),
        title: Row(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: AppColors.primary.withOpacity(0.1),
                  child: const Icon(Icons.smart_toy, color: AppColors.primary),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isDark
                            ? AppColors.backgroundDark
                            : Colors.white,
                        width: 2,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'ChatAI',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                Text(
                  'Assistente Virtual',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Messages List
          Expanded(
            child: Obx(
              () => ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: controller.messages.length +
                    (controller.isLoading.value ? 1 : 0),
                itemBuilder: (context, index) {
                  if (index == controller.messages.length) {
                    return _TypingIndicator();
                  }
                  final message = controller.messages[index];
                  return _MessageBubble(message: message);
                },
              ),
            ),
          ),
          // Input Area
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.backgroundDark : Colors.white,
              border: Border(
                top: BorderSide(
                  color: isDark ? Colors.grey.shade700 : Colors.grey.shade200,
                ),
              ),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline),
                    onPressed: () {},
                  ),
                  Expanded(
                    child: TextField(
                      controller: controller.messageController,
                      decoration: InputDecoration(
                        hintText: 'Digite uma mensagem...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: isDark
                            ? AppColors.surfaceDark
                            : Colors.grey.shade100,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      maxLines: null,
                      textCapitalization: TextCapitalization.sentences,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.mic),
                    onPressed: () {},
                  ),
                  Obx(
                    () => IconButton(
                      icon: controller.isLoading.value
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.send,
                                color: Colors.white,
                                size: 20,
                              ),
                            ),
                      onPressed: controller.isLoading.value
                          ? null
                          : controller.sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: const BottomNavigation(currentRoute: '/chat'),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final dynamic message;

  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment:
            message.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!message.isUser) ...[
            CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.primary.withOpacity(0.1),
              child: const Icon(Icons.smart_toy, size: 16),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: message.isUser
                    ? AppColors.primary
                    : (isDark ? AppColors.surfaceDark : Colors.white),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(20),
                  topRight: const Radius.circular(20),
                  bottomLeft: Radius.circular(message.isUser ? 20 : 0),
                  bottomRight: Radius.circular(message.isUser ? 0 : 20),
                ),
              ),
              child: Text(
                message.text,
                style: TextStyle(
                  color: message.isUser
                      ? Colors.white
                      : (isDark ? Colors.white : Colors.black),
                ),
              ),
            ),
          ),
          if (message.isUser) ...[
            const SizedBox(width: 8),
            const Icon(Icons.done_all, size: 16, color: Colors.grey),
          ],
        ],
      ),
    );
  }
}

class _TypingIndicator extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: AppColors.primary.withOpacity(0.1),
            child: const Icon(Icons.smart_toy, size: 16),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.surfaceDark
                  : Colors.white,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _Dot(delay: 0),
                const SizedBox(width: 4),
                _Dot(delay: 200),
                const SizedBox(width: 4),
                _Dot(delay: 400),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Dot extends StatefulWidget {
  final int delay;

  const _Dot({required this.delay});

  @override
  State<_Dot> createState() => _DotState();
}

class _DotState extends State<_Dot> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _animation = Tween<double>(begin: 0.0, end: 1.0).animate(_controller);
    Future.delayed(Duration(milliseconds: widget.delay), () {
      _controller.repeat(reverse: true);
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Opacity(
          opacity: _animation.value,
          child: Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(
              color: Colors.grey,
              shape: BoxShape.circle,
            ),
          ),
        );
      },
    );
  }
}

