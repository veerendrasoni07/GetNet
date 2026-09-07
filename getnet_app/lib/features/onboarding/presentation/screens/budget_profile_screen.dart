import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/progress_header.dart';
import '../onboarding_controller.dart';

class BudgetProfileScreen extends ConsumerWidget {
  const BudgetProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(onboardingControllerProvider);
    final controller = ref.read(onboardingControllerProvider.notifier);
    final b = state.budget;

    final presetBudgets = [1500.0, 2000.0, 3000.0, 5000.0];
    final dailyEquivalent = (b.monthlyExtraBudget / 30).toStringAsFixed(0);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePaddingHorizontal),
          child: Column(
            children: [
              ProgressHeader(
                currentStep: 5,
                title: 'Extra Monthly Diet Budget',
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppSpacing.lg),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'How much can you comfortably spend EXTRA on your diet every month?',
                        style: TextStyle(fontSize: 15, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Real-time Calculation Display Card
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(AppSpacing.xl),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                          border: Border.all(color: AppColors.primary),
                        ),
                        child: Column(
                          children: [
                            Text(
                              '₹${b.monthlyExtraBudget.toInt()}/month',
                              style: const TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryDark,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '≈ ₹$dailyEquivalent / day',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Preset Cards
                      const Text('Choose or adjust budget:', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                      const SizedBox(height: AppSpacing.sm),
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisSpacing: AppSpacing.md,
                        mainAxisSpacing: AppSpacing.md,
                        childAspectRatio: 2.2,
                        children: presetBudgets.map((budgetVal) {
                          final isSelected = b.monthlyExtraBudget == budgetVal;
                          return GestureDetector(
                            onTap: () => controller.updateBudget(monthlyExtraBudget: budgetVal),
                            child: Container(
                              decoration: BoxDecoration(
                                color: isSelected ? AppColors.primary : AppColors.surface,
                                borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                                border: Border.all(color: isSelected ? AppColors.primary : AppColors.border),
                              ),
                              child: Center(
                                child: Text(
                                  '₹${budgetVal.toInt()}',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: isSelected ? Colors.white : AppColors.textPrimary,
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Mess Fee Paid Separately Switch
                      if (state.lifestyle.hasMess) ...[
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            children: [
                              const Expanded(
                                child: Text(
                                  'Is your mess fee already paid separately?',
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                                ),
                              ),
                              Switch(
                                value: b.messPaidSeparately,
                                activeThumbColor: AppColors.primary,
                                onChanged: (val) => controller.updateBudget(messPaidSeparately: val),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              PrimaryButton(
                text: 'Continue',
                onPressed: () => context.push('/onboarding/routine'),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}
