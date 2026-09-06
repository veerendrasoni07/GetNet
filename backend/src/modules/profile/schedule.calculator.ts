import { MealWindow, ScheduleProfile } from './profile.types';

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function formatMinutesToTime(totalMinutes: number): string {
  const normalized = (totalMinutes + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function deriveMealWindows(schedule: ScheduleProfile): MealWindow[] {
  const wake = parseTimeToMinutes(schedule.wakeUpTime || '07:00');
  const collegeStart = parseTimeToMinutes(schedule.collegeWorkStartTime || '09:00');
  const collegeEnd = parseTimeToMinutes(schedule.collegeWorkEndTime || '16:00');
  const workout = parseTimeToMinutes(schedule.workoutTime || '18:00');
  const sleep = parseTimeToMinutes(schedule.sleepTime || '00:00');

  const windows: MealWindow[] = [];

  // Breakfast window: e.g. Wake+15m to CollegeStart-15m (or Wake+90m)
  const bfStart = wake + 15;
  const bfEnd = Math.min(collegeStart - 15, wake + 90);
  windows.push({
    name: 'Breakfast',
    startTime: formatMinutesToTime(bfStart),
    endTime: formatMinutesToTime(bfEnd > bfStart ? bfEnd : bfStart + 45),
  });

  // Mid-day / Lunch window: e.g. around 13:00 - 14:00 (or halfway in college/work)
  const midCollege = Math.floor((collegeStart + collegeEnd) / 2);
  windows.push({
    name: 'Lunch',
    startTime: formatMinutesToTime(midCollege - 30),
    endTime: formatMinutesToTime(midCollege + 30),
  });

  // Pre-Workout window: e.g. Workout-90m to Workout-30m
  const preWorkoutStart = workout - 90;
  const preWorkoutEnd = workout - 30;
  windows.push({
    name: 'Pre-Workout Snack',
    startTime: formatMinutesToTime(preWorkoutStart),
    endTime: formatMinutesToTime(preWorkoutEnd),
  });

  // Post-Workout window: e.g. Workout+60m to Workout+120m
  const postWorkoutStart = workout + 60;
  const postWorkoutEnd = workout + 120;
  windows.push({
    name: 'Post-Workout / Evening Snack',
    startTime: formatMinutesToTime(postWorkoutStart),
    endTime: formatMinutesToTime(postWorkoutEnd),
  });

  // Dinner window: e.g. around Sleep-180m to Sleep-90m
  const dinnerStart = Math.max(postWorkoutEnd + 15, sleep - 180);
  const dinnerEnd = dinnerStart + 60;
  windows.push({
    name: 'Dinner',
    startTime: formatMinutesToTime(dinnerStart),
    endTime: formatMinutesToTime(dinnerEnd),
  });

  return windows;
}

/** Helper functions for mapping student daily schedule windows to nutritional timing. */
