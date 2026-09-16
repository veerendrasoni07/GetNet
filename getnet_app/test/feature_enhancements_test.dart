import 'package:flutter_test/flutter_test.dart';
import 'package:getnet_app/features/diet_plan/data/diet_plan_models.dart';
import 'package:getnet_app/features/onboarding/presentation/onboarding_controller.dart';

void main() {
  group('DietPlanResponse Substitution Tests', () {
    test('replaceFoodItem replaces item in scheduled slot and updates cost', () {
      final initialPlan = DietPlanResponse(
        nutritionTarget: {'protein': {'target': 130}, 'calories': {'target': 2400}},
        existingDietEstimate: {},
        nutritionGap: {},
        optimizationResult: {'monthlyCostInr': 2000},
        dailySchedule: {
          'scheduledSlots': [
            {
              'slotName': 'Lunch',
              'items': [
                {
                  'name': 'Paneer Bhurji',
                  'foodId': 'paneer_bhurji',
                  'quantityText': '100g',
                  'estimatedCostInr': 45,
                  'protein': 18,
                  'calories': 260,
                },
                {
                  'name': 'Hostel LUNCH',
                  'foodId': '',
                  'quantityText': '3 Roti, 1 Rice',
                  'estimatedCostInr': 0,
                  'protein': 12,
                  'calories': 380,
                }
              ]
            }
          ]
        },
      );

      final replacement = {
        'targetFoodName': 'Paneer Bhurji',
        'replacementFood': {
          'id': 'boiled_eggs',
          'name': 'Boiled Whole Eggs',
          'servingUnit': '2 eggs',
          'cookingRequired': false,
          'category': 'protein',
        },
        'servings': 2,
        'dailyCostInr': 30,
        'costDeltaInr': -15.0,
        'protein': 24,
        'calories': 280,
      };

      final updatedPlan = initialPlan.replaceFoodItem(
        slotName: 'Lunch',
        oldFoodId: 'paneer_bhurji',
        oldFoodName: 'Paneer Bhurji',
        replacement: replacement,
      );

      final slots = updatedPlan.dailySchedule['scheduledSlots'] as List;
      expect(slots.length, 1);
      final items = slots[0]['items'] as List;
      expect(items.length, 2);

      // Verify replaced item
      final replacedItem = items[0];
      expect(replacedItem['name'], 'Boiled Whole Eggs');
      expect(replacedItem['foodId'], 'boiled_eggs');
      expect(replacedItem['protein'], 24);
      expect(replacedItem['calories'], 280);
      expect(replacedItem['estimatedCostInr'], 30);
      expect(replacedItem['quantityText'], '4 Eggs');

      // Verify cost delta applied to monthly budget: 2000 + (-15 * 30) = 1550
      expect(updatedPlan.optimizationResult['monthlyCostInr'], 1550);

      // Verify second item intact
      expect(items[1]['name'], 'Hostel LUNCH');
    });
  });

  group('OnboardingController Mess Meals & Workout Tests', () {
    test('setMessMeals synchronizes lifestyle.messMeals and messSelections', () {
      final controller = OnboardingController();

      controller.setMessMeals(['lunch', 'dinner']);
      expect(controller.state.lifestyle.messMeals, ['lunch', 'dinner']);
      expect(controller.state.messSelections.length, 2);
      expect(controller.state.messSelections.map((m) => m.mealName).toList(), ['lunch', 'dinner']);

      // Add breakfast
      controller.setMessMeals(['breakfast', 'lunch', 'dinner']);
      expect(controller.state.lifestyle.messMeals.length, 3);
      expect(controller.state.messSelections.length, 3);
      expect(controller.state.messSelections.any((m) => m.mealName == 'breakfast'), isTrue);
    });

    test('updateTraining records custom clock workout time', () {
      final controller = OnboardingController();
      controller.updateTraining(usualWorkoutTime: '06:45');
      expect(controller.state.training.usualWorkoutTime, '06:45');

      controller.updateTraining(usualWorkoutTime: '19:30');
      expect(controller.state.training.usualWorkoutTime, '19:30');
    });
  });
}
