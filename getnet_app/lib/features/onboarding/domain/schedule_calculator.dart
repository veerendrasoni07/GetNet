class DerivedEatingWindow {
  final String name;
  final String startTime; // 24-hour "HH:mm"
  final String endTime;   // 24-hour "HH:mm"
  final String displayRange; // 12-hour "7:15 - 8:30 AM"

  const DerivedEatingWindow({
    required this.name,
    required this.startTime,
    required this.endTime,
    required this.displayRange,
  });

  Map<String, dynamic> toJson() => {
        'name': name,
        'startTime': startTime,
        'endTime': endTime,
        'displayRange': displayRange,
      };

  factory DerivedEatingWindow.fromJson(Map<String, dynamic> json) =>
      DerivedEatingWindow(
        name: json['name'] ?? '',
        startTime: json['startTime'] ?? '',
        endTime: json['endTime'] ?? '',
        displayRange: json['displayRange'] ?? '',
      );

  @override
  String toString() => '• $name: $displayRange';
}

/// Parses "HH:mm" or "H:mm" into total minutes from midnight (0..1439).
int parseTimeToMinutes(String timeStr) {
  if (timeStr.isEmpty) return 0;
  final clean = timeStr.trim();
  final parts = clean.split(':');
  if (parts.length < 2) return 0;
  final h = int.tryParse(parts[0]) ?? 0;
  final m = int.tryParse(parts[1].split(' ')[0]) ?? 0;
  return ((h % 24) * 60) + (m % 60);
}

/// Formats total minutes to 24-hour "HH:mm".
String formatMinutesTo24h(int totalMinutes) {
  final normalized = (totalMinutes % 1440 + 1440) % 1440;
  final hours = normalized ~/ 60;
  final minutes = normalized % 60;
  return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}';
}

/// Formats total minutes to 12-hour string (e.g. "7:15 AM" or "7:15").
String formatMinutesTo12h(int totalMinutes, {bool showPeriod = true}) {
  final normalized = (totalMinutes % 1440 + 1440) % 1440;
  final h = normalized ~/ 60;
  final m = normalized % 60;
  final period = h >= 12 ? 'PM' : 'AM';
  final h12 = h == 0 ? 12 : (h > 12 ? h - 12 : h);
  final mStr = m.toString().padLeft(2, '0');
  return showPeriod ? '$h12:$mStr $period' : '$h12:$mStr';
}

/// Formats a time range cleanly, e.g. "7:15 - 8:30 AM" or "11:30 AM - 12:30 PM".
String format12hRange(int startMin, int endMin) {
  final startH = ((startMin % 1440 + 1440) % 1440) ~/ 60;
  final endH = ((endMin % 1440 + 1440) % 1440) ~/ 60;
  final startPeriod = startH >= 12 ? 'PM' : 'AM';
  final endPeriod = endH >= 12 ? 'PM' : 'AM';

  if (startPeriod == endPeriod) {
    return '${formatMinutesTo12h(startMin, showPeriod: false)} - ${formatMinutesTo12h(endMin, showPeriod: true)}';
  }
  return '${formatMinutesTo12h(startMin, showPeriod: true)} - ${formatMinutesTo12h(endMin, showPeriod: true)}';
}

