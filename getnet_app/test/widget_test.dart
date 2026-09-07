import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getnet_app/main.dart';

void main() {
  testWidgets('GetNutrition App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: GetNutritionApp(),
      ),
    );

    // Verify intro screen renders
    expect(find.text('A diet built around your life.'), findsOneWidget);
    expect(find.text('Build My Plan'), findsOneWidget);
  });
}
