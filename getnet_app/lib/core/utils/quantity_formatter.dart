/// Formats food quantities as absolute human-friendly values rather than
/// multiplicative strings like "0.7 x 500 ml" or "5.2 x 2 bananas".
class QuantityFormatter {
  /// Converts servings and serving unit into an absolute quantity string.
  /// E.g.
  /// - servings: 0.7, unit: "500 ml" -> "350 ml"
  /// - servings: 5.2, unit: "2 bananas" -> "10 Bananas"
  /// - servings: 2.0, unit: "2 eggs" -> "4 Eggs"
  /// - servings: 2.0, unit: "3 eggs" -> "6 Eggs"
  /// - servings: 1.5, unit: "50 g" -> "75 g"
  /// - servings: 1.5, unit: "1 scoop (32g)" -> "1.5 scoops (48g)"
  static String formatAbsoluteQuantity(
    double servings,
    String servingUnit, [
    String foodName = '',
  ]) {
    final unit = servingUnit.trim();
    if (unit.isEmpty) {
      return _formatNumber(servings);
    }

    // 1. Scoop pattern with grams: e.g. "1 scoop (32g)" or "1 scoop"
    final scoopMatch = RegExp(r'^(\d+(?:\.\d+)?)\s*scoops?(?:\s*\((?:approx\.\s*)?(\d+(?:\.\d+)?)\s*g\))?', caseSensitive: false).firstMatch(unit);
    if (scoopMatch != null) {
      final baseScoops = double.tryParse(scoopMatch.group(1) ?? '1') ?? 1.0;
      final totalScoops = baseScoops * servings;
      final baseGrams = scoopMatch.group(2) != null ? double.tryParse(scoopMatch.group(2)!) : null;

      final scoopStr = totalScoops == 1.0 ? '1 scoop' : '${_formatNumber(totalScoops)} scoops';
      if (baseGrams != null) {
        final totalGrams = (baseGrams * servings).round();
        return '$scoopStr (${totalGrams}g)';
      }
      return scoopStr;
    }

    // 2. Liquid volume: ml or L
    final mlMatch = RegExp(r'^(\d+(?:\.\d+)?)\s*(ml|milliliters?|l|liters?)\b(.*)$', caseSensitive: false).firstMatch(unit);
    if (mlMatch != null) {
      final baseAmount = double.tryParse(mlMatch.group(1) ?? '') ?? 1.0;
      final unitName = (mlMatch.group(2) ?? 'ml').toLowerCase();
      final suffix = (mlMatch.group(3) ?? '').trim();

      if (unitName.startsWith('l')) {
        final totalL = baseAmount * servings;
        return '${_formatNumber(totalL)} L${suffix.isNotEmpty ? ' $suffix' : ''}';
      } else {
        final totalMl = baseAmount * servings;
        if (totalMl >= 1000 && totalMl % 1000 == 0) {
          return '${(totalMl / 1000).toStringAsFixed(0)} L${suffix.isNotEmpty ? ' $suffix' : ''}';
        }
        return '${totalMl.round()} ml${suffix.isNotEmpty ? ' $suffix' : ''}';
      }
    }

    // 3. Weight: g or kg
    final gMatch = RegExp(r'^(\d+(?:\.\d+)?)\s*(g|grams?|kg|kilograms?)\b(.*)$', caseSensitive: false).firstMatch(unit);
    if (gMatch != null) {
      final baseAmount = double.tryParse(gMatch.group(1) ?? '') ?? 1.0;
      final unitName = (gMatch.group(2) ?? 'g').toLowerCase();
      final suffix = (gMatch.group(3) ?? '').trim();

      if (unitName.startsWith('kg')) {
        final totalKg = baseAmount * servings;
        return '${_formatNumber(totalKg)} kg${suffix.isNotEmpty ? ' $suffix' : ''}';
      } else {
        final totalG = (baseAmount * servings).round();
        return '$totalG g${suffix.isNotEmpty ? ' $suffix' : ''}';
      }
    }

    // 4. Discrete items: e.g. "2 bananas", "2 eggs", "3 eggs", "1 apple", "2 slices"
    final itemMatch = RegExp(r'^(\d+(?:\.\d+)?)\s*([a-zA-Z\s]+)$').firstMatch(unit);
    if (itemMatch != null) {
      final baseCount = double.tryParse(itemMatch.group(1) ?? '') ?? 1.0;
      final rawItem = itemMatch.group(2)!.trim();
      final totalCount = baseCount * servings;
      final roundedCount = totalCount.round();

      // Pluralize/Singularize nicely
      final formattedName = _formatItemName(roundedCount, rawItem);
      return '$roundedCount $formattedName';
    }

    // 5. Cup / bowl
    final cupMatch = RegExp(r'^(\d+(?:\.\d+)?)\s*(cups?|bowls?|katori)\b(.*)$', caseSensitive: false).firstMatch(unit);
    if (cupMatch != null) {
      final baseCount = double.tryParse(cupMatch.group(1) ?? '') ?? 1.0;
      final cupWord = cupMatch.group(2)!.toLowerCase();
      final suffix = (cupMatch.group(3) ?? '').trim();
      final total = baseCount * servings;
      final word = total == 1.0 ? cupWord.replaceAll('s', '') : (cupWord.endsWith('s') ? cupWord : '${cupWord}s');
      return '${_formatNumber(total)} $word${suffix.isNotEmpty ? ' $suffix' : ''}';
    }

    // 6. Generic "serving" or "servings"
    if (unit.toLowerCase().contains('serving')) {
      if (foodName.isNotEmpty) {
        // If food name has count hints (e.g. Eggs, Bananas)
        final lowerName = foodName.toLowerCase();
        if (lowerName.contains('egg')) {
          final eggCount = (servings * 2).round(); // default 2 eggs per serving
          return '$eggCount ${_formatItemName(eggCount, 'Eggs')}';
        }
        if (lowerName.contains('banana')) {
          final count = (servings * 1).round();
          return '$count ${_formatItemName(count, 'Bananas')}';
        }
      }
      final s = _formatNumber(servings);
      return servings == 1.0 ? '1 serving' : '$s servings';
    }

    // Fallback: if unit is already plain text, multiply cleanly
    return '${_formatNumber(servings)} $unit';
  }

