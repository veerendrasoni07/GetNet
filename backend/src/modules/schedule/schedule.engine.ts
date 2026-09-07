import { ExistingDietEstimate, MessMealSelection } from '../existing-diet/existing-diet.types';
import { OptimizationResult, SelectedFoodItem } from '../optimizer/diet.optimizer';
import { MealWindow, ScheduleProfile } from '../profile/profile.types';
import { deriveMealWindows } from '../profile/schedule.calculator';

export interface ScheduledMealItem {
  name: string;
  quantityText: string;
  estimatedCostInr: number;
  calories: number;
  protein: number;
  isMessMeal: boolean;
  foodId?: string;
}

export interface ScheduledMealSlot {
  slotName: string;
  timeRangeText: string; // e.g. "07:15 - 08:30"
  startTime: string;     // "07:15"
  items: ScheduledMealItem[];
  slotTotalCalories: number;
  slotTotalProtein: number;
  slotTotalCostInr: number;
}

export interface DailyDietSchedule {
  date?: string;
  targetGoal: string;
  totalTargetCalories: number;
  totalTargetProtein: number;
  scheduledSlots: ScheduledMealSlot[];
  overallProgress: {
    calories: { current: number; target: number };
    protein: { current: number; target: number };
  };
}

export function generateDailySchedule(
  schedule: ScheduleProfile,
  messEstimate: ExistingDietEstimate,
  optimizationResult: OptimizationResult,
  messSelections: MessMealSelection[],
  targetGoal: string,
  targetCalories: number,
  targetProtein: number
): DailyDietSchedule {
  const windows = schedule.derivedWindows && schedule.derivedWindows.length > 0
    ? schedule.derivedWindows
    : deriveMealWindows(schedule);

  // Map slots based on derived routine windows
  const slots: ScheduledMealSlot[] = windows.map((w) => ({
    slotName: w.name,
    timeRangeText: `${w.startTime} - ${w.endTime}`,
    startTime: w.startTime,
    items: [],
    slotTotalCalories: 0,
    slotTotalProtein: 0,
    slotTotalCostInr: 0,
  }));

  // 1. Add Mess Meals into matching slots
  for (const messMeal of messSelections) {
    const est = messEstimate.mealEstimates.find((m) => m.mealName === messMeal.mealName);
    if (!est) continue;

    // Find slot matching mealName
    let slot = slots.find((s) => s.slotName.toLowerCase().includes(messMeal.mealName.toLowerCase()));
    if (!slot) slot = slots[0];

    const rotiText = messMeal.rotiCount > 0 ? `${messMeal.rotiCount} Roti` : '';
    const riceText = messMeal.ricePortion !== 'none' ? `${messMeal.ricePortion} Rice` : '';
    const dalText = messMeal.dalPortion !== 'none' ? `${messMeal.dalPortion} Dal` : '';
    const sabziText = `${messMeal.sabziPortion} Sabzi`;

    const summaryParts = [rotiText, dalText, riceText, sabziText].filter(Boolean);

    slot.items.push({
      name: `Hostel ${messMeal.mealName.toUpperCase()}`,
      quantityText: summaryParts.join(', '),
      estimatedCostInr: 0, // mess paid separately
      calories: est.reliableCalories,
      protein: est.reliableProtein,
      isMessMeal: true,
    });
  }

  // 2. Distribute Extra Optimized Foods into appropriate time slots
  for (const selected of optimizationResult.selectedItems) {
    const food = selected.food;
    const allowedCategories = food.allowedMealCategories || ['snack'];

    // Find best slot
    let targetSlot = slots.find((s) =>
      allowedCategories.some((cat) => s.slotName.toLowerCase().includes(cat.toLowerCase()))
    );

    if (!targetSlot) {
      targetSlot = slots.find((s) => s.items.length === 0) || slots[0];
    }

    targetSlot.items.push({
      name: food.name,
      quantityText: `${selected.servings} x ${food.servingUnit}`,
      estimatedCostInr: selected.totalCostInr,
      calories: selected.totalCalories,
      protein: selected.totalProtein,
      isMessMeal: false,
      foodId: food.id,
    });
  }

  // Calculate totals per slot
  for (const slot of slots) {
    slot.slotTotalCalories = Math.round(slot.items.reduce((sum, i) => sum + i.calories, 0));
    slot.slotTotalProtein = Math.round(slot.items.reduce((sum, i) => sum + i.protein, 0));
    slot.slotTotalCostInr = Number(slot.items.reduce((sum, i) => sum + i.estimatedCostInr, 0).toFixed(2));
  }

  const currentCalories = slots.reduce((s, slot) => s + slot.slotTotalCalories, 0);
  const currentProtein = slots.reduce((s, slot) => s + slot.slotTotalProtein, 0);

  return {
    targetGoal,
    totalTargetCalories: targetCalories,
    totalTargetProtein: targetProtein,
    scheduledSlots: slots.filter((s) => s.items.length > 0),
    overallProgress: {
      calories: { current: currentCalories, target: targetCalories },
      protein: { current: currentProtein, target: targetProtein },
    },
  };
}

/** Chrono-nutrition meal timing ensuring pre and post-workout nutrient availability. */
