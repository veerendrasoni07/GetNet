import { deriveMealWindows } from './schedule.calculator';
import { scheduleProfileSchema } from './profile.schema';

describe('Profile Schedule Derivation Engine', () => {
  it('correctly derives meal windows from daily routine schedule', () => {
    const schedule = {
      wakeUpTime: '07:00',
      collegeWorkStartTime: '09:00',
      collegeWorkEndTime: '16:00',
      workoutTime: '18:00',
      sleepTime: '00:00',
    };

    const windows = deriveMealWindows(schedule);
    expect(windows).toHaveLength(5);
    
    // Check breakfast
    expect(windows[0].name).toBe('Breakfast');
    expect(windows[0].startTime).toBe('07:15');
    
    // Check pre-workout
    const preWorkout = windows.find((w) => w.name.includes('Pre-Workout'));
    expect(preWorkout).toBeDefined();
    expect(preWorkout?.startTime).toBe('16:30');
    expect(preWorkout?.endTime).toBe('17:30');
  });

  it('validates schedule schema correctly', () => {
    const valid = scheduleProfileSchema.safeParse({
      wakeUpTime: '07:00',
      collegeWorkStartTime: '09:00',
      collegeWorkEndTime: '16:00',
      workoutTime: '18:00',
      sleepTime: '00:00',
    });
    expect(valid.success).toBe(true);

    const invalid = scheduleProfileSchema.safeParse({
      wakeUpTime: '7:00 AM', // invalid format
    });
    expect(invalid.success).toBe(false);
  });
});
