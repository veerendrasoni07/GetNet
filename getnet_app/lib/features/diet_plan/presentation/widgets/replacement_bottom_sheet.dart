import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/quantity_formatter.dart';
import '../../../onboarding/presentation/onboarding_controller.dart';
import '../../data/diet_plan_repository.dart';

class ReplacementBottomSheet extends ConsumerStatefulWidget {
  final String foodId;
  final String foodName;
  final Function(Map<String, dynamic> replacement) onSelectReplacement;

  const ReplacementBottomSheet({
    super.key,
    required this.foodId,
    required this.foodName,
    required this.onSelectReplacement,
  });

  @override
  ConsumerState<ReplacementBottomSheet> createState() => _ReplacementBottomSheetState();
}

class _ReplacementBottomSheetState extends ConsumerState<ReplacementBottomSheet> {
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _options = [];

  @override
  void initState() {
    super.initState();
    _fetchSubstitutions();
  }

  Future<void> _fetchSubstitutions() async {
    try {
      final state = ref.read(onboardingControllerProvider);
      final payload = {
        'profile': state.toBackendPayload()['profile'],
        'targetFoodId': widget.foodId,
        'currentSelectedFoodIds': [],
      };

      final options = await ref.read(dietPlanRepositoryProvider).getSubstitutions(payload);

      if (!mounted) return;
      setState(() {
        _options = options;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'Replace ${widget.foodName}',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          if (_isLoading) ...[
            const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator())),
          ] else if (_error != null) ...[
            Text(_error!, style: const TextStyle(color: Colors.red)),
          ] else if (_options.isEmpty) ...[
            const Text('No suitable replacements found matching constraints.'),
          ] else ...[
            Column(
              children: _options.map((opt) {
                final food = opt['replacementFood'] ?? {};
                final name = food['name'] ?? 'Substitute Item';
                final servings = opt['servings'] ?? 1;
                final servingUnit = food['servingUnit'] ?? 'serving';
                final costDeltaText = opt['costDeltaText'] ?? '+₹0/day';
                final protein = opt['protein'] ?? 0;
                final calories = opt['calories'] ?? 0;

                final qtyText = QuantityFormatter.formatAbsoluteQuantity((servings as num).toDouble(), servingUnit, name);

                return Container(
                  margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: ListTile(
                    title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    subtitle: Text('$qtyText • ${protein}g protein, $calories kcal', style: const TextStyle(fontSize: 12)),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(costDeltaText, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 14)),
                        const Text('Tap to select', style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                      ],
                    ),
                    onTap: () {
                      widget.onSelectReplacement(opt);
                      Navigator.pop(context);
                    },
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }
}

// Modal sheet enabling seamless in-place meal replacement with live macro recalibration.
