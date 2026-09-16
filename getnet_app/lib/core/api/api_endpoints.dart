abstract class ApiEndpoints {
  static const String health = '/health';
  static const String googleAuth = '/auth/google';
  static const String me = '/auth/me';
  static const String onboardingStatus = '/auth/onboarding-status';
  static const String deriveSchedule = '/profile/derive-schedule';
  static const String generatePlan = '/diet-plan/generate';
  static const String substituteFood = '/diet-plan/substitute';
  static const String logMeal = '/tracking/meal-log';
  static const String logWeight = '/tracking/weight';
  static const String adaptiveCheckin = '/tracking/adaptive-checkin';

  // Foods, Nutrition & Location Prices
  static const String foods = '/foods';
  static String foodDetails(String id) => '/foods/$id';
  static String foodPrice(String id) => '/foods/$id/price';
  static const String qualityReport = '/foods/admin/quality-report';
}
