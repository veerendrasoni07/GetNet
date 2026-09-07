import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/primary_button.dart';
import '../../onboarding/presentation/screens/plan_loading_screen.dart';

class PlanResultScreen extends ConsumerWidget {
  const PlanResultScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final plan = ref.watch(latestGeneratedPlanProvider);

    if (plan == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('No plan generated yet.'),
              ElevatedButton(onPressed: () => context.go('/onboarding/goal'), child: const Text('Start Onboarding')),
            ],
          ),
        ),
      );
    }

    final target = plan.nutritionTarget;
    final opt = plan.optimizationResult;

    final targetCalories = target['calories']?['target'] ?? 2500;
    final targetProtein = target['protein']?['target'] ?? 125;
    final monthlyCost = opt['monthlyCostInr'] ?? 1930;
    final monthlyBudget = opt['monthlyBudgetInr'] ?? 2000;
    final budgetStatus = opt['budgetStatus'] ?? 'under_budget';
    final budgetAnalysisMessage = opt['budgetAnalysisMessage'] ?? '';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePaddingHorizontal),
          child: Column(
            children: [
              const SizedBox(height: AppSpacing.lg),
              const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 54),
              const SizedBox(height: AppSpacing.sm),
              const Text(
                'Your Plan is Ready!',
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              const SizedBox(height: AppSpacing.lg),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      // Target Macro Card
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              children: [
                                Expanded(
                                  child: Column(
                                    children: [
                                      const Text('Target Calories', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                      const SizedBox(height: 4),
                                      FittedBox(
                                        fit: BoxFit.scaleDown,
                                        child: Text('$targetCalories kcal', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary)),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(width: 1, height: 40, color: AppColors.border),
                                Expanded(
                                  child: Column(
                                    children: [
                                      const Text('Target Protein', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                      const SizedBox(height: 4),
                                      FittedBox(
                                        fit: BoxFit.scaleDown,
                                        child: Text('${targetProtein}g', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.success)),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const Divider(height: 32),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text('Monthly Cost: ₹$monthlyCost', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis),
                                ),
                                const SizedBox(width: AppSpacing.sm),
                                Text('Budget: ₹$monthlyBudget', style: const TextStyle(fontSize: 15, color: AppColors.textSecondary)),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),

                      // Budget Status Analysis Banner
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: budgetStatus == 'budget_gap' ? Colors.amber.shade50 : AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: budgetStatus == 'budget_gap' ? Colors.amber : AppColors.primary),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              budgetStatus == 'budget_gap' ? Icons.info_outline : Icons.check_circle_outline,
                              color: budgetStatus == 'budget_gap' ? Colors.amber.shade900 : AppColors.primary,
                            ),
                            const SizedBox(width: AppSpacing.md),
                            Expanded(
                              child: Text(
                                budgetAnalysisMessage,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: budgetStatus == 'budget_gap' ? Colors.amber.shade900 : AppColors.primaryDark,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Rationale Cards ("Why this plan fits you")
                      const Align(
                        alignment: Alignment.centerLeft,
                        child: Text('Why this plan fits you', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      const _RationaleBullet(text: 'Built around your hostel mess routine'),
                      const _RationaleBullet(text: 'No kitchen equipment required'),
                      const _RationaleBullet(text: 'Prioritizes high protein per rupee'),
                      const _RationaleBullet(text: 'Time-slotted around your workout schedule'),
                    ],
                  ),
                ),
              ),
              PrimaryButton(
                text: "Go to Today's Dashboard",
                icon: Icons.dashboard_rounded,
                onPressed: () => context.go('/dashboard'),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}

class _RationaleBullet extends StatelessWidget {
  final String text;

  const _RationaleBullet({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.xs),
      padding: const EdgeInsets.all(AppSpacing.sm),
      child: Row(
        children: [
          const Icon(Icons.check, color: AppColors.success, size: 20),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
            ),
          ),
        ],
      ),
    );
  }
}
