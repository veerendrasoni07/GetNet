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
}

final apiClientProvider = Provider((ref) => ApiClient());
final dietPlanRepositoryProvider = Provider((ref) => DietPlanRepository(ref.watch(apiClientProvider)));
