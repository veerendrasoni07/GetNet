import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import 'diet_plan_models.dart';

class DietPlanRepository {
  final ApiClient _apiClient;

  DietPlanRepository(this._apiClient);

  Future<DietPlanResponse> generatePlan(Map<String, dynamic> payload) async {
    final res = await _apiClient.post(ApiEndpoints.generatePlan, data: payload);
    if (res.data != null && res.data['success'] == true) {
      return DietPlanResponse.fromJson(res.data['data']);
    } else {
      throw Exception(res.data?['error'] ?? 'Failed to generate diet plan');
    }
  }

  Future<List<Map<String, dynamic>>> getSubstitutions(Map<String, dynamic> payload) async {
    final res = await _apiClient.post(ApiEndpoints.substituteFood, data: payload);
    if (res.data != null && res.data['success'] == true) {
      final List options = res.data['data']['options'] ?? [];
      return options.cast<Map<String, dynamic>>();
    } else {
      throw Exception(res.data?['error'] ?? 'Failed to get substitutions');
    }
  }

  Future<void> logMealCompletion(Map<String, dynamic> payload) async {
    await _apiClient.post(ApiEndpoints.logMeal, data: payload);
  }

  Future<void> logWeight(Map<String, dynamic> payload) async {
    await _apiClient.post(ApiEndpoints.logWeight, data: payload);
  }

  Future<Map<String, dynamic>?> submitAdaptiveCheckin(Map<String, dynamic> payload) async {
    final res = await _apiClient.post(ApiEndpoints.adaptiveCheckin, data: payload);
    if (res.data != null && res.data['success'] == true) {
      return res.data['data'] as Map<String, dynamic>;
    }
    return null;
  }

  Future<List<Map<String, dynamic>>> getFoods({String? search, String? category, String? city}) async {
    final query = <String, dynamic>{
      if (search != null) 'search': search,
      if (category != null) 'category': category,
      if (city != null) 'city': city,
    };
    final res = await _apiClient.get(ApiEndpoints.foods, queryParameters: query);
    if (res.data != null && res.data['success'] == true) {
      final List list = res.data['data'] ?? [];
      return list.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<Map<String, dynamic>?> getFoodDetails(String foodId, {String? city}) async {
    final query = <String, dynamic>{
      if (city != null) 'city': city,
    };
    final res = await _apiClient.get(ApiEndpoints.foodDetails(foodId), queryParameters: query);
    if (res.data != null && res.data['success'] == true) {
      return res.data['data'] as Map<String, dynamic>;
    }
    return null;
  }
}

final apiClientProvider = Provider((ref) => ApiClient());
final dietPlanRepositoryProvider = Provider((ref) => DietPlanRepository(ref.watch(apiClientProvider)));