/// Derives structured eating windows dynamically based on the user's routine.
List<DerivedEatingWindow> deriveEatingWindows({
  required String wakeTime,
  required String collegeStartTime,
  required String collegeEndTime,
  required String workoutTime,
  required String sleepTime,
  int workoutDurationMinutes = 75,
}) {
  final wake = parseTimeToMinutes(wakeTime.isNotEmpty ? wakeTime : '07:00');
  final collegeStart = parseTimeToMinutes(collegeStartTime.isNotEmpty ? collegeStartTime : '09:00');
  final collegeEnd = parseTimeToMinutes(collegeEndTime.isNotEmpty ? collegeEndTime : '16:00');
  final workout = parseTimeToMinutes(workoutTime.isNotEmpty ? workoutTime : '18:00');
  var rawSleep = parseTimeToMinutes(sleepTime.isNotEmpty ? sleepTime : '00:00');

  // If sleep time is <= wake (e.g. midnight 00:00 or 01:00), it's overnight
  final sleep = rawSleep <= wake ? rawSleep + 1440 : rawSleep;

  final windows = <DerivedEatingWindow>[];

  // Check if workout is early morning (before college starts or before 10:00 AM)
  final isMorningWorkout = workout < collegeStart || (workout <= 600 && workout > wake);

  if (isMorningWorkout) {
    // 1. Pre-workout Snack (quick energy)
    final preStart = (wake + 10 < workout - 20) ? wake + 10 : workout - 30;
    final preEnd = workout;
    windows.add(DerivedEatingWindow(
      name: 'Pre-workout',
      startTime: formatMinutesTo24h(preStart),
      endTime: formatMinutesTo24h(preEnd),
      displayRange: format12hRange(preStart, preEnd),
    ));

    // 2. Post-workout Breakfast
    final workoutFinish = workout + workoutDurationMinutes;
    final bfStart = workoutFinish + 15;
    final bfEnd = (collegeStart - 15 > bfStart + 30) ? collegeStart - 15 : bfStart + 60;
    windows.add(DerivedEatingWindow(
      name: 'Breakfast',
      startTime: formatMinutesTo24h(bfStart),
      endTime: formatMinutesTo24h(bfEnd),
      displayRange: format12hRange(bfStart, bfEnd),
    ));

    // 3. Lunch (around 12:30 - 14:00 or midpoint of college)
    final midCollege = (collegeStart + collegeEnd) ~/ 2;
    final lunchStart = midCollege > 0 ? (midCollege - 30).clamp(720, 840) : 780; // 13:00
    final lunchEnd = lunchStart + 60;
    windows.add(DerivedEatingWindow(
      name: 'Lunch',
      startTime: formatMinutesTo24h(lunchStart),
      endTime: formatMinutesTo24h(lunchEnd),
      displayRange: format12hRange(lunchStart, lunchEnd),
    ));

    // 4. Evening Snack
    final snackStart = (collegeEnd + 30).clamp(960, 1110); // 16:00 to 18:30
    final snackEnd = snackStart + 60;
    windows.add(DerivedEatingWindow(
      name: 'Evening Snack',
      startTime: formatMinutesTo24h(snackStart),
      endTime: formatMinutesTo24h(snackEnd),
      displayRange: format12hRange(snackStart, snackEnd),
    ));

    // 5. Dinner (2-3 hours before sleep)
    final dinnerStart = (sleep - 180).clamp(snackEnd + 60, sleep - 90);
    final dinnerEnd = dinnerStart + 60;
    windows.add(DerivedEatingWindow(
      name: 'Dinner',
      startTime: formatMinutesTo24h(dinnerStart),
      endTime: formatMinutesTo24h(dinnerEnd),
      displayRange: format12hRange(dinnerStart, dinnerEnd),
    ));
  } else {
    // Standard Routine (Afternoon/Evening workout)
    // 1. Breakfast (Wake + 15m to CollegeStart - 15m or Wake + 90m)
    final bfStart = wake + 15;
    final maxBfEnd = collegeStart > bfStart + 45 ? collegeStart - 15 : bfStart + 60;
    final bfEnd = (wake + 90 < maxBfEnd) ? wake + 90 : maxBfEnd;
    windows.add(DerivedEatingWindow(
      name: 'Breakfast',
      startTime: formatMinutesTo24h(bfStart),
      endTime: formatMinutesTo24h(bfEnd > bfStart ? bfEnd : bfStart + 45),
      displayRange: format12hRange(bfStart, bfEnd > bfStart ? bfEnd : bfStart + 45),
    ));

    // 2. Lunch
    // Default college 9:00 - 16:00 -> 13:00 - 14:00 (1:00 - 2:00 PM)
    int lunchStart;
    if (collegeStart <= 780 && collegeEnd >= 840) {
      // Standard lunch hour at 13:00 (1:00 PM)
      lunchStart = 780;
    } else if (collegeEnd <= 780) {
      lunchStart = collegeEnd + 30;
    } else {
      lunchStart = ((collegeStart + collegeEnd) ~/ 2) - 30;
    }
    final lunchEnd = lunchStart + 60;
    windows.add(DerivedEatingWindow(
      name: 'Lunch',
      startTime: formatMinutesTo24h(lunchStart),
      endTime: formatMinutesTo24h(lunchEnd),
      displayRange: format12hRange(lunchStart, lunchEnd),
    ));

    // 3. Pre-workout (Workout - 90m to Workout - 30m)
    final preStart = workout - 90;
    final preEnd = workout - 30;
    windows.add(DerivedEatingWindow(
      name: 'Pre-workout',
      startTime: formatMinutesTo24h(preStart),
      endTime: formatMinutesTo24h(preEnd),
      displayRange: format12hRange(preStart, preEnd),
    ));

    // 4. Post-workout (Workout + duration + 15m to + 75m)
    final workoutFinish = workout + workoutDurationMinutes;
    final postStart = workoutFinish + 15;
    final postEnd = postStart + 60;
    windows.add(DerivedEatingWindow(
      name: 'Post-workout',
      startTime: formatMinutesTo24h(postStart),
      endTime: formatMinutesTo24h(postEnd),
      displayRange: format12hRange(postStart, postEnd),
    ));

    // 5. Dinner (Around sleep - 180m, ensuring separation after post-workout)
    final idealDinnerStart = sleep - 180;
    final dinnerStart = (idealDinnerStart >= postEnd + 30) ? idealDinnerStart : postEnd + 30;
    final dinnerEnd = dinnerStart + 60;
    windows.add(DerivedEatingWindow(
      name: 'Dinner',
      startTime: formatMinutesTo24h(dinnerStart),
      endTime: formatMinutesTo24h(dinnerEnd),
      displayRange: format12hRange(dinnerStart, dinnerEnd),
    ));
  }

  return windows;
}