  /// Cleans up any existing raw strings like "0.7 x 500 ml" or "5.2 x 2 bananas"
  /// that may be present in cached models or legacy backend outputs.
  static String cleanQuantityText(String rawText, [String foodName = '']) {
    if (rawText.isEmpty) return '';
    final trimmed = rawText.trim();

    // Match "0.7 x 500 ml" or "5.2 X 2 bananas" or "2 x 2 eggs"
    final multWithNumMatch = RegExp(
      r'^(\d+(?:\.\d+)?)\s*[xX*]\s*(\d+(?:\.\d+)?)\s*([a-zA-Z\s()]+.*)$',
    ).firstMatch(trimmed);

    if (multWithNumMatch != null) {
      final servings = double.tryParse(multWithNumMatch.group(1) ?? '1') ?? 1.0;
      final baseQty = double.tryParse(multWithNumMatch.group(2) ?? '1') ?? 1.0;
      final unitPart = multWithNumMatch.group(3)!.trim();

      // Delegate to formatAbsoluteQuantity with combined servingUnit
      final combinedUnit = '$baseQty $unitPart';
      return formatAbsoluteQuantity(servings, combinedUnit, foodName);
    }

    // Match "2 x 2" (without unit word, e.g. "5.2 X 2")
    final multNumbersOnly = RegExp(r'^(\d+(?:\.\d+)?)\s*[xX*]\s*(\d+(?:\.\d+)?)$').firstMatch(trimmed);
    if (multNumbersOnly != null) {
      final a = double.tryParse(multNumbersOnly.group(1) ?? '1') ?? 1.0;
      final b = double.tryParse(multNumbersOnly.group(2) ?? '1') ?? 1.0;
      final total = (a * b).round();
      if (foodName.isNotEmpty) {
        return '$total ${_formatItemName(total, foodName)}';
      }
      return '$total';
    }

    // Match "2 x eggs" or "0.7 x milk"
    final multUnitOnly = RegExp(r'^(\d+(?:\.\d+)?)\s*[xX*]\s*([a-zA-Z\s()]+.*)$').firstMatch(trimmed);
    if (multUnitOnly != null) {
      final servings = double.tryParse(multUnitOnly.group(1) ?? '1') ?? 1.0;
      final unitPart = multUnitOnly.group(2)!.trim();
      return formatAbsoluteQuantity(servings, unitPart, foodName);
    }

    return trimmed;
  }

  static String _formatNumber(double val) {
    if (val == val.roundToDouble()) {
      return val.toInt().toString();
    }
    // Round to 1 decimal
    return val.toStringAsFixed(1).replaceAll(RegExp(r'\.0$'), '');
  }

  static String _formatItemName(int count, String name) {
    final clean = name.trim();
    final lower = clean.toLowerCase();

    // Capitalize first letter
    String cap(String s) => s.isEmpty ? '' : s[0].toUpperCase() + s.substring(1);

    if (count == 1) {
      if (lower.endsWith('s')) {
        return cap(clean.substring(0, clean.length - 1));
      }
      return cap(clean);
    } else {
      if (lower.endsWith('s')) {
        return cap(clean);
      }
      return '${cap(clean)}s';
    }
  }
}
