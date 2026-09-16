import 'package:flutter_test/flutter_test.dart';
import 'package:getnet_app/core/utils/quantity_formatter.dart';

void main() {
  group('QuantityFormatter Tests', () {
    test('Converts liquids to absolute volume (0.7 x 500 ml -> 350 ml)', () {
      final result = QuantityFormatter.formatAbsoluteQuantity(0.7, '500 ml');
      expect(result, '350 ml');
    });

    test('Converts countable bananas to absolute count (5.2 x 2 bananas -> 10 Bananas)', () {
      final result = QuantityFormatter.formatAbsoluteQuantity(5.2, '2 bananas');
      expect(result, '10 Bananas');
    });

    test('Converts eggs to absolute count (2 x 2 eggs -> 4 Eggs, 2 x 3 eggs -> 6 Eggs)', () {
      expect(QuantityFormatter.formatAbsoluteQuantity(2, '2 eggs'), '4 Eggs');
      expect(QuantityFormatter.formatAbsoluteQuantity(2, '3 eggs'), '6 Eggs');
      expect(QuantityFormatter.formatAbsoluteQuantity(1, '2 eggs'), '2 Eggs');
      expect(QuantityFormatter.formatAbsoluteQuantity(0.5, '2 eggs'), '1 Egg');
    });

    test('Converts weights to absolute grams (1.5 x 50 g -> 75 g)', () {
      expect(QuantityFormatter.formatAbsoluteQuantity(1.5, '50 g'), '75 g');
      expect(QuantityFormatter.formatAbsoluteQuantity(2, '50 g (dry weight)'), '100 g (dry weight)');
      expect(QuantityFormatter.formatAbsoluteQuantity(1.2, '100 g'), '120 g');
    });

    test('Converts protein powder scoops with grams (1.5 x 1 scoop (32g) -> 1.5 scoops (48g))', () {
      expect(QuantityFormatter.formatAbsoluteQuantity(1, '1 scoop (32g)'), '1 scoop (32g)');
      expect(QuantityFormatter.formatAbsoluteQuantity(1.5, '1 scoop (32g)'), '1.5 scoops (48g)');
      expect(QuantityFormatter.formatAbsoluteQuantity(2, '1 scoop (32g)'), '2 scoops (64g)');
    });

    test('cleanQuantityText normalizes existing legacy multiplicative strings', () {
      expect(QuantityFormatter.cleanQuantityText('0.7 x 500 ml'), '350 ml');
      expect(QuantityFormatter.cleanQuantityText('0.7 X 500 ml'), '350 ml');
      expect(QuantityFormatter.cleanQuantityText('5.2 x 2 bananas'), '10 Bananas');
      expect(QuantityFormatter.cleanQuantityText('5.2 X 2', 'Bananas'), '10 Bananas');
      expect(QuantityFormatter.cleanQuantityText('2 x 2 eggs'), '4 Eggs');
      expect(QuantityFormatter.cleanQuantityText('1.5 x 50 g'), '75 g');
      expect(QuantityFormatter.cleanQuantityText('3 Roti, 1 Rice, 1 Dal'), '3 Roti, 1 Rice, 1 Dal');
    });
  });
}
