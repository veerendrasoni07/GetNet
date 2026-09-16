import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/option_card.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/progress_header.dart';
import '../onboarding_controller.dart';

class LivingSituationScreen extends ConsumerWidget {
  const LivingSituationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(onboardingControllerProvider);
    final controller = ref.read(onboardingControllerProvider.notifier);
    final currentLiving = state.lifestyle.livingArrangement;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePaddingHorizontal),
          child: Column(
            children: [
              ProgressHeader(
                currentStep: 3,
                title: 'Where do you currently live?',
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppSpacing.lg),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      OptionCard(
                        title: 'Hostel',
                        description: 'Living in a student or working hostel with mess access.',
                        icon: Icons.domain,
                        isSelected: currentLiving == 'hostel',
                        onTap: () => controller.updateLifestyle(livingArrangement: 'hostel', hasMess: true),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      OptionCard(
                        title: 'PG (Paying Guest)',
                        description: 'Paying guest accommodation with optional mess/kitchen.',
                        icon: Icons.apartment,
                        isSelected: currentLiving == 'pg',
                        onTap: () => controller.updateLifestyle(livingArrangement: 'pg', hasMess: true),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      OptionCard(
                        title: 'Home',
                        description: 'Living with family with home-cooked meals.',
                        icon: Icons.home,
                        isSelected: currentLiving == 'home',
                        onTap: () => controller.updateLifestyle(livingArrangement: 'home', hasMess: false),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      OptionCard(
                        title: 'Alone / Apartment',
                        description: 'Rented apartment cooking self or hiring a cook.',
                        icon: Icons.single_bed,
                        isSelected: currentLiving == 'alone',
                        onTap: () => controller.updateLifestyle(livingArrangement: 'alone', hasMess: false),
                      ),
                    ],
                  ),
                ),
              ),
              PrimaryButton(
                text: context.canPop() && (currentLiving == 'home' || currentLiving == 'alone') ? 'Save & Review Profile' : 'Continue',
                onPressed: () {
                  if (context.canPop() && (currentLiving == 'home' || currentLiving == 'alone')) {
                    context.pop();
                  } else if (currentLiving == 'hostel' || currentLiving == 'pg') {
                    context.push('/onboarding/mess');
                  } else {
                    context.push('/onboarding/preferences');
                  }
                },
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}
