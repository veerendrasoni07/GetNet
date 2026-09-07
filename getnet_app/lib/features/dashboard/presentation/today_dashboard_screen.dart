import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/animated_number.dart';
import '../../diet_plan/data/diet_plan_repository.dart';
import '../../diet_plan/presentation/widgets/replacement_bottom_sheet.dart';
import '../../onboarding/presentation/screens/plan_loading_screen.dart';

class TodayDashboardScreen extends ConsumerStatefulWidget {
  const TodayDashboardScreen({super.key});

  @override
  ConsumerState<TodayDashboardScreen> createState() => _TodayDashboardScreenState();
}

class _TodayDashboardScreenState extends ConsumerState<TodayDashboardScreen> {
  final Map<String, bool> _completedItems = {};

  @override
  Widget build(BuildContext context) {
    final plan = ref.watch(latestGeneratedPlanProvider);

    final todayStr = DateFormat('EEEE, d MMMM').format(DateTime.now());

    // Extract schedule slots & targets
    final target = plan?.nutritionTarget;
    final targetProtein = target?['protein']?['target'] ?? 125;
    final targetCalories = target?['calories']?['target'] ?? 2500;

    final schedule = plan?.dailySchedule;
    final List slotsList = schedule?['scheduledSlots'] ?? [];

    // Calculate current eaten protein & calories
    int eatenProtein = 0;
    int eatenCalories = 0;

    for (final slot in slotsList) {
      final List items = slot['items'] ?? [];
      for (final item in items) {
        final key = '${slot['slotName']}_${item['name']}';
        if (_completedItems[key] == true) {
          eatenProtein += (item['protein'] as num? ?? 0).toInt();
          eatenCalories += (item['calories'] as num? ?? 0).toInt();
        }
      }
    }

    final proteinProgress = (eatenProtein / targetProtein).clamp(0.0, 1.0);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          children: [
            const Text('Today', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text(todayStr, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push('/onboarding/review'),
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        onDestinationSelected: (idx) {
          if (idx == 1) context.push('/progress');
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.today), label: 'Today'),
          NavigationDestination(icon: Icon(Icons.show_chart), label: 'Progress'),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePaddingHorizontal),
          child: Column(
            children: [
              const SizedBox(height: AppSpacing.sm),
              // Macro Dashboard Card
              Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Expanded(
                          child: Text(
                            'PROTEIN INTAKE',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textSecondary, letterSpacing: 0.5),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Row(
                          children: [
                            AnimatedNumber(number: eatenProtein, textStyle: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary)),
                            Text(' / ${targetProtein}g', style: const TextStyle(fontSize: 16, color: AppColors.textSecondary, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: proteinProgress,
                        minHeight: 10,
                        backgroundColor: AppColors.surfaceVariant,
                        valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            'Calories: $eatenCalories / $targetCalories kcal',
                            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        const Text('Budget: Within Target', style: TextStyle(fontSize: 13, color: AppColors.success, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              // Timeline Meal Cards
              const Align(
                alignment: Alignment.centerLeft,
                child: Text('Today\'s Diet Schedule', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: AppSpacing.sm),
              Expanded(
                child: slotsList.isEmpty
                    ? const Center(child: Text('No scheduled meals found.'))
                    : ListView.builder(
                        itemCount: slotsList.length,
                        itemBuilder: (context, index) {
                          final slot = slotsList[index];
                          final slotName = slot['slotName'] ?? 'Meal Slot';
                          final timeRange = slot['timeRangeText'] ?? '';
                          final List items = slot['items'] ?? [];

                          return Container(
                            margin: const EdgeInsets.only(bottom: AppSpacing.md),
                            padding: const EdgeInsets.all(AppSpacing.md),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        timeRange,
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primary),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    const SizedBox(width: AppSpacing.sm),
                                    Text(
                                      slotName,
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textSecondary),
                                    ),
                                  ],
                                ),
                                const Divider(height: 16),
                                Column(
                                  children: items.map<Widget>((item) {
                                    final itemName = item['name'] ?? 'Food';
                                    final qty = item['quantityText'] ?? '';
                                    final cost = item['estimatedCostInr'] ?? 0;
                                    final foodId = item['foodId'] ?? '';
                                    final key = '${slotName}_$itemName';
                                    final isEaten = _completedItems[key] == true;

                                    return Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 4),
                                      child: Row(
                                        children: [
                                          Icon(
                                            isEaten ? Icons.check_circle : Icons.circle_outlined,
                                            color: isEaten ? AppColors.success : AppColors.textLight,
                                            size: 20,
                                          ),
                                          const SizedBox(width: AppSpacing.md),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(itemName, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, decoration: isEaten ? TextDecoration.lineThrough : null)),
                                                Text('$qty ${cost > 0 ? "• ₹$cost" : ""}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                              ],
                                            ),
                                          ),
                                          IconButton(
                                            icon: Icon(isEaten ? Icons.undo : Icons.check, color: isEaten ? AppColors.textSecondary : AppColors.primary),
                                            onPressed: () {
                                              setState(() {
                                                _completedItems[key] = !isEaten;
                                              });
                                              ref.read(dietPlanRepositoryProvider).logMealCompletion({
                                                'userId': 'user_local',
                                                'date': DateFormat('yyyy-MM-dd').format(DateTime.now()),
                                                'slotName': slotName,
                                                'items': [{'name': itemName, 'status': isEaten ? 'skipped' : 'done'}],
                                              });
                                            },
                                          ),
                                          if (foodId.toString().isNotEmpty) ...[
                                            IconButton(
                                              icon: const Icon(Icons.swap_horiz, color: AppColors.textSecondary, size: 20),
                                              onPressed: () {
                                                showModalBottomSheet(
                                                  context: context,
                                                  isScrollControlled: true,
                                                  backgroundColor: Colors.transparent,
                                                  builder: (context) => ReplacementBottomSheet(
                                                    foodId: foodId,
                                                    foodName: itemName,
                                                    onSelectReplacement: (replacement) {
                                                      final currentPlan = ref.read(latestGeneratedPlanProvider);
                                                      if (currentPlan != null) {
                                                        final updatedPlan = currentPlan.replaceFoodItem(
                                                          slotName: slotName,
                                                          oldFoodId: foodId,
                                                          oldFoodName: itemName,
                                                          replacement: replacement,
                                                        );
                                                        ref.read(latestGeneratedPlanProvider.notifier).state = updatedPlan;

                                                        final newName = replacement['replacementFood']?['name'] ?? 'Substitute Item';
                                                        final newKey = '${slotName}_$newName';

                                                        // Transfer completion status if old item was checked
                                                        if (_completedItems.containsKey(key)) {
                                                          final wasCompleted = _completedItems[key] == true;
                                                          setState(() {
                                                            _completedItems.remove(key);
                                                            _completedItems[newKey] = wasCompleted;
                                                          });
                                                        }

                                                        final newProtein = replacement['protein'] ?? 0;
                                                        ScaffoldMessenger.of(context).showSnackBar(
                                                          SnackBar(
                                                            backgroundColor: AppColors.primaryDark,
                                                            content: Text('Replaced $itemName with $newName (${newProtein}g protein)'),
                                                            behavior: SnackBarBehavior.floating,
                                                          ),
                                                        );
                                                      }
                                                    },
                                                  ),
                                                );
                                              },
                                            ),
                                          ],
                                        ],
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
