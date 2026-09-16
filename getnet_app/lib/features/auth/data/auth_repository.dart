import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../domain/user_model.dart';

class AuthRepository {
  final ApiClient _apiClient;
  final GoogleSignIn _googleSignIn;

  static const String _keyToken = 'auth_token';
  static const String _keyUser = 'auth_user';

  AuthRepository({
    ApiClient? apiClient,
    GoogleSignIn? googleSignIn,
  })  : _apiClient = apiClient ?? ApiClient.instance,
        _googleSignIn = googleSignIn ??
            GoogleSignIn(
              scopes: ['email', 'profile'],
              serverClientId:
                  '1021115586711-ht0tncd95ue6qfea6vcqbrk3p9gbf7iq.apps.googleusercontent.com',
            );

  Future<UserModel?> restoreSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(_keyToken);
      final userJsonStr = prefs.getString(_keyUser);

      if (token == null || userJsonStr == null) {
        return null;
      }

      final userMap = jsonDecode(userJsonStr) as Map<String, dynamic>;
      final user = UserModel.fromJson(userMap, token: token);

      // Inject auth credentials into ApiClient
      _apiClient.setAuth(token: token, userId: user.id);

      // Verify token with backend (non-blocking validation)
      try {
        final res = await _apiClient.get(ApiEndpoints.me);
        if (res.data?['success'] == true && res.data?['user'] != null) {
          final updatedUser = UserModel.fromJson(res.data['user'], token: token);
          await _saveSession(updatedUser);
          return updatedUser;
        }
      } catch (e) {
        debugPrint('⚠️ Token verification check skipped/failed: $e');
        // Return locally stored user if network is temporarily unreachable
        return user;
      }

      return user;
    } catch (e) {
      debugPrint('❌ Error restoring session: $e');
      return null;
    }
  }

  /**
   * Authenticate with Google and exchange credentials with the backend.
   */
  Future<UserModel> signInWithGoogle() async {
    String? email;
    String? name;
    String? picture;
    String? googleId;
    String? idToken;

    // Check if running on Android/iOS/Web where GoogleSignIn is supported
    final isNativeGoogleSupported = kIsWeb ||
        defaultTargetPlatform == TargetPlatform.android ||
        defaultTargetPlatform == TargetPlatform.iOS;

    if (isNativeGoogleSupported) {
      try {
        final googleUser = await _googleSignIn.signIn();
        if (googleUser == null) {
          throw Exception('Sign in cancelled');
        }

        final googleAuth = await googleUser.authentication;
        idToken = googleAuth.idToken;
        email = googleUser.email;
        name = googleUser.displayName;
        picture = googleUser.photoUrl;
        googleId = googleUser.id;
      } catch (e) {
        debugPrint('⚠️ Native GoogleSignIn error, checking fallback: $e');
        rethrow;

      }
    }

    // Call backend /auth/google endpoint
    final payload = {
      'email': email,
      'name': name,
      if (picture != null) 'picture': picture,
      if (googleId != null) 'googleId': googleId,
      if (idToken != null) 'idToken': idToken,
    };

    final response = await _apiClient.post(ApiEndpoints.googleAuth, data: payload);

    if (response.data?['success'] != true) {
      throw Exception(response.data?['error'] ?? 'Google authentication failed');
    }

    final token = response.data['token'] as String;
    final userJson = response.data['user'] as Map<String, dynamic>;
    final user = UserModel.fromJson(userJson, token: token);

    // Save persistent credentials
    _apiClient.setAuth(token: token, userId: user.id);
    await _saveSession(user);

    return user;
  }


  Future<UserModel> setOnboardingCompleted(UserModel currentUser, bool completed) async {
    try {
      await _apiClient.patch(ApiEndpoints.onboardingStatus, data: {
        'hasCompletedOnboarding': completed,
      });
    } catch (e) {
      debugPrint('⚠️ Could not sync onboarding status to backend: $e');
    }

    final updated = currentUser.copyWith(hasCompletedOnboarding: completed);
    await _saveSession(updated);
    return updated;
  }

  Future<void> signOut() async {
    try {
      if (await _googleSignIn.isSignedIn()) {
        await _googleSignIn.signOut();
      }
    } catch (e) {
      debugPrint('Google signOut error: $e');
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyToken);
    await prefs.remove(_keyUser);

    _apiClient.clearAuth();
  }

  Future<void> _saveSession(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    if (user.token != null) {
      await prefs.setString(_keyToken, user.token!);
    }
    await prefs.setString(_keyUser, jsonEncode(user.toJson()));
  }
}
