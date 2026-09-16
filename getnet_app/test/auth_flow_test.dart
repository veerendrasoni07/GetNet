import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getnet_app/features/auth/domain/user_model.dart';
import 'package:getnet_app/features/auth/presentation/auth_controller.dart';
import 'package:getnet_app/features/auth/presentation/login_screen.dart';

void main() {
  group('Auth Domain & State Tests', () {
    test('UserModel serializes and deserializes correctly', () {
      final user = UserModel(
        id: 'u_123',
        email: 'alex@hostel.edu',
        name: 'Alex Patel',
        picture: 'https://lh3.googleusercontent.com/pic',
        token: 'mock_jwt_token',
        hasCompletedOnboarding: true,
      );

      final json = user.toJson();
      expect(json['id'], 'u_123');
      expect(json['email'], 'alex@hostel.edu');
      expect(json['hasCompletedOnboarding'], true);

      final fromJson = UserModel.fromJson(json);
      expect(fromJson.id, user.id);
      expect(fromJson.email, user.email);
      expect(fromJson.picture, user.picture);
      expect(fromJson.hasCompletedOnboarding, true);
    });

    test('UserModel copyWith maintains unmodified properties', () {
      const user = UserModel(
        id: 'u_456',
        email: 'sam@univ.edu',
        name: 'Sam',
        hasCompletedOnboarding: false,
      );

      final updated = user.copyWith(hasCompletedOnboarding: true);
      expect(updated.id, 'u_456');
      expect(updated.email, 'sam@univ.edu');
      expect(updated.hasCompletedOnboarding, true);
    });

    test('AuthState defaults and getters', () {
      const state = AuthState();
      expect(state.isAuthenticated, false);
      expect(state.hasCompletedOnboarding, false);

      const authedState = AuthState(
        user: UserModel(
          id: '1',
          email: 'test@example.com',
          name: 'Test',
          hasCompletedOnboarding: true,
        ),
      );
      expect(authedState.isAuthenticated, true);
      expect(authedState.hasCompletedOnboarding, true);
    });
  });

  group('LoginScreen Widget Tests', () {
    testWidgets('Renders Google Sign-In button and value highlights', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );

      expect(find.text('GetNutrition'), findsOneWidget);
      expect(find.text('Continue with Google'), findsOneWidget);
      expect(find.text('Hostel & Budget Friendly'), findsOneWidget);
      expect(find.text('Targeted Macro Distribution'), findsOneWidget);
      expect(find.text('Intelligent Adaptation'), findsOneWidget);
      expect(find.byType(ElevatedButton), findsOneWidget);
    });
  });
}
