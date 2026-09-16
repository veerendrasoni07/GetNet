import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/auth_repository.dart';
import '../domain/user_model.dart';

class AuthState {
  final UserModel? user;
  final bool isSigningIn;
  final bool isLoading;
  final bool isInitialCheckDone;
  final String? errorMessage;

  const AuthState({
    this.user,
    this.isSigningIn = false,
    this.isLoading = false,
    this.isInitialCheckDone = false,
    this.errorMessage,
  });

  bool get isAuthenticated => user != null;
  bool get hasCompletedOnboarding => user?.hasCompletedOnboarding ?? false;

  AuthState copyWith({
    UserModel? user,
    bool? isSigningIn,
    bool? isLoading,
    bool? isInitialCheckDone,
    String? errorMessage,
    bool clearUser = false,
  }) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isSigningIn: isSigningIn ?? this.isSigningIn,
      isLoading: isLoading ?? this.isLoading,
      isInitialCheckDone: isInitialCheckDone ?? this.isInitialCheckDone,
      errorMessage: errorMessage,
    );
  }
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

class AuthController extends StateNotifier<AuthState> {
  final AuthRepository _repository;

  AuthController(this._repository) : super(const AuthState()) {
    restoreSession();
  }

  /**
   * Attempt to restore user session from local storage.
   */
  Future<void> restoreSession() async {
    try {
      final user = await _repository.restoreSession();
      state = state.copyWith(
        user: user,
        isInitialCheckDone: true,
      );
    } catch (e) {
      state = state.copyWith(
        isInitialCheckDone: true,
        errorMessage: e.toString(),
      );
    }
  }

  /**
   * Trigger Google Sign-In flow and connect to backend identity.
   */
  Future<bool> signInWithGoogle() async {
    state = state.copyWith(isSigningIn: true, errorMessage: null);
    try {
      final user = await _repository.signInWithGoogle();
      state = state.copyWith(
        user: user,
        isSigningIn: false,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isSigningIn: false,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      );
      return false;
    }
  }

  /**
   * Mark user onboarding as completed.
   */
  Future<void> completeOnboarding() async {
    if (state.user == null) return;
    try {
      final updated = await _repository.setOnboardingCompleted(state.user!, true);
      state = state.copyWith(user: updated);
    } catch (e) {
      // Still mark locally if server is slow
      state = state.copyWith(
        user: state.user!.copyWith(hasCompletedOnboarding: true),
      );
    }
  }

  /**
   * Sign out current user.
   */
  Future<void> signOut() async {
    state = state.copyWith(isLoading: true);
    await _repository.signOut();
    state = state.copyWith(
      clearUser: true,
      isLoading: false,
    );
  }
}

final authControllerProvider = StateNotifierProvider<AuthController, AuthState>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return AuthController(repository);
});
