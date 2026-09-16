import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/auth_controller.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/dashboard/presentation/today_dashboard_screen.dart';
import '../../features/diet_plan/presentation/plan_result_screen.dart';
import '../../features/onboarding/presentation/screens/body_details_screen.dart';
import '../../features/onboarding/presentation/screens/budget_profile_screen.dart';
import '../../features/onboarding/presentation/screens/food_preferences_screen.dart';
import '../../features/onboarding/presentation/screens/goal_selection_screen.dart';
import '../../features/onboarding/presentation/screens/hostel_mess_screen.dart';
import '../../features/onboarding/presentation/screens/intro_screen.dart';
import '../../features/onboarding/presentation/screens/living_situation_screen.dart';
import '../../features/onboarding/presentation/screens/onboarding_review_screen.dart';
import '../../features/onboarding/presentation/screens/plan_loading_screen.dart';
import '../../features/onboarding/presentation/screens/routine_schedule_screen.dart';
import '../../features/onboarding/presentation/screens/training_profile_screen.dart';
import '../../features/progress/presentation/progress_screen.dart';

List<RouteBase> get _appRoutes => [
  GoRoute(
    path: '/login',
    builder: (context, state) => const LoginScreen(),
  ),
  GoRoute(
    path: '/intro',
    builder: (context, state) => const IntroScreen(),
  ),
  GoRoute(
    path: '/onboarding/goal',
    builder: (context, state) => const GoalSelectionScreen(),
  ),
  GoRoute(
    path: '/onboarding/body',
    builder: (context, state) => const BodyDetailsScreen(),
  ),
  GoRoute(
    path: '/onboarding/training',
    builder: (context, state) => const TrainingProfileScreen(),
  ),
  GoRoute(
    path: '/onboarding/living',
    builder: (context, state) => const LivingSituationScreen(),
  ),
  GoRoute(
    path: '/onboarding/mess',
    builder: (context, state) => const HostelMessScreen(),
  ),
  GoRoute(
    path: '/onboarding/preferences',
    builder: (context, state) => const FoodPreferencesScreen(),
  ),
  GoRoute(
    path: '/onboarding/budget',
    builder: (context, state) => const BudgetProfileScreen(),
  ),
  GoRoute(
    path: '/onboarding/routine',
    builder: (context, state) => const RoutineScheduleScreen(),
  ),
  GoRoute(
    path: '/onboarding/review',
    builder: (context, state) => const OnboardingReviewScreen(),
  ),
  GoRoute(
    path: '/onboarding/plan-loading',
    builder: (context, state) => const PlanLoadingScreen(),
  ),
  GoRoute(
    path: '/plan-result',
    builder: (context, state) => const PlanResultScreen(),
  ),
  GoRoute(
    path: '/dashboard',
    builder: (context, state) => const TodayDashboardScreen(),
  ),
  GoRoute(
    path: '/progress',
    builder: (context, state) => const ProgressScreen(),
  ),
];

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: '/login',
    routes: _appRoutes,
    redirect: (context, state) {
      final isLoggingIn = state.matchedLocation == '/login';
      final isAuthenticated = authState.isAuthenticated;

      // If auth session check isn't finished yet, don't redirect
      if (!authState.isInitialCheckDone) {
        return null;
      }

      // If not logged in and not on login screen, redirect to login
      if (!isAuthenticated && !isLoggingIn) {
        return '/login';
      }

      // If logged in and on login screen, redirect to appropriate destination
      if (isAuthenticated && isLoggingIn) {
        if (authState.hasCompletedOnboarding) {
          return '/dashboard';
        } else {
          return '/intro';
        }
      }

      return null;
    },
  );
});

// Default standalone router instance for tests and direct access
final GoRouter appRouter = GoRouter(
  initialLocation: '/login',
  routes: _appRoutes,
);
