import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/progress_header.dart';
import '../../domain/schedule_calculator.dart';
import '../onboarding_controller.dart';

class RoutineScheduleScreen extends ConsumerWidget {
  const RoutineScheduleScreen({super.key});

  TimeOfDay _parseTimeOfDay(String timeStr, int defaultHour, int defaultMinute) {
    try {
      final parts = timeStr.split(':');
      if (parts.length >= 2) {
        return TimeOfDay(
          hour: int.tryParse(parts[0]) ?? defaultHour,
          minute: int.tryParse(parts[1].split(' ')[0]) ?? defaultMinute,
        );
      }
    } catch (_) {}
    return TimeOfDay(hour: defaultHour, minute: defaultMinute);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(onboardingControllerProvider);
    final controller = ref.read(onboardingControllerProvider.notifier);
    final l = state.lifestyle;

    final derivedWindows = deriveEatingWindows(
      wakeTime: l.wakeTime,
      collegeStartTime: l.workOrCollegeStartTime,
      collegeEndTime: l.workOrCollegeEndTime,
      workoutTime: state.training.usualWorkoutTime,
      sleepTime: l.sleepTime,
      workoutDurationMinutes: state.training.workoutDurationMinutes,
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePaddingHorizontal),
          child: Column(
            children: [
              ProgressHeader(
                currentStep: 6,
                title: 'Your Daily Routine',
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppSpacing.lg),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Tell us about your day. We will automatically derive your eating windows.',
                        style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Routine Timeline List
                      _RoutineTimelineItem(
                        timeStr: l.wakeTime,
                        label: 'Wake Up',
                        icon: Icons.wb_sunny_outlined,
                        onTap: () async {
                          final current = _parseTimeOfDay(l.wakeTime, 7, 0);
                          final t = await showTimePicker(context: context, initialTime: current);
                          if (t != null) controller.updateLifestyle(wakeTime: '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}');
                        },
                      ),
                      _RoutineTimelineItem(
                        timeStr: l.workOrCollegeStartTime,
                        label: 'College / Work Starts',
                        icon: Icons.school_outlined,
                        onTap: () async {
                          final current = _parseTimeOfDay(l.workOrCollegeStartTime, 9, 0);
                          final t = await showTimePicker(context: context, initialTime: current);
                          if (t != null) controller.updateLifestyle(workOrCollegeStartTime: '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}');
                        },
                      ),
                      _RoutineTimelineItem(
                        timeStr: l.workOrCollegeEndTime,
                        label: 'College / Work Ends',
                        icon: Icons.business_outlined,
                        onTap: () async {
                          final current = _parseTimeOfDay(l.workOrCollegeEndTime, 16, 0);
                          final t = await showTimePicker(context: context, initialTime: current);
                          if (t != null) controller.updateLifestyle(workOrCollegeEndTime: '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}');
                        },
                      ),
                      _RoutineTimelineItem(
                        timeStr: state.training.usualWorkoutTime,
                        label: 'Workout',
                        icon: Icons.fitness_center,
                        onTap: () async {
                          final current = _parseTimeOfDay(state.training.usualWorkoutTime, 18, 0);
                          final t = await showTimePicker(context: context, initialTime: current);
                          if (t != null) controller.updateTraining(usualWorkoutTime: '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}');
                        },
                      ),
                      _RoutineTimelineItem(
                        timeStr: l.sleepTime,
                        label: 'Sleep',
                        icon: Icons.bedtime_outlined,
                        onTap: () async {
                          final current = _parseTimeOfDay(l.sleepTime, 0, 0);
                          final t = await showTimePicker(context: context, initialTime: current);
                          if (t != null) controller.updateLifestyle(sleepTime: '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}');
                        },
                      ),

                      const SizedBox(height: AppSpacing.xl),
                      // Derived Eating Windows Suggestion Box
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.auto_awesome, color: AppColors.primary, size: 20),
                                SizedBox(width: AppSpacing.sm),
                                Expanded(
                                  child: Text(
                                    'Suggested Eating Windows Derived:',
                                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            ...derivedWindows.map(
                              (w) => Padding(
                                padding: const EdgeInsets.only(top: 2.0),
                                child: Text(
                                  '• ${w.name}: ${w.displayRange}',
                                  style: const TextStyle(fontSize: 12, color: AppColors.primaryDark, height: 1.4),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              PrimaryButton(
                text: 'Review My Profile',
                onPressed: () => context.push('/onboarding/review'),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoutineTimelineItem extends StatelessWidget {
  final String timeStr;
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const _RoutineTimelineItem({required this.timeStr, required this.label, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppColors.primary, size: 22),
            const SizedBox(width: AppSpacing.md),
            Expanded(child: Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500))),
            Text(timeStr, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primary)),
            const SizedBox(width: AppSpacing.xs),
            const Icon(Icons.edit, size: 16, color: AppColors.textSecondary),
          ],
        ),
      ),
    );
  }
}
