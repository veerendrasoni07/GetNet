import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/primary_button.dart';
import '../onboarding_controller.dart';
import 'plan_loading_screen.dart';

class OnboardingReviewScreen extends ConsumerWidget {
  const OnboardingReviewScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(onboardingControllerProvider);
    final hasExistingPlan = ref.watch(latestGeneratedPlanProvider) != null;
    final p = state.physique;
    final g = state.goal;
    final t = state.training;
    final l = state.lifestyle;
    final b = state.budget;
    final pref = state.preferences;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          hasExistingPlan ? 'Profile & Plan Settings' : 'Review Your Profile',
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/dashboard');
            }
          },
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePaddingHorizontal),
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      const SizedBox(height: AppSpacing.md),
                      _ReviewSectionCard(
                        title: 'Goal',
                        value: g.type.replaceAll('_', ' ').toUpperCase(),
                        onEdit: () => context.push('/onboarding/goal'),
                      ),
                      _ReviewSectionCard(
                        title: 'Body Target',
                        value: '${p.weightKg.toInt()} kg → ${p.targetWeightKg.toInt()} kg (${p.heightCm.toInt()} cm, ${p.age} yrs)',
                        onEdit: () => context.push('/onboarding/body'),
                      ),
                      _ReviewSectionCard(
                        title: 'Training Schedule',
                        value: '${t.trainingDaysPerWeek} days/week at ${t.usualWorkoutTime} (${t.workoutDurationMinutes} mins)',
                        onEdit: () => context.push('/onboarding/training'),
                      ),
                      _ReviewSectionCard(
                        title: 'Living Situation',
                        value: '${l.livingArrangement.toUpperCase()} • Mess: ${l.hasMess ? "Yes" : "No"} • Equipment: ${l.availableEquipment.join(", ")}',
                        onEdit: () => context.push('/onboarding/living'),
                      ),
                      if (l.hasMess) ...[
                        _ReviewSectionCard(
                          title: l.livingArrangement == 'pg' ? 'PG Mess Meals' : (l.livingArrangement == 'hostel' ? 'Hostel Mess Meals' : 'Mess Meals'),
                          value: l.messMeals.isEmpty
                              ? 'No mess meals selected'
                              : '${l.messMeals.map((m) => m[0].toUpperCase() + m.substring(1)).join(", ")} (${state.messSelections.length} custom portions)',
                          onEdit: () => context.push('/onboarding/mess'),
                        ),
                      ],
                      _ReviewSectionCard(
                        title: 'Dietary Preference',
                        value: pref.dietType.toUpperCase(),
                        onEdit: () => context.push('/onboarding/preferences'),
                      ),
                      _ReviewSectionCard(
                        title: 'Extra Budget',
                        value: '₹${b.monthlyExtraBudget.toInt()}/month (≈ ₹${(b.monthlyExtraBudget / 30).toStringAsFixed(0)}/day)',
                        onEdit: () => context.push('/onboarding/budget'),
                      ),
                      _ReviewSectionCard(
                        title: 'Daily Routine',
                        value: 'Wake ${l.wakeTime} • College ${l.workOrCollegeStartTime}-${l.workOrCollegeEndTime} • Sleep ${l.sleepTime}',
                        onEdit: () => context.push('/onboarding/routine'),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                    ],
                  ),
                ),
              ),
              PrimaryButton(
                text: hasExistingPlan ? 'Update & Regenerate Diet Plan' : 'Build My Diet Plan',
                icon: Icons.auto_awesome,
                onPressed: () => context.push('/onboarding/plan-loading'),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}

class _ReviewSectionCard extends StatelessWidget {
  final String title;
  final String value;
  final VoidCallback onEdit;

  const _ReviewSectionCard({required this.title, required this.value, required this.onEdit});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
              ],
            ),
          ),
          TextButton(
            onPressed: onEdit,
            child: const Text('Edit', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}
