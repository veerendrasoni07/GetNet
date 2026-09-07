import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/progress_header.dart';
import '../onboarding_controller.dart';

class TrainingProfileScreen extends ConsumerWidget {
  const TrainingProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(onboardingControllerProvider);
    final controller = ref.read(onboardingControllerProvider.notifier);
    final t = state.training;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePaddingHorizontal),
          child: Column(
            children: [
              ProgressHeader(
                currentStep: 2,
                title: 'How do you train?',
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppSpacing.lg),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Resistance Training Check
                      const Text('Do you lift weights?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      const SizedBox(height: AppSpacing.sm),
                      Row(
                        children: [
                          Expanded(
                            child: _SelectButton(
                              label: 'Yes, I lift',
                              isSelected: t.resistanceTraining,
                              onTap: () => controller.updateTraining(resistanceTraining: true),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: _SelectButton(
                              label: 'Not currently',
                              isSelected: !t.resistanceTraining,
                              onTap: () => controller.updateTraining(resistanceTraining: false),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Days Per Week Selector (1..7)
                      const Text('Training days per week', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      const SizedBox(height: AppSpacing.sm),
                      Row(
                        children: List.generate(7, (index) {
                          final day = index + 1;
                          final isSelected = t.trainingDaysPerWeek == day;
                          return Expanded(
                            child: Padding(
                              padding: EdgeInsets.only(right: index < 6 ? 4.0 : 0.0),
                              child: GestureDetector(
                                onTap: () => controller.updateTraining(trainingDaysPerWeek: day),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 150),
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: isSelected ? AppColors.primary : AppColors.surface,
                                    borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                                    border: Border.all(
                                      color: isSelected ? AppColors.primary : AppColors.border,
                                    ),
                                  ),
                                  child: Center(
                                    child: FittedBox(
                                      fit: BoxFit.scaleDown,
                                      child: Text(
                                        '$day',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15,
                                          color: isSelected ? Colors.white : AppColors.textPrimary,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          );
                        }),
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Workout Duration Options
                      const Text('Workout duration', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      const SizedBox(height: AppSpacing.sm),
                      Wrap(
                        spacing: AppSpacing.sm,
                        runSpacing: AppSpacing.xs,
                        children: [30, 45, 60, 75, 90].map((duration) {
                          final isSelected = t.workoutDurationMinutes == duration;
                          return ChoiceChip(
                            label: Text('$duration min'),
                            selected: isSelected,
                            selectedColor: AppColors.primaryLight,
                            onSelected: (_) => controller.updateTraining(workoutDurationMinutes: duration),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Usual Workout Time Selector
                      const Text('Usual workout time', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      const SizedBox(height: AppSpacing.sm),
                      InkWell(
                        onTap: () async {
                          TimeOfDay initialTime = const TimeOfDay(hour: 18, minute: 0);
                          try {
                            final parts = t.usualWorkoutTime.split(':');
                            if (parts.length == 2) {
                              initialTime = TimeOfDay(hour: int.parse(parts[0]), minute: int.parse(parts[1]));
                            }
                          } catch (_) {}

                          final picked = await showTimePicker(
                            context: context,
                            initialTime: initialTime,
                          );
                          if (picked != null) {
                            final hourStr = picked.hour.toString().padLeft(2, '0');
                            final minStr = picked.minute.toString().padLeft(2, '0');
                            controller.updateTraining(usualWorkoutTime: '$hourStr:$minStr');
                          }
                        },
                        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 14),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Expanded(
                                child: Row(
                                  children: [
                                    Icon(Icons.access_time_rounded, color: AppColors.primary, size: 22),
                                    SizedBox(width: AppSpacing.md),
                                    Flexible(
                                      child: Text(
                                        'Workout Timing',
                                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: AppSpacing.sm),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryLight,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      _formatTimeDisplay(t.usualWorkoutTime),
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.primaryDark,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    const Icon(Icons.edit, size: 14, color: AppColors.primary),
                                  ],
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
                onPressed: () => context.push('/onboarding/living'),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }

  String _formatTimeDisplay(String timeStr) {
    try {
      final parts = timeStr.split(':');
      final hour = int.parse(parts[0]);
      final minute = int.parse(parts[1]);
      final period = hour >= 12 ? 'PM' : 'AM';
      final displayHour = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour);
      final displayMinute = minute.toString().padLeft(2, '0');
      return '$displayHour:$displayMinute $period';
    } catch (_) {
      return timeStr;
    }
  }
}

class _SelectButton extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _SelectButton({required this.label, required this.isSelected, required this.onTap});

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
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4.0),
            child: FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: isSelected ? AppColors.primaryDark : AppColors.textPrimary,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
