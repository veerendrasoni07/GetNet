import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/progress_header.dart';
import '../onboarding_controller.dart';

class FoodPreferencesScreen extends ConsumerWidget {
  const FoodPreferencesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(onboardingControllerProvider);
    final controller = ref.read(onboardingControllerProvider.notifier);
    final pref = state.preferences;

    final dietOptions = [
      {'id': 'vegetarian', 'label': 'Vegetarian'},
      {'id': 'eggetarian', 'label': 'Eggetarian'},
      {'id': 'non_vegetarian', 'label': 'Non-Vegetarian'},
      {'id': 'vegan', 'label': 'Vegan'},
    ];

    final allergyOptions = ['Peanuts', 'Milk (Lactose)', 'Gluten', 'Soy', 'Eggs'];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePaddingHorizontal),
          child: Column(
            children: [
              ProgressHeader(
                currentStep: 5,
                title: 'Dietary Preferences',
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppSpacing.lg),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Diet Type Choice
                      const Text('What do you eat?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      const SizedBox(height: AppSpacing.sm),
                      Wrap(
                        spacing: AppSpacing.sm,
                        children: dietOptions.map((opt) {
                          final isSelected = pref.dietType == opt['id'];
                          return ChoiceChip(
                            label: Text(opt['label']!),
                            selected: isSelected,
                            selectedColor: AppColors.primaryLight,
                            onSelected: (_) => controller.updatePreferences(dietType: opt['id']),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Allergies & Restrictions
                      const Text('Anything you cannot eat? (Allergies)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      const SizedBox(height: AppSpacing.sm),
                      Wrap(
                        spacing: AppSpacing.sm,
                        children: allergyOptions.map((allergy) {
                          final isSelected = pref.allergies.contains(allergy);
                          return FilterChip(
                            label: Text(allergy),
                            selected: isSelected,
                            selectedColor: AppColors.primaryLight,
                            onSelected: (selected) {
                              final updated = List<String>.from(pref.allergies);
                              if (selected) {
                                updated.add(allergy);
                              } else {
                                updated.remove(allergy);
                              }
                              controller.updatePreferences(allergies: updated);
                            },
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: AppSpacing.xl),
                    ],
                  ),
                ),
              ),
              PrimaryButton(
                text: 'Continue',
                onPressed: () => context.push('/onboarding/budget'),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}
