import 'package:flutter/material.dart';

class AnimatedNumber extends StatefulWidget {
  final num number;
  final TextStyle textStyle;
  final String suffix;
  final Duration duration;

  const AnimatedNumber({
    super.key,
    required this.number,
    required this.textStyle,
    this.suffix = '',
    this.duration = const Duration(milliseconds: 800),
  });

  @override
  State<AnimatedNumber> createState() => _AnimatedNumberState();
}

class _AnimatedNumberState extends State<AnimatedNumber> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _animation = Tween<double>(begin: 0, end: widget.number.toDouble()).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );
    _controller.forward();
  }

  @override
  void didUpdateWidget(AnimatedNumber oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.number != widget.number) {
      _animation = Tween<double>(begin: oldWidget.number.toDouble(), end: widget.number.toDouble()).animate(
        CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
      );
      _controller.forward(from: 0);
    }
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
        final val = _animation.value;
        final formatted = widget.number is int ? val.round().toString() : val.toStringAsFixed(1);
        return Text(
          '$formatted${widget.suffix}',
          style: widget.textStyle,
        );
      },
    );
  }
}
