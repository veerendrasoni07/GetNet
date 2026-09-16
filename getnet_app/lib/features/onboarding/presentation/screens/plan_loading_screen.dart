import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../diet_plan/data/diet_plan_models.dart';
import '../../../diet_plan/data/diet_plan_repository.dart';
import '../onboarding_controller.dart';

final latestGeneratedPlanProvider = StateProvider<DietPlanResponse?>((ref) => null);

class PlanLoadingScreen extends ConsumerStatefulWidget {
  const PlanLoadingScreen({super.key});

  @override
  ConsumerState<PlanLoadingScreen> createState() => _PlanLoadingScreenState();
}

class _PlanLoadingScreenState extends ConsumerState<PlanLoadingScreen> {
  int _currentStepIndex = 0;
  String? _errorMessage;

  final List<String> _loadingSteps = [
    'Understanding your body & training',
    'Calculating target macros & calories',
    'Estimating mess food baseline',
    'Checking extra monthly budget',
    'Filtering practical Indian foods',
    'Fitting meals into your routine schedule',
  ];

  @override
  void initState() {
    super.initState();
    _startPlanGenerationPipeline();
  }

  Future<void> _startPlanGenerationPipeline() async {
    // Animate loader steps
    for (int i = 0; i < _loadingSteps.length; i++) {
      await Future.delayed(const Duration(milliseconds: 400));
      if (!mounted) return;
      setState(() {
        _currentStepIndex = i;
      });
    }

    try {
      final state = ref.read(onboardingControllerProvider);
      final payload = state.toBackendPayload();

      final response = await ref.read(dietPlanRepositoryProvider).generatePlan(payload);

      if (!mounted) return;
      ref.read(latestGeneratedPlanProvider.notifier).state = response;
      context.go('/plan-result');
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePaddingHorizontal),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: IntrinsicHeight(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Spacer(),
                      const SizedBox(
                        width: 60,
                        height: 60,
                        child: CircularProgressIndicator(
                          strokeWidth: 4,
                          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xxl),
                      const Text(
                        'Building Your Plan...',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xl),

                      // Animated Checklist
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          children: List.generate(_loadingSteps.length, (index) {
                            final isDone = index <= _currentStepIndex;
                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
                              child: Row(
                                children: [
                                  Icon(
                                    isDone ? Icons.check_circle : Icons.radio_button_unchecked,
                                    color: isDone ? AppColors.primary : AppColors.textLight,
                                    size: 20,
                                  ),
                                  const SizedBox(width: AppSpacing.md),
                                  Expanded(
                                    child: Text(
                                      _loadingSteps[index],
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: isDone ? FontWeight.w600 : FontWeight.normal,
                                        color: isDone ? AppColors.textPrimary : AppColors.textLight,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }),
                        ),
                      ),

                      if (_errorMessage != null) ...[
                        const SizedBox(height: AppSpacing.xl),
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            _errorMessage!,
                            style: TextStyle(color: Colors.red.shade800, fontSize: 13),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        ElevatedButton(
                          onPressed: () {
                            setState(() {
                              _errorMessage = null;
                              _currentStepIndex = 0;
                            });
                            _startPlanGenerationPipeline();
                          },
                          child: const Text('Retry'),
                        ),
                      ],
                      const Spacer(),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
