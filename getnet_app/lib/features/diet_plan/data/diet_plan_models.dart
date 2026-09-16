import '../../../core/utils/quantity_formatter.dart';

class DietPlanResponse {
  final Map<String, dynamic> nutritionTarget;
  final Map<String, dynamic> existingDietEstimate;
  final Map<String, dynamic> nutritionGap;
  final Map<String, dynamic> optimizationResult;
  final Map<String, dynamic> dailySchedule;

  DietPlanResponse({
    required this.nutritionTarget,
    required this.existingDietEstimate,
    required this.nutritionGap,
    required this.optimizationResult,
    required this.dailySchedule,
  });

  factory DietPlanResponse.fromJson(Map<String, dynamic> json) {
    return DietPlanResponse(
      nutritionTarget: json['nutritionTarget'] ?? {},
      existingDietEstimate: json['existingDietEstimate'] ?? {},
      nutritionGap: json['nutritionGap'] ?? {},
      optimizationResult: json['optimizationResult'] ?? {},
      dailySchedule: json['dailySchedule'] ?? {},
    );
  }

  DietPlanResponse copyWith({
    Map<String, dynamic>? nutritionTarget,
    Map<String, dynamic>? existingDietEstimate,
    Map<String, dynamic>? nutritionGap,
    Map<String, dynamic>? optimizationResult,
    Map<String, dynamic>? dailySchedule,
  }) {
    return DietPlanResponse(
      nutritionTarget: nutritionTarget ?? this.nutritionTarget,
      existingDietEstimate: existingDietEstimate ?? this.existingDietEstimate,
      nutritionGap: nutritionGap ?? this.nutritionGap,
      optimizationResult: optimizationResult ?? this.optimizationResult,
      dailySchedule: dailySchedule ?? this.dailySchedule,
    );
  }

  DietPlanResponse replaceFoodItem({
    required String slotName,
    required String oldFoodId,
    required String oldFoodName,
    required Map<String, dynamic> replacement,
  }) {
    final scheduleCopy = Map<String, dynamic>.from(dailySchedule);
    final rawSlots = scheduleCopy['scheduledSlots'] as List? ?? [];
    final slotsCopy = rawSlots.map((s) => Map<String, dynamic>.from(s as Map)).toList();

    final repFood = replacement['replacementFood'] as Map<String, dynamic>? ?? {};
    final servings = replacement['servings'] ?? 1;
    final servingUnit = repFood['servingUnit'] ?? 'serving';
    final newName = repFood['name'] ?? 'Substitute Item';
    final newFoodId = repFood['id'] ?? oldFoodId;
    final newCost = (replacement['dailyCostInr'] as num?)?.round() ?? 0;
    final newProtein = (replacement['protein'] as num?)?.toInt() ?? 0;
    final newCalories = (replacement['calories'] as num?)?.toInt() ?? 0;

    for (int i = 0; i < slotsCopy.length; i++) {
      if (slotsCopy[i]['slotName'] == slotName) {
        final rawItems = slotsCopy[i]['items'] as List? ?? [];
        final itemsCopy = rawItems.map((it) => Map<String, dynamic>.from(it as Map)).toList();

        for (int j = 0; j < itemsCopy.length; j++) {
          final itFoodId = itemsCopy[j]['foodId']?.toString() ?? '';
          final itName = itemsCopy[j]['name']?.toString() ?? '';

          if ((oldFoodId.isNotEmpty && itFoodId == oldFoodId) || itName == oldFoodName) {
            itemsCopy[j] = {
              'name': newName,
              'foodId': newFoodId,
              'quantityText': QuantityFormatter.formatAbsoluteQuantity((servings as num).toDouble(), servingUnit, newName),
              'estimatedCostInr': newCost,
              'protein': newProtein,
              'calories': newCalories,
              'cookingRequired': repFood['cookingRequired'] ?? false,
              'category': repFood['category'] ?? itemsCopy[j]['category'] ?? 'protein',
            };
            break;
          }
        }
        slotsCopy[i]['items'] = itemsCopy;
        break;
      }
    }

    scheduleCopy['scheduledSlots'] = slotsCopy;

    final optCopy = Map<String, dynamic>.from(optimizationResult);
    final costDelta = (replacement['costDeltaInr'] as num? ?? 0).toDouble();
    if (optCopy.containsKey('monthlyCostInr')) {
      final currentCost = (optCopy['monthlyCostInr'] as num?)?.toDouble() ?? 0;
      optCopy['monthlyCostInr'] = (currentCost + (costDelta * 30)).round();
    }

    return copyWith(
      dailySchedule: scheduleCopy,
      optimizationResult: optCopy,
    );
  }
}
