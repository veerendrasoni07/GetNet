import 'dart:io';
import 'package:flutter/foundation.dart';

class Environment {
  static String get apiBaseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000/api/v1';
    } else if (Platform.isAndroid) {
      return 'http://10.215.62.253:3000/api/v1'; // Android emulator to local host
    } else {
      return 'http://10.215.62.253:3000/api/v1';
    }
  }

  static const String appName = 'GetNutrition';
  static const String appVersion = '1.0.0';
}
