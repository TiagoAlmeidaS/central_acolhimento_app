import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AppBackButton extends StatelessWidget {
  final Color? color;
  final VoidCallback? onPressed;

  const AppBackButton({
    super.key,
    this.color,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: onPressed ?? () => Get.back(),
      icon: Icon(
        Icons.arrow_back,
        color: color ?? Theme.of(context).iconTheme.color,
      ),
      style: IconButton.styleFrom(
        backgroundColor: Colors.transparent,
        shape: const CircleBorder(),
      ),
    );
  }
}

