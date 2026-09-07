import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/onboarding_models.dart';
import '../domain/onboarding_state.dart';

class OnboardingController extends StateNotifier<OnboardingState> {
  OnboardingController() : super(const OnboardingState());

  void setGoal(String goalType) {
    state = state.copyWith(
      goal: state.goal.copyWith(type: goalType),
      physique: state.physique.copyWith(
        // Adjust target weight default based on goal
        targetWeightKg: goalType == 'fat_loss'
            ? (state.physique.weightKg - 6).clamp(30, 200)
            : (state.physique.weightKg + 8).clamp(30, 200),
      ),
    );
  }

  void updatePhysique({
    int? age,
    String? sex,
    double? heightCm,
    double? weightKg,
    double? targetWeightKg,
  }) {
    state = state.copyWith(
      physique: state.physique.copyWith(
        age: age,
        sex: sex,
        heightCm: heightCm,
        weightKg: weightKg,
        targetWeightKg: targetWeightKg,
      ),
    );
  }

  void updateTraining({
    bool? resistanceTraining,
    int? trainingDaysPerWeek,
    String? usualWorkoutTime,
    int? workoutDurationMinutes,
    String? activityLevel,
  }) {
    state = state.copyWith(
      training: state.training.copyWith(
        resistanceTraining: resistanceTraining,
        trainingDaysPerWeek: trainingDaysPerWeek,
        usualWorkoutTime: usualWorkoutTime,
        workoutDurationMinutes: workoutDurationMinutes,
        activityLevel: activityLevel,
      ),
    );
  }

  void updateLifestyle({
    String? livingArrangement,
    bool? hasMess,
    List<String>? messMeals,
    List<String>? availableEquipment,
    String? wakeTime,
    String? workOrCollegeStartTime,
    String? workOrCollegeEndTime,
    String? sleepTime,
  }) {
    state = state.copyWith(
      lifestyle: state.lifestyle.copyWith(
        livingArrangement: livingArrangement,
        hasMess: hasMess,
        messMeals: messMeals,
        availableEquipment: availableEquipment,
        wakeTime: wakeTime,
        workOrCollegeStartTime: workOrCollegeStartTime,
        workOrCollegeEndTime: workOrCollegeEndTime,
        sleepTime: sleepTime,
      ),
    );
  }

  void setMessMeals(List<String> meals) {
    final updatedLifestyle = state.lifestyle.copyWith(messMeals: meals);

    final currentSelections = {for (var m in state.messSelections) m.mealName: m};
    final newSelections = meals.map((mealName) {
      if (currentSelections.containsKey(mealName)) {
        return currentSelections[mealName]!;
      }
      return MessMealItem(
        mealName: mealName,
        rotiCount: mealName == 'breakfast' ? 2 : (mealName == 'snack' ? 1 : 3),
        ricePortion: (mealName == 'breakfast' || mealName == 'snack') ? 'none' : 'medium',
        dalPortion: 'medium',
        sabziPortion: 'medium',
      );
    }).toList();

    state = state.copyWith(
      lifestyle: updatedLifestyle,
      messSelections: newSelections,
    );
  }

  void updateMessItem(String mealName, {int? rotiCount, String? ricePortion, String? dalPortion, String? sabziPortion}) {
    bool found = false;
    final updatedList = state.messSelections.map((item) {
      if (item.mealName == mealName) {
        found = true;
        return item.copyWith(
          rotiCount: rotiCount,
          ricePortion: ricePortion,
          dalPortion: dalPortion,
          sabziPortion: sabziPortion,
        );
      }
      return item;
    }).toList();

    if (!found) {
      updatedList.add(MessMealItem(
        mealName: mealName,
        rotiCount: rotiCount ?? 3,
        ricePortion: ricePortion ?? 'medium',
        dalPortion: dalPortion ?? 'medium',
        sabziPortion: sabziPortion ?? 'medium',
      ));
    }

    state = state.copyWith(messSelections: updatedList);
  }

  void updateBudget({double? monthlyExtraBudget, bool? messPaidSeparately}) {
    state = state.copyWith(
      budget: state.budget.copyWith(
        monthlyExtraBudget: monthlyExtraBudget,
        messPaidSeparately: messPaidSeparately,
      ),
    );
  }

  void updatePreferences({String? dietType, List<String>? allergies, List<String>? dislikedFoods}) {
    state = state.copyWith(
      preferences: state.preferences.copyWith(
        dietType: dietType,
        allergies: allergies,
        dislikedFoods: dislikedFoods,
      ),
    );
  }

  void nextStep() {
    if (state.currentStep < 6) {
      state = state.copyWith(currentStep: state.currentStep + 1);
    }
  }

  void previousStep() {
    if (state.currentStep > 1) {
      state = state.copyWith(currentStep: state.currentStep - 1);
    }
  }
}

final onboardingControllerProvider = StateNotifierProvider<OnboardingController, OnboardingState>((ref) {
  return OnboardingController();
});
