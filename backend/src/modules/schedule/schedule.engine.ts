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
  targetProtein: number,
  livingSituation: string = 'hostel'
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
  const prefix = livingSituation === 'home'
    ? 'Home-Cooked'
    : (livingSituation === 'pg' ? 'PG' : (livingSituation === 'alone' ? 'Self-Cooked' : 'Hostel'));

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

    let quantitySummary = '';
    if (messMeal.mealName === 'breakfast' && messMeal.breakfastType && messMeal.breakfastType !== 'roti_sabzi') {
      const qty = messMeal.breakfastQuantity && messMeal.breakfastQuantity > 0 ? messMeal.breakfastQuantity : 1;
      switch (messMeal.breakfastType) {
        case 'poha':
          quantitySummary = qty === 1 ? '1 Plate Poha' : `${qty} Plates Poha`;
          break;
        case 'upma':
          quantitySummary = qty === 1 ? '1 Bowl Upma' : `${qty} Bowls Upma`;
          break;
        case 'idli_sambar':
          quantitySummary = `${qty} Idlis with Sambar`;
          break;
        case 'dosa':
          quantitySummary = qty === 1 ? '1 Dosa with Sambar' : `${qty} Dosas with Sambar`;
          break;
        case 'paratha':
          quantitySummary = qty === 1 ? '1 Stuffed Paratha' : `${qty} Stuffed Parathas`;
          break;
        case 'chilla':
          quantitySummary = qty === 1 ? '1 Besan Chilla' : `${qty} Besan Chillas`;
          break;
        case 'oats_dalia':
          quantitySummary = qty === 1 ? '1 Bowl Oats / Dalia' : `${qty} Bowls Oats / Dalia`;
          break;
        case 'sprouts':
          quantitySummary = qty === 1 ? '1 Bowl Sprouts' : `${qty} Bowls Sprouts`;
          break;
        case 'bread_omelette':
          quantitySummary = 'Bread Omelette (2 Eggs)';
          break;
        default:
          quantitySummary = summaryParts.join(', ');
      }
    } else {
      quantitySummary = summaryParts.join(', ');
    }

    slot.items.push({
      name: `${prefix} ${messMeal.mealName.toUpperCase()}`,
      quantityText: quantitySummary,
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
      quantityText: formatAbsoluteQuantity(selected.servings, food.servingUnit, food.name),
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
 
export function formatAbsoluteQuantity(servings: number, servingUnit: string, foodName = ''): string {
  const unit = (servingUnit || '').trim();
  if (!unit) return `${servings}`;

  // 1. Scoop with grams: e.g. "1 scoop (32g)"
  const scoopMatch = unit.match(/^(\d+(?:\.\d+)?)\s*scoops?(?:\s*\((?:approx\.\s*)?(\d+(?:\.\d+)?)\s*g\))?/i);
  if (scoopMatch) {
    const baseScoops = parseFloat(scoopMatch[1]) || 1;
    const totalScoops = baseScoops * servings;
    const baseGrams = scoopMatch[2] ? parseFloat(scoopMatch[2]) : null;
    const scoopStr = totalScoops === 1 ? '1 scoop' : `${formatNumber(totalScoops)} scoops`;
    if (baseGrams) {
      const totalGrams = Math.round(baseGrams * servings);
      return `${scoopStr} (${totalGrams}g)`;
    }
    return scoopStr;
  }

  // 2. Liquids: ml or L
  const mlMatch = unit.match(/^(\d+(?:\.\d+)?)\s*(ml|milliliters?|l|liters?)\b(.*)$/i);
  if (mlMatch) {
    const baseAmount = parseFloat(mlMatch[1]) || 1;
    const unitName = mlMatch[2].toLowerCase();
    const suffix = (mlMatch[3] || '').trim();
    if (unitName.startsWith('l')) {
      const totalL = baseAmount * servings;
      return `${formatNumber(totalL)} L${suffix ? ' ' + suffix : ''}`;
    } else {
      const totalMl = baseAmount * servings;
      if (totalMl >= 1000 && totalMl % 1000 === 0) {
        return `${totalMl / 1000} L${suffix ? ' ' + suffix : ''}`;
      }
      return `${Math.round(totalMl)} ml${suffix ? ' ' + suffix : ''}`;
    }
  }

  // 3. Weight: g or kg
  const gMatch = unit.match(/^(\d+(?:\.\d+)?)\s*(g|grams?|kg|kilograms?)\b(.*)$/i);
  if (gMatch) {
    const baseAmount = parseFloat(gMatch[1]) || 1;
    const unitName = gMatch[2].toLowerCase();
    const suffix = (gMatch[3] || '').trim();
    if (unitName.startsWith('kg')) {
      const totalKg = baseAmount * servings;
      return `${formatNumber(totalKg)} kg${suffix ? ' ' + suffix : ''}`;
    } else {
      const totalG = Math.round(baseAmount * servings);
      return `${totalG} g${suffix ? ' ' + suffix : ''}`;
    }
  }

  // 4. Countable discrete items: e.g. "2 bananas", "2 eggs", "3 eggs"
  const itemMatch = unit.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z\s]+)$/);
  if (itemMatch) {
    const baseCount = parseFloat(itemMatch[1]) || 1;
    const rawItem = itemMatch[2].trim();
    const total = Math.round(baseCount * servings);
    return `${total} ${formatItemName(total, rawItem)}`;
  }

  // 5. Cup / bowl
  const cupMatch = unit.match(/^(\d+(?:\.\d+)?)\s*(cups?|bowls?|katori)\b(.*)$/i);
  if (cupMatch) {
    const baseCount = parseFloat(cupMatch[1]) || 1;
    const cupWord = cupMatch[2].toLowerCase();
    const suffix = (cupMatch[3] || '').trim();
    const total = baseCount * servings;
    const word = total === 1 ? cupWord.replace(/s$/, '') : (cupWord.endsWith('s') ? cupWord : `${cupWord}s`);
    return `${formatNumber(total)} ${word}${suffix ? ' ' + suffix : ''}`;
  }

  // 6. Generic "serving"
  if (unit.toLowerCase().includes('serving')) {
    if (foodName) {
      const lower = foodName.toLowerCase();
      if (lower.includes('egg')) {
        const count = Math.round(servings * 2);
        return `${count} ${formatItemName(count, 'Eggs')}`;
      }
      if (lower.includes('banana')) {
        const count = Math.round(servings);
        return `${count} ${formatItemName(count, 'Bananas')}`;
      }
    }
    return servings === 1 ? '1 serving' : `${formatNumber(servings)} servings`;
  }

  return `${formatNumber(servings)} ${unit}`;
}

function formatNumber(val: number): string {
  if (Number.isInteger(val)) return val.toString();
  return val.toFixed(1).replace(/\.0$/, '');
}

function formatItemName(count: number, name: string): string {
  const clean = name.trim();
  const lower = clean.toLowerCase();
  const cap = (s: string) => (s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  if (count === 1) {
    return lower.endsWith('s') ? cap(clean.slice(0, -1)) : cap(clean);
  }
  return lower.endsWith('s') ? cap(clean) : `${cap(clean)}s`;
}

/** Chrono-nutrition meal timing ensuring pre and post-workout nutrient availability. */
