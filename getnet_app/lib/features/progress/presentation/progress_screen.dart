import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/primary_button.dart';
import '../../diet_plan/data/diet_plan_repository.dart';
import '../../onboarding/presentation/onboarding_controller.dart';
import '../domain/badge_model.dart';
import 'widgets/animated_streak_card.dart';
import 'widgets/badges_grid.dart';

class ProgressScreen extends ConsumerStatefulWidget {
  const ProgressScreen({super.key});

  @override
  ConsumerState<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends ConsumerState<ProgressScreen> {
  double _loggedWeight = 60.4;
  int _currentStreak = 7;
  List<bool> _completedDays = [true, true, true, true, true, false, false];
  late List<PhysiqueBadge> _badges;

  @override
  void initState() {
    super.initState();
    _badges = List.from(initialPhysiqueBadges);
  }

  void _checkAndUnlockBadges(int updatedStreak) {
    bool newlyUnlocked = false;
    String unlockedBadgeTitle = '';

    setState(() {
      _badges = _badges.map((badge) {
        if (!badge.isUnlocked && updatedStreak >= badge.requiredDays) {
          newlyUnlocked = true;
          unlockedBadgeTitle = badge.title;
          return badge.copyWith(isUnlocked: true, unlockedAt: DateTime.now());
        }
        return badge;
      }).toList();
    });

    if (newlyUnlocked) {
      _showCelebrationDialog(unlockedBadgeTitle);
    }
  }

  void _showCelebrationDialog(String badgeTitle) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFFFFF3E0),
              ),
              child: const Icon(Icons.emoji_events_rounded, color: AppColors.primary, size: 48),
            ),
            const SizedBox(height: 16),
            const Text(
              '🎉 BADGE UNLOCKED!',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.primary, letterSpacing: 1.1),
            ),
            const SizedBox(height: 6),
            Text(
              badgeTitle,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 10),
            const Text(
              'Your consistency is paying off! Keep pushing towards your target physique.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                minimumSize: const Size(double.infinity, 44),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text('Keep It Up!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(onboardingControllerProvider);
    final p = state.physique;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Physique & Streaks', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePaddingHorizontal, vertical: AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Animated Flame & Streak Card
              AnimatedStreakCard(
                streakCount: _currentStreak,
                completedDays: _completedDays,
              ),

              const SizedBox(height: AppSpacing.lg),

              // Current vs Target Weight Card
              Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                  border: Border.all(color: AppColors.border),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Expanded(
                          child: Column(
                            children: [
                              const Text('Starting', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                              const SizedBox(height: 4),
                              FittedBox(fit: BoxFit.scaleDown, child: Text('${p.weightKg.toInt()} kg', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold))),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            children: [
                              const Text('Current', style: TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              FittedBox(fit: BoxFit.scaleDown, child: Text('${_loggedWeight.toStringAsFixed(1)} kg', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.primary))),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            children: [
                              const Text('Target', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                              const SizedBox(height: 4),
                              FittedBox(fit: BoxFit.scaleDown, child: Text('${p.targetWeightKg.toInt()} kg', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold))),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 24),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(child: Text('Weekly Trend:', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500), overflow: TextOverflow.ellipsis)),
                        SizedBox(width: AppSpacing.xs),
                        Flexible(child: Text('+0.23 kg/week (On Track)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.success), overflow: TextOverflow.ellipsis)),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.lg),

              // Adherence Metrics Row
              Row(
                children: [
                  const Expanded(
                    child: _MetricCard(
                      title: 'Diet Adherence',
                      value: '88%',
                      icon: Icons.check_circle_outline,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  const Expanded(
                    child: _MetricCard(
                      title: 'Training Sessions',
                      value: '5 / 5',
                      icon: Icons.fitness_center,
                      color: AppColors.success,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.xl),

              // Consistency & Achievement Badges Section
              BadgesGrid(
                badges: _badges,
                currentStreak: _currentStreak,
              ),

              const SizedBox(height: AppSpacing.xl),

              PrimaryButton(
                text: 'Log Check-in & Boost Streak',
                icon: Icons.monitor_weight_outlined,
                onPressed: () {
                  _showWeightCheckinDialog(context);
                },
              ),

              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }

  void _showWeightCheckinDialog(BuildContext context) {
    double tempWeight = _loggedWeight;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Weekly Weight Check-in', style: TextStyle(fontWeight: FontWeight.bold)),
        content: StatefulBuilder(
          builder: (context, setDialogState) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Record your current weight to keep your streak burning! 🔥'),
              const SizedBox(height: AppSpacing.md),
              Text('${tempWeight.toStringAsFixed(1)} kg', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.primary)),
              Slider(
                value: tempWeight,
                min: 40,
                max: 120,
                divisions: 800,
                activeColor: AppColors.primary,
                onChanged: (val) {
                  setDialogState(() {
                    tempWeight = val;
                  });
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () {
              final newStreak = _currentStreak + 1;
              final updatedDays = List<bool>.from(_completedDays);
              // Mark next day as completed
              for (int i = 0; i < updatedDays.length; i++) {
                if (!updatedDays[i]) {
                  updatedDays[i] = true;
                  break;
                }
              }

              setState(() {
                _loggedWeight = tempWeight;
                _currentStreak = newStreak;
                _completedDays = updatedDays;
              });
              ref.read(onboardingControllerProvider.notifier).updatePhysique(weightKg: tempWeight);
              ref.read(dietPlanRepositoryProvider).logWeight({
                'userId': 'user_local',
                'date': DateTime.now().toIso8601String().split('T')[0],
                'weightKg': tempWeight,
              });
              Navigator.pop(context);

              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: AppColors.primaryDark,
                  content: Text('🔥 Check-in recorded! Streak boosted to $newStreak Days!'),
                  behavior: SnackBarBehavior.floating,
                ),
              );

              _checkAndUnlockBadges(newStreak);
            },
            child: const Text('Save & Boost Streak', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _MetricCard({required this.title, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: AppSpacing.sm),
          Text(title, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}

// Gamified progress view featuring animated streak flames, weight trend charts, and badge achievements.
