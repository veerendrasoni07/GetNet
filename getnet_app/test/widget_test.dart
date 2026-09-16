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

    // Verify initial LoginScreen renders with Google sign in button
    expect(find.text('GetNutrition'), findsOneWidget);
    expect(find.text('Continue with Google'), findsOneWidget);
  });
}
