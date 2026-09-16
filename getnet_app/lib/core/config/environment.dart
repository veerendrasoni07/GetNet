import 'dart:io';
import 'package:flutter/foundation.dart';

class Environment {
  // Allow passing custom API base URL via flutter run --dart-define=API_URL=...
  static const String _definedBaseUrl = String.fromEnvironment('API_URL');

  static String get apiBaseUrl {
    if (_definedBaseUrl.isNotEmpty) {
      return _definedBaseUrl;
    }
    if (kIsWeb) {
      return 'http://localhost:3000/api/v1';
    } else if (Platform.isAndroid) {
      // 127.0.0.1 works directly over USB via 'adb reverse tcp:3000 tcp:3000'
      return 'http://10.157.169.253:3000/api/v1';
    } else {
      return 'http://10.157.169.253:3000/api/v1';
    }
  }



  static const String appName = 'GetNutrition';
  static const String appVersion = '1.0.0';
}
