import 'package:flutter_test/flutter_test.dart';
import 'package:getnet_app/features/onboarding/domain/schedule_calculator.dart';

void main() {
  group('Schedule Calculator Tests', () {
    test('Default routine matches exact screenshot eating windows', () {
      final windows = deriveEatingWindows(
        wakeTime: '07:00',
        collegeStartTime: '09:00',
        collegeEndTime: '16:00',
        workoutTime: '18:00',
        sleepTime: '00:00',
        workoutDurationMinutes: 75,
      );

      expect(windows.length, 5);

      // 1. Breakfast: 7:15 - 8:30 AM
      expect(windows[0].name, 'Breakfast');
      expect(windows[0].startTime, '07:15');
      expect(windows[0].endTime, '08:30');
      expect(windows[0].displayRange, '7:15 - 8:30 AM');

      // 2. Lunch: 1:00 - 2:00 PM
      expect(windows[1].name, 'Lunch');
      expect(windows[1].startTime, '13:00');
      expect(windows[1].endTime, '14:00');
      expect(windows[1].displayRange, '1:00 - 2:00 PM');

      // 3. Pre-workout: 4:30 - 5:30 PM
      expect(windows[2].name, 'Pre-workout');
      expect(windows[2].startTime, '16:30');
      expect(windows[2].endTime, '17:30');
      expect(windows[2].displayRange, '4:30 - 5:30 PM');

      // 4. Post-workout: 7:30 - 8:30 PM
      expect(windows[3].name, 'Post-workout');
      expect(windows[3].startTime, '19:30');
      expect(windows[3].endTime, '20:30');
      expect(windows[3].displayRange, '7:30 - 8:30 PM');

      // 5. Dinner: 9:00 - 10:00 PM
      expect(windows[4].name, 'Dinner');
      expect(windows[4].startTime, '21:00');
      expect(windows[4].endTime, '22:00');
      expect(windows[4].displayRange, '9:00 - 10:00 PM');
    });

    test('Morning workout adjusts meal slots chronologically', () {
      final windows = deriveEatingWindows(
        wakeTime: '06:00',
        collegeStartTime: '09:30',
        collegeEndTime: '16:30',
        workoutTime: '06:30',
        sleepTime: '23:00',
        workoutDurationMinutes: 60,
      );

      expect(windows.length, 5);

      // Pre-workout snack before training
      expect(windows[0].name, 'Pre-workout');
      expect(windows[0].endTime, '06:30');

      // Post-workout Breakfast before college
      expect(windows[1].name, 'Breakfast');
      expect(windows[1].startTime, '07:45');

      // Lunch
      expect(windows[2].name, 'Lunch');

      // Evening Snack
      expect(windows[3].name, 'Evening Snack');

      // Dinner
      expect(windows[4].name, 'Dinner');
    });

    test('format12hRange handles same period and cross-period ranges', () {
      expect(format12hRange(435, 510), '7:15 - 8:30 AM');
      expect(format12hRange(780, 840), '1:00 - 2:00 PM');
      expect(format12hRange(690, 750), '11:30 AM - 12:30 PM');
      expect(format12hRange(1260, 1320), '9:00 - 10:00 PM');
    });

    test('DerivedEatingWindow JSON serialization works correctly', () {
      const window = DerivedEatingWindow(
        name: 'Breakfast',
        startTime: '07:15',
        endTime: '08:30',
        displayRange: '7:15 - 8:30 AM',
      );

      final json = window.toJson();
      expect(json['name'], 'Breakfast');
      expect(json['startTime'], '07:15');
      expect(json['endTime'], '08:30');
      expect(json['displayRange'], '7:15 - 8:30 AM');

      final deserialized = DerivedEatingWindow.fromJson(json);
      expect(deserialized.name, window.name);
      expect(deserialized.startTime, window.startTime);
      expect(deserialized.endTime, window.endTime);
      expect(deserialized.displayRange, window.displayRange);
      expect(deserialized.toString(), '• Breakfast: 7:15 - 8:30 AM');
    });
  });
}
