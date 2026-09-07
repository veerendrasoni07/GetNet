import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/primary_button.dart';

class IntroScreen extends StatelessWidget {
  const IntroScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePaddingHorizontal),
          child: Column(
            children: [
              const Spacer(),
              // Minimal Illustration / Icon Header
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.fitness_center_rounded,
                  size: 48,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: AppSpacing.xxl),
              const Text(
                'A diet built around your life.',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.xl),
              const Column(
                children: [
                  _ValueBullet(text: 'Your body'),
                  SizedBox(height: AppSpacing.sm),
                  _ValueBullet(text: 'Your routine'),
                  SizedBox(height: AppSpacing.sm),
                  _ValueBullet(text: 'Your budget'),
                  SizedBox(height: AppSpacing.sm),
                  _ValueBullet(text: 'Your goal'),
                ],
              ),
              const Spacer(),
              PrimaryButton(
                text: 'Build My Plan',
                onPressed: () => context.push('/onboarding/goal'),
              ),
              const SizedBox(height: AppSpacing.md),
              const Text(
                'Takes only a few minutes • No signup required to start',
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        ),
      ),
    );
  }
}

class _ValueBullet extends StatelessWidget {
  final String text;

  const _ValueBullet({required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.check_circle_rounded, size: 18, color: AppColors.primary),
        const SizedBox(width: AppSpacing.sm),
        Text(
          text,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
