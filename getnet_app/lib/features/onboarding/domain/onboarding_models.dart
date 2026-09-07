class PhysiqueData {
  final int age;
  final String sex;
  final double heightCm;
  final double weightKg;
  final double targetWeightKg;
  final double? bodyFatPercentage;

  const PhysiqueData({
    this.age = 22,
    this.sex = 'male',
    this.heightCm = 172.0,
    this.weightKg = 65.0,
    this.targetWeightKg = 72.0,
    this.bodyFatPercentage,
  });

  PhysiqueData copyWith({
    int? age,
    String? sex,
    double? heightCm,
    double? weightKg,
    double? targetWeightKg,
    double? bodyFatPercentage,
  }) {
    return PhysiqueData(
      age: age ?? this.age,
      sex: sex ?? this.sex,
      heightCm: heightCm ?? this.heightCm,
      weightKg: weightKg ?? this.weightKg,
      targetWeightKg: targetWeightKg ?? this.targetWeightKg,
      bodyFatPercentage: bodyFatPercentage ?? this.bodyFatPercentage,
    );
  }

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{
      'age': age,
      'sex': sex,
      'heightCm': heightCm.toInt(),
      'weightKg': weightKg.toInt(),
      'targetWeightKg': targetWeightKg.toInt(),
    };
    if (bodyFatPercentage != null) {
      map['bodyFatPercentage'] = bodyFatPercentage;
    }
    return map;
  }
}

class GoalData {
  final String type; // 'muscle_gain', 'fat_loss', 'recomposition', 'maintenance'
  final String pace;

  const GoalData({
    this.type = 'muscle_gain',
    this.pace = 'moderate',
  });

  GoalData copyWith({String? type, String? pace}) {
    return GoalData(
      type: type ?? this.type,
      pace: pace ?? this.pace,
    );
  }
}

class TrainingData {
  final bool resistanceTraining;
  final int trainingDaysPerWeek;
  final String usualWorkoutTime; // "18:00"
  final int workoutDurationMinutes;
  final String activityLevel;

  const TrainingData({
    this.resistanceTraining = true,
    this.trainingDaysPerWeek = 5,
    this.usualWorkoutTime = '18:00',
    this.workoutDurationMinutes = 75,
    this.activityLevel = 'moderate',
  });

  TrainingData copyWith({
    bool? resistanceTraining,
    int? trainingDaysPerWeek,
    String? usualWorkoutTime,
    int? workoutDurationMinutes,
    String? activityLevel,
  }) {
    return TrainingData(
      resistanceTraining: resistanceTraining ?? this.resistanceTraining,
      trainingDaysPerWeek: trainingDaysPerWeek ?? this.trainingDaysPerWeek,
      usualWorkoutTime: usualWorkoutTime ?? this.usualWorkoutTime,
      workoutDurationMinutes: workoutDurationMinutes ?? this.workoutDurationMinutes,
      activityLevel: activityLevel ?? this.activityLevel,
    );
  }

  Map<String, dynamic> toJson() => {
        'liftsWeights': resistanceTraining,
        'trainingDaysPerWeek': trainingDaysPerWeek,
        'workoutTime': usualWorkoutTime,
        'workoutDurationMinutes': workoutDurationMinutes,
        'activityLevel': activityLevel,
      };
}

class LifestyleData {
  final String livingArrangement; // 'home', 'hostel', 'pg', 'alone'
  final bool hasMess;
  final List<String> messMeals;
  final List<String> availableEquipment;
  final String wakeTime;
  final String workOrCollegeStartTime;
  final String workOrCollegeEndTime;
  final String sleepTime;

  const LifestyleData({
    this.livingArrangement = 'hostel',
    this.hasMess = true,
    this.messMeals = const ['breakfast', 'lunch', 'dinner'],
    this.availableEquipment = const ['none'],
    this.wakeTime = '07:00',
    this.workOrCollegeStartTime = '09:00',
    this.workOrCollegeEndTime = '16:00',
    this.sleepTime = '00:00',
  });

  LifestyleData copyWith({
    String? livingArrangement,
    bool? hasMess,
    List<String>? messMeals,
    List<String>? availableEquipment,
    String? wakeTime,
    String? workOrCollegeStartTime,
    String? workOrCollegeEndTime,
    String? sleepTime,
  }) {
    return LifestyleData(
      livingArrangement: livingArrangement ?? this.livingArrangement,
      hasMess: hasMess ?? this.hasMess,
      messMeals: messMeals ?? this.messMeals,
      availableEquipment: availableEquipment ?? this.availableEquipment,
      wakeTime: wakeTime ?? this.wakeTime,
      workOrCollegeStartTime: workOrCollegeStartTime ?? this.workOrCollegeStartTime,
      workOrCollegeEndTime: workOrCollegeEndTime ?? this.workOrCollegeEndTime,
      sleepTime: sleepTime ?? this.sleepTime,
    );
  }
}

class BudgetData {
  final double monthlyExtraBudget; // e.g. 2000 INR
  final bool messPaidSeparately;

  const BudgetData({
    this.monthlyExtraBudget = 2000.0,
    this.messPaidSeparately = true,
  });

  BudgetData copyWith({
    double? monthlyExtraBudget,
    bool? messPaidSeparately,
  }) {
    return BudgetData(
      monthlyExtraBudget: monthlyExtraBudget ?? this.monthlyExtraBudget,
      messPaidSeparately: messPaidSeparately ?? this.messPaidSeparately,
    );
  }

  Map<String, dynamic> toJson() => {
        'monthlyExtraBudget': monthlyExtraBudget.toInt(),
        'messPaidSeparately': messPaidSeparately,
      };
}

class FoodPreferenceData {
  final String dietType; // 'vegetarian', 'eggetarian', 'non_vegetarian', 'vegan'
  final List<String> allergies;
  final List<String> dislikedFoods;

  const FoodPreferenceData({
    this.dietType = 'vegetarian',
    this.allergies = const [],
    this.dislikedFoods = const [],
  });

  FoodPreferenceData copyWith({
    String? dietType,
    List<String>? allergies,
    List<String>? dislikedFoods,
  }) {
    return FoodPreferenceData(
      dietType: dietType ?? this.dietType,
      allergies: allergies ?? this.allergies,
      dislikedFoods: dislikedFoods ?? this.dislikedFoods,
    );
  }

  Map<String, dynamic> toJson() => {
        'dietType': dietType,
        'allergies': allergies,
        'dislikedFoods': dislikedFoods,
      };
}

class MessMealItem {
  final String mealName; // 'breakfast', 'lunch', 'dinner'
  final int rotiCount;
  final String ricePortion; // 'none', 'half', 'medium', 'large'
  final String dalPortion;
  final String sabziPortion;

  const MessMealItem({
    required this.mealName,
    this.rotiCount = 3,
    this.ricePortion = 'medium',
    this.dalPortion = 'medium',
    this.sabziPortion = 'medium',
  });

  MessMealItem copyWith({
    int? rotiCount,
    String? ricePortion,
    String? dalPortion,
    String? sabziPortion,
  }) {
    return MessMealItem(
      mealName: mealName,
      rotiCount: rotiCount ?? this.rotiCount,
      ricePortion: ricePortion ?? this.ricePortion,
      dalPortion: dalPortion ?? this.dalPortion,
      sabziPortion: sabziPortion ?? this.sabziPortion,
    );
  }

  Map<String, dynamic> toJson() => {
        'mealName': mealName,
        'rotiCount': rotiCount,
        'ricePortion': ricePortion,
        'dalPortion': dalPortion,
        'sabziPortion': sabziPortion,
      };
}
