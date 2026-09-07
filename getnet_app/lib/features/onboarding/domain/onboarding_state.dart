import 'onboarding_models.dart';

class OnboardingState {
  final PhysiqueData physique;
  final GoalData goal;
  final TrainingData training;
  final LifestyleData lifestyle;
  final BudgetData budget;
  final FoodPreferenceData preferences;
  final List<MessMealItem> messSelections;
  final int currentStep;
  final bool isSubmitting;
  final String? error;

  const OnboardingState({
    this.physique = const PhysiqueData(),
    this.goal = const GoalData(),
    this.training = const TrainingData(),
    this.lifestyle = const LifestyleData(),
    this.budget = const BudgetData(),
    this.preferences = const FoodPreferenceData(),
    this.messSelections = const [
      MessMealItem(mealName: 'breakfast', rotiCount: 2, ricePortion: 'none', dalPortion: 'medium', sabziPortion: 'medium'),
      MessMealItem(mealName: 'lunch', rotiCount: 3, ricePortion: 'medium', dalPortion: 'medium', sabziPortion: 'medium'),
      MessMealItem(mealName: 'dinner', rotiCount: 3, ricePortion: 'none', dalPortion: 'medium', sabziPortion: 'medium'),
    ],
    this.currentStep = 1,
    this.isSubmitting = false,
    this.error,
  });

  OnboardingState copyWith({
    PhysiqueData? physique,
    GoalData? goal,
    TrainingData? training,
    LifestyleData? lifestyle,
    BudgetData? budget,
    FoodPreferenceData? preferences,
    List<MessMealItem>? messSelections,
    int? currentStep,
    bool? isSubmitting,
    String? error,
  }) {
    return OnboardingState(
      physique: physique ?? this.physique,
      goal: goal ?? this.goal,
      training: training ?? this.training,
      lifestyle: lifestyle ?? this.lifestyle,
      budget: budget ?? this.budget,
      preferences: preferences ?? this.preferences,
      messSelections: messSelections ?? this.messSelections,
      currentStep: currentStep ?? this.currentStep,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: error,
    );
  }

  Map<String, dynamic> toBackendPayload() {
    return {
      'profile': {
        'body': physique.toJson()..['goal'] = goal.type,
        'training': training.toJson(),
        'lifestyle': {
          'livingSituation': lifestyle.livingArrangement,
          'hasMess': lifestyle.hasMess,
          'messMeals': lifestyle.messMeals,
          'availableEquipment': lifestyle.availableEquipment,
        },
        'schedule': {
          'wakeUpTime': lifestyle.wakeTime,
          'collegeWorkStartTime': lifestyle.workOrCollegeStartTime,
          'collegeWorkEndTime': lifestyle.workOrCollegeEndTime,
          'workoutTime': training.usualWorkoutTime,
          'sleepTime': lifestyle.sleepTime,
        },
        'budget': budget.toJson(),
        'preferences': preferences.toJson(),
      },
      'messSelections': messSelections.map((m) => m.toJson()).toList(),
    };
  }
}
