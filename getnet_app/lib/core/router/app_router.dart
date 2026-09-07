import 'package:go_router/go_router.dart';
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

final GoRouter appRouter = GoRouter(
  initialLocation: '/intro',
  routes: [
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
  ],
);

// Centralized declarative GoRouter specification with typed navigation routes.
