import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/option_card.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/progress_header.dart';
import '../onboarding_controller.dart';

class GoalSelectionScreen extends ConsumerWidget {
  const GoalSelectionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(onboardingControllerProvider);
    final controller = ref.read(onboardingControllerProvider.notifier);

    final selectedGoal = state.goal.type;

    String getGoalFeedback(String goal) {
      switch (goal) {
        case 'muscle_gain':
          return "We'll shape your nutrition around controlled muscle growth and strength.";
        case 'fat_loss':
          return "We'll optimize your plan for fat loss while preserving your hard-earned muscle.";
        case 'recomposition':
          return "We'll balance macros to build muscle while gradually trimming body fat.";
        case 'maintenance':
          return "We'll ensure consistent calorie balance to maintain your current physique.";
        default:
          return '';
      }
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePaddingHorizontal),
          child: Column(
            children: [
              ProgressHeader(
                currentStep: 1,
                title: 'What are you working toward?',
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppSpacing.lg),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      OptionCard(
                        title: 'Build Muscle',
                        description: 'Gain size and strength with a controlled calorie surplus.',
                        icon: Icons.fitness_center,
                        isSelected: selectedGoal == 'muscle_gain',
                        onTap: () => controller.setGoal('muscle_gain'),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      OptionCard(
                        title: 'Lose Fat',
                        description: 'Reduce body fat while preserving lean muscle mass.',
                        icon: Icons.local_fire_department,
                        isSelected: selectedGoal == 'fat_loss',
                        onTap: () => controller.setGoal('fat_loss'),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      OptionCard(
                        title: 'Body Recomposition',
                        description: 'Build muscle while gradually reducing body fat.',
                        icon: Icons.transform,
                        isSelected: selectedGoal == 'recomposition',
                        onTap: () => controller.setGoal('recomposition'),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      OptionCard(
                        title: 'Maintain',
                        description: 'Maintain your current weight, performance, and routine.',
                        icon: Icons.shield,
                        isSelected: selectedGoal == 'maintenance',
                        onTap: () => controller.setGoal('maintenance'),
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 200),
                        child: Container(
                          key: ValueKey(selectedGoal),
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: AppColors.primaryLight,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.info_outline, color: AppColors.primary, size: 20),
                              const SizedBox(width: AppSpacing.md),
                              Expanded(
                                child: Text(
                                  getGoalFeedback(selectedGoal),
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.primaryDark,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              PrimaryButton(
                text: 'Continue',
                onPressed: () => context.push('/onboarding/body'),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}
