import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/progress_header.dart';
import '../../domain/onboarding_models.dart';
import '../onboarding_controller.dart';

class HostelMessScreen extends ConsumerWidget {
  const HostelMessScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(onboardingControllerProvider);
    final controller = ref.read(onboardingControllerProvider.notifier);
    final l = state.lifestyle;

    final allEquipment = [
      {'id': 'refrigerator', 'label': 'Refrigerator'},
      {'id': 'kettle', 'label': 'Electric Kettle'},
      {'id': 'induction', 'label': 'Induction Cooktop'},
      {'id': 'microwave', 'label': 'Microwave'},
      {'id': 'mixer', 'label': 'Mixer / Blender'},
      {'id': 'none', 'label': 'None'},
    ];

    final allMessMeals = [
      {'id': 'breakfast', 'label': 'Breakfast', 'icon': Icons.breakfast_dining_outlined},
      {'id': 'lunch', 'label': 'Lunch', 'icon': Icons.lunch_dining_outlined},
      {'id': 'snack', 'label': 'Evening Snack', 'icon': Icons.coffee_outlined},
      {'id': 'dinner', 'label': 'Dinner', 'icon': Icons.dinner_dining_outlined},
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePaddingHorizontal),
          child: Column(
            children: [
              ProgressHeader(
                currentStep: 4,
                title: 'Mess & Kitchen Setup',
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppSpacing.md),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Conservative Reassurance Banner
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.verified_outlined, color: AppColors.primary, size: 22),
                            SizedBox(width: AppSpacing.md),
                            Expanded(
                              child: Text(
                                "We'll estimate your mess food conservatively. You don't need to weigh anything.",
                                style: TextStyle(fontSize: 13, color: AppColors.primaryDark, fontWeight: FontWeight.w500),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Mess Meals Selection
                      const Text(
                        'Which meals do you eat in the hostel mess?',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Select the meals you eat at the mess apart from your dedicated protein diet (${l.messMeals.length} selected).',
                        style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Wrap(
                        spacing: AppSpacing.sm,
                        runSpacing: AppSpacing.xs,
                        children: allMessMeals.map((meal) {
                          final id = meal['id'] as String;
                          final isSelected = l.messMeals.contains(id);
                          return FilterChip(
                            avatar: Icon(meal['icon'] as IconData, size: 18, color: isSelected ? AppColors.primary : AppColors.textSecondary),
                            label: Text(meal['label'] as String),
                            selected: isSelected,
                            selectedColor: AppColors.primaryLight,
                            onSelected: (selected) {
                              final updated = List<String>.from(l.messMeals);
                              if (selected) {
                                if (!updated.contains(id)) updated.add(id);
                              } else {
                                updated.remove(id);
                              }
                              controller.setMessMeals(updated);
                            },
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Equipment Multi-Select
                      const Text('What equipment do you have access to?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      const SizedBox(height: AppSpacing.sm),
                      Wrap(
                        spacing: AppSpacing.sm,
                        runSpacing: AppSpacing.xs,
                        children: allEquipment.map((eq) {
                          final id = eq['id'] as String;
                          final isSelected = l.availableEquipment.contains(id);
                          return FilterChip(
                            label: Text(eq['label'] as String),
                            selected: isSelected,
                            selectedColor: AppColors.primaryLight,
                            onSelected: (selected) {
                              List<String> updated = List.from(l.availableEquipment);
                              if (id == 'none') {
                                updated = selected ? ['none'] : [];
                              } else {
                                updated.remove('none');
                                if (selected) {
                                  updated.add(id);
                                } else {
                                  updated.remove(id);
                                }
                              }
                              controller.updateLifestyle(availableEquipment: updated);
                            },
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Mess Meal Portions Section
                      if (l.messMeals.isNotEmpty) ...[
                        Text(
                          'Typical Portions for ${l.messMeals.length} Mess ${l.messMeals.length == 1 ? "Meal" : "Meals"}',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        ...l.messMeals.map((mealName) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: AppSpacing.md),
                            child: _MessPortionCard(
                              mealName: mealName,
                              selections: state.messSelections,
                              onUpdate: (r, rice, dal, sabzi) {
                                controller.updateMessItem(mealName, rotiCount: r, ricePortion: rice, dalPortion: dal, sabziPortion: sabzi);
                              },
                            ),
                          );
                        }),
                      ] else ...[
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceVariant.withValues(alpha: 0.5),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.info_outline, color: AppColors.textSecondary, size: 20),
                              SizedBox(width: AppSpacing.sm),
                              Expanded(
                                child: Text(
                                  'No mess meals selected. All your daily meals and protein will be planned from custom groceries/budget.',
                                  style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: AppSpacing.lg),
                    ],
                  ),
                ),
              ),
              PrimaryButton(
                text: 'Continue',
                onPressed: () => context.push('/onboarding/preferences'),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}

class _MessPortionCard extends StatelessWidget {
  final String mealName;
  final List<MessMealItem> selections;
  final Function(int roti, String rice, String dal, String sabzi) onUpdate;

  const _MessPortionCard({required this.mealName, required this.selections, required this.onUpdate});

  String _formatMealTitle(String name) {
    switch (name) {
      case 'breakfast':
        return '🍳 Breakfast Mess Portions';
      case 'lunch':
        return '🍛 Lunch Mess Portions';
      case 'snack':
        return '☕ Evening Snack Mess Portions';
      case 'dinner':
        return '🍲 Dinner Mess Portions';
      default:
        return '${name[0].toUpperCase()}${name.substring(1)} Mess Portions';
    }
  }

  @override
  Widget build(BuildContext context) {
    final item = selections.firstWhere((m) => m.mealName == mealName, orElse: () => MessMealItem(mealName: mealName));

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _formatMealTitle(mealName),
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
          ),
          const SizedBox(height: AppSpacing.sm),
          // Roti Selector
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(child: Text('Roti / Chapati Count', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500))),
              Row(
                children: [
                  IconButton(
                    onPressed: () => onUpdate((item.rotiCount - 1).clamp(0, 6), item.ricePortion, item.dalPortion, item.sabziPortion),
                    icon: const Icon(Icons.remove_circle_outline, color: AppColors.primary),
                  ),
                  Text('${item.rotiCount}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  IconButton(
                    onPressed: () => onUpdate((item.rotiCount + 1).clamp(0, 6), item.ricePortion, item.dalPortion, item.sabziPortion),
                    icon: const Icon(Icons.add_circle_outline, color: AppColors.primary),
                  ),
                ],
              ),
            ],
          ),
          const Divider(),
          // Rice Portion Selector
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(child: Text('Rice Portion', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500))),
              DropdownButton<String>(
                value: item.ricePortion,
                underline: const SizedBox(),
                items: const [
                  DropdownMenuItem(value: 'none', child: Text('None')),
                  DropdownMenuItem(value: 'half', child: Text('Small Bowl')),
                  DropdownMenuItem(value: 'medium', child: Text('Medium Bowl')),
                  DropdownMenuItem(value: 'large', child: Text('Large Bowl')),
                ],
                onChanged: (val) {
                  if (val != null) onUpdate(item.rotiCount, val, item.dalPortion, item.sabziPortion);
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
