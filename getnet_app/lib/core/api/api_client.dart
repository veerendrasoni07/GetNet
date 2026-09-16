import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../config/environment.dart';

class ApiClient {
  static final ApiClient instance = ApiClient();
  late final Dio _dio;
  String? _authToken;
  String? _userId;

  ApiClient({String? baseUrl}) {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? Environment.apiBaseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Auth & Identity Interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (_authToken != null && _authToken!.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $_authToken';
          }
          if (_userId != null && _userId!.isNotEmpty) {
            options.headers['x-user-id'] = _userId;
          }
          return handler.next(options);
        },
      ),
    );

    if (kDebugMode) {
      _dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          logPrint: (obj) => debugPrint('🌐 [API] $obj'),
        ),
      );
    }
  }

  void setAuth({String? token, String? userId}) {
    _authToken = token;
    _userId = userId;
  }

  void clearAuth() {
    _authToken = null;
    _userId = null;
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return _executeWithFallback(
      (client) => client.get(path, queryParameters: queryParameters),
    );
  }

  Future<Response> post(String path, {dynamic data}) {
    return _executeWithFallback(
      (client) => client.post(path, data: data),
    );
  }

  Future<Response> patch(String path, {dynamic data}) {
    return _executeWithFallback(
      (client) => client.patch(path, data: data),
    );
  }

  Future<Response> _executeWithFallback(
    Future<Response> Function(Dio client) requestFn,
  ) async {
    try {
      return await requestFn(_dio);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Exception _handleDioError(DioException error) {
    final message = error.response?.data?['error'] ?? error.message ?? 'Network error occurred';
    return Exception(message);
  }
}
