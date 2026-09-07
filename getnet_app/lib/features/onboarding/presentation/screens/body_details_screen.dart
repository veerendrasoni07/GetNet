import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/progress_header.dart';
import '../onboarding_controller.dart';

class BodyDetailsScreen extends ConsumerWidget {
  const BodyDetailsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(onboardingControllerProvider);
    final controller = ref.read(onboardingControllerProvider.notifier);
    final p = state.physique;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePaddingHorizontal),
          child: Column(
            children: [
              ProgressHeader(
                currentStep: 1,
                title: 'Tell us about your body',
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppSpacing.lg),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Target Weight Animated Arrow Indicator
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                children: [
                                  const Text('Current Weight', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                  const SizedBox(height: 4),
                                  FittedBox(
                                    fit: BoxFit.scaleDown,
                                    child: Text('${p.weightKg.toInt()} kg', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                                  ),
                                ],
                              ),
                            ),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                              child: Icon(Icons.arrow_forward_rounded, color: AppColors.primary, size: 28),
                            ),
                            Expanded(
                              child: Column(
                                children: [
                                  const Text('Target Weight', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                  const SizedBox(height: 4),
                                  FittedBox(
                                    fit: BoxFit.scaleDown,
                                    child: Text('${p.targetWeightKg.toInt()} kg', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Sex Selection
                      const Text('Sex', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      const SizedBox(height: AppSpacing.sm),
                      Row(
                        children: [
                          Expanded(
                            child: _ChoiceChipButton(
                              text: 'Male',
                              isSelected: p.sex == 'male',
                              onTap: () => controller.updatePhysique(sex: 'male'),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: _ChoiceChipButton(
                              text: 'Female',
                              isSelected: p.sex == 'female',
                              onTap: () => controller.updatePhysique(sex: 'female'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.lg),

                      // Age & Height Sliders/Controls
                      Row(
                        children: [
                          Expanded(
                            child: _NumberInputField(
                              label: 'Age',
                              value: '${p.age} yrs',
                              onDecrement: () => controller.updatePhysique(age: (p.age - 1).clamp(14, 80)),
                              onIncrement: () => controller.updatePhysique(age: (p.age + 1).clamp(14, 80)),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: _NumberInputField(
                              label: 'Height',
                              value: '${p.heightCm.toInt()} cm',
                              onDecrement: () => controller.updatePhysique(heightCm: (p.heightCm - 1).clamp(120, 220)),
                              onIncrement: () => controller.updatePhysique(heightCm: (p.heightCm + 1).clamp(120, 220)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.lg),

                      // Weight & Target Weight Controls
                      Row(
                        children: [
                          Expanded(
                            child: _NumberInputField(
                              label: 'Current Weight',
                              value: '${p.weightKg.toInt()} kg',
                              onDecrement: () => controller.updatePhysique(weightKg: (p.weightKg - 1).clamp(30, 200)),
                              onIncrement: () => controller.updatePhysique(weightKg: (p.weightKg + 1).clamp(30, 200)),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: _NumberInputField(
                              label: 'Target Weight',
                              value: '${p.targetWeightKg.toInt()} kg',
                              onDecrement: () => controller.updatePhysique(targetWeightKg: (p.targetWeightKg - 1).clamp(30, 200)),
                              onIncrement: () => controller.updatePhysique(targetWeightKg: (p.targetWeightKg + 1).clamp(30, 200)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xl),
                    ],
                  ),
                ),
              ),
              PrimaryButton(
                text: 'Continue',
                onPressed: () => context.push('/onboarding/training'),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}

class _ChoiceChipButton extends StatelessWidget {
  final String text;
  final bool isSelected;
  final VoidCallback onTap;

  const _ChoiceChipButton({required this.text, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryLight : AppColors.surface,
          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
          border: Border.all(color: isSelected ? AppColors.primary : AppColors.border, width: isSelected ? 2 : 1),
        ),
        child: Center(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: isSelected ? AppColors.primaryDark : AppColors.textPrimary,
            ),
          ),
        ),
      ),
    );
  }
}

class _NumberInputField extends StatelessWidget {
  final String label;
  final String value;
  final VoidCallback onDecrement;
  final VoidCallback onIncrement;

  const _NumberInputField({required this.label, required this.value, required this.onDecrement, required this.onIncrement});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          const SizedBox(height: AppSpacing.xs),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                onPressed: onDecrement,
                icon: const Icon(Icons.remove_circle_outline, size: 20, color: AppColors.primary),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
              ),
              Expanded(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    value,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                ),
              ),
              IconButton(
                onPressed: onIncrement,
                icon: const Icon(Icons.add_circle_outline, size: 20, color: AppColors.primary),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
