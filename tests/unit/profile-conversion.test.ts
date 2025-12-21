import { describe, it, expect } from 'vitest';
import { convertIntakeToProfile } from '@/services/programGeneration';

// ============================================
// PROFILE CONVERSION TESTS
// ============================================

describe('convertIntakeToProfile', () => {
  describe('basic intake conversion', () => {
    it('converts a fully populated intake correctly', () => {
      const intake = {
        sex: 'male',
        trainingGoal: 'Build muscle',
        weight: 180,
        age: 30,
        height: 72,
        experienceLevel: 'intermediate',
        daysAvailable: 4,
        dailyBudget: 60,
        workoutEnvironment: {
          primary: 'gym',
          secondary: 'home',
          limitations: ['no overhead pressing'],
        },
        equipmentAccess: {
          type: 'full-gym',
          available: ['barbell', 'dumbbells', 'cable machine'],
        },
        workoutStyle: {
          primary: 'strength',
          secondary: 'cardio',
        },
        trainingPreferences: ['compound movements', 'no machines'],
        additionalInfo: 'Previous powerlifting experience',
      };

      const profile = convertIntakeToProfile(intake);

      expect(profile.sex).toBe('male');
      expect(profile.trainingGoal).toBe('Build muscle');
      expect(profile.weight).toBe(180);
      expect(profile.age).toBe(30);
      expect(profile.height).toBe(72);
      expect(profile.experienceLevel).toBe('intermediate');
      expect(profile.daysAvailable).toBe(4);
      expect(profile.timePerSession).toBe(60);
      expect(profile.environment.primary).toBe('gym');
      expect(profile.environment.secondary).toBe('home');
      expect(profile.environment.limitations).toEqual(['no overhead pressing']);
      expect(profile.equipment.type).toBe('full-gym');
      expect(profile.equipment.available).toEqual(['barbell', 'dumbbells', 'cable machine']);
      expect(profile.style?.primary).toBe('strength');
      expect(profile.style?.secondary).toBe('cardio');
      expect(profile.preferences).toEqual(['compound movements', 'no machines']);
      expect(profile.additionalInfo).toBe('Previous powerlifting experience');
    });

    it('converts minimal intake correctly', () => {
      const intake = {
        sex: 'female',
        trainingGoal: 'Lose weight',
        weight: 150,
      };

      const profile = convertIntakeToProfile(intake);

      expect(profile.sex).toBe('female');
      expect(profile.trainingGoal).toBe('Lose weight');
      expect(profile.weight).toBe(150);
    });
  });

  describe('default values for missing optional fields', () => {
    it('uses default sex when missing', () => {
      const profile = convertIntakeToProfile({});
      expect(profile.sex).toBe('other');
    });

    it('uses default trainingGoal when missing', () => {
      const profile = convertIntakeToProfile({});
      expect(profile.trainingGoal).toBe('general fitness');
    });

    it('uses default weight when missing', () => {
      const profile = convertIntakeToProfile({});
      expect(profile.weight).toBe(150);
    });

    it('uses default experienceLevel when missing', () => {
      const profile = convertIntakeToProfile({});
      expect(profile.experienceLevel).toBe('beginner');
    });

    it('uses default daysAvailable when missing', () => {
      const profile = convertIntakeToProfile({});
      expect(profile.daysAvailable).toBe(3);
    });

    it('uses default timePerSession when missing', () => {
      const profile = convertIntakeToProfile({});
      expect(profile.timePerSession).toBe(60);
    });

    it('uses default environment when missing', () => {
      const profile = convertIntakeToProfile({});
      expect(profile.environment.primary).toBe('gym');
      expect(profile.environment.limitations).toEqual([]);
    });

    it('uses default equipment when missing', () => {
      const profile = convertIntakeToProfile({});
      expect(profile.equipment.type).toBe('full-gym');
      expect(profile.equipment.available).toEqual([]);
    });

    it('sets injuries to empty array', () => {
      const profile = convertIntakeToProfile({});
      expect(profile.injuries).toEqual([]);
    });

    it('sets preferences to empty array when trainingPreferences missing', () => {
      const profile = convertIntakeToProfile({});
      expect(profile.preferences).toEqual([]);
    });
  });

  describe('legacy field mapping', () => {
    it('maps goals to trainingGoal when trainingGoal is missing', () => {
      const intake = { goals: 'Build strength' };
      const profile = convertIntakeToProfile(intake);
      expect(profile.trainingGoal).toBe('Build strength');
    });

    it('prefers trainingGoal over goals when both present', () => {
      const intake = {
        trainingGoal: 'Modern goal',
        goals: 'Legacy goal',
      };
      const profile = convertIntakeToProfile(intake);
      expect(profile.trainingGoal).toBe('Modern goal');
    });

    it('maps daysPerWeek to daysAvailable when daysAvailable is missing', () => {
      const intake = { daysPerWeek: 5 };
      const profile = convertIntakeToProfile(intake);
      expect(profile.daysAvailable).toBe(5);
    });

    it('prefers daysAvailable over daysPerWeek when both present', () => {
      const intake = {
        daysAvailable: 4,
        daysPerWeek: 5,
      };
      const profile = convertIntakeToProfile(intake);
      expect(profile.daysAvailable).toBe(4);
    });

    it('maps timePerDay to timePerSession when dailyBudget is missing', () => {
      const intake = { timePerDay: 45 };
      const profile = convertIntakeToProfile(intake);
      expect(profile.timePerSession).toBe(45);
    });

    it('prefers dailyBudget over timePerDay when both present', () => {
      const intake = {
        dailyBudget: 60,
        timePerDay: 45,
      };
      const profile = convertIntakeToProfile(intake);
      expect(profile.timePerSession).toBe(60);
    });
  });

  describe('sex/gender field normalization', () => {
    it('accepts male', () => {
      const profile = convertIntakeToProfile({ sex: 'male' });
      expect(profile.sex).toBe('male');
    });

    it('accepts female', () => {
      const profile = convertIntakeToProfile({ sex: 'female' });
      expect(profile.sex).toBe('female');
    });

    it('accepts other', () => {
      const profile = convertIntakeToProfile({ sex: 'other' });
      expect(profile.sex).toBe('other');
    });

    it('defaults to other for missing sex', () => {
      const profile = convertIntakeToProfile({});
      expect(profile.sex).toBe('other');
    });
  });

  describe('equipment type mapping', () => {
    it('preserves full-gym type', () => {
      const intake = { equipmentAccess: { type: 'full-gym', available: [] } };
      const profile = convertIntakeToProfile(intake);
      expect(profile.equipment.type).toBe('full-gym');
    });

    it('preserves minimal type', () => {
      const intake = { equipmentAccess: { type: 'minimal', available: [] } };
      const profile = convertIntakeToProfile(intake);
      expect(profile.equipment.type).toBe('minimal');
    });

    it('preserves bodyweight type', () => {
      const intake = { equipmentAccess: { type: 'bodyweight', available: [] } };
      const profile = convertIntakeToProfile(intake);
      expect(profile.equipment.type).toBe('bodyweight');
    });

    it('preserves specific type', () => {
      const intake = { equipmentAccess: { type: 'specific', available: ['kettlebell', 'bands'] } };
      const profile = convertIntakeToProfile(intake);
      expect(profile.equipment.type).toBe('specific');
      expect(profile.equipment.available).toEqual(['kettlebell', 'bands']);
    });

    it('defaults to full-gym when equipment missing', () => {
      const profile = convertIntakeToProfile({});
      expect(profile.equipment.type).toBe('full-gym');
    });
  });

  describe('environment/limitations handling', () => {
    it('preserves gym environment', () => {
      const intake = { workoutEnvironment: { primary: 'gym' } };
      const profile = convertIntakeToProfile(intake);
      expect(profile.environment.primary).toBe('gym');
    });

    it('preserves home environment', () => {
      const intake = { workoutEnvironment: { primary: 'home' } };
      const profile = convertIntakeToProfile(intake);
      expect(profile.environment.primary).toBe('home');
    });

    it('preserves travel environment', () => {
      const intake = { workoutEnvironment: { primary: 'travel' } };
      const profile = convertIntakeToProfile(intake);
      expect(profile.environment.primary).toBe('travel');
    });

    it('preserves outdoors environment', () => {
      const intake = { workoutEnvironment: { primary: 'outdoors' } };
      const profile = convertIntakeToProfile(intake);
      expect(profile.environment.primary).toBe('outdoors');
    });

    it('preserves secondary environment', () => {
      const intake = { workoutEnvironment: { primary: 'gym', secondary: 'home' } };
      const profile = convertIntakeToProfile(intake);
      expect(profile.environment.secondary).toBe('home');
    });

    it('preserves limitations array', () => {
      const intake = {
        workoutEnvironment: {
          primary: 'gym',
          limitations: ['no barbell', 'limited space'],
        },
      };
      const profile = convertIntakeToProfile(intake);
      expect(profile.environment.limitations).toEqual(['no barbell', 'limited space']);
    });

    it('defaults limitations to empty array', () => {
      const intake = { workoutEnvironment: { primary: 'gym' } };
      const profile = convertIntakeToProfile(intake);
      expect(profile.environment.limitations).toEqual([]);
    });
  });

  describe('training preferences passthrough', () => {
    it('passes through training preferences array', () => {
      const intake = {
        trainingPreferences: ['compound movements', 'supersets', 'no machines'],
      };
      const profile = convertIntakeToProfile(intake);
      expect(profile.preferences).toEqual(['compound movements', 'supersets', 'no machines']);
    });

    it('handles empty training preferences', () => {
      const intake = { trainingPreferences: [] };
      const profile = convertIntakeToProfile(intake);
      expect(profile.preferences).toEqual([]);
    });

    it('defaults to empty array when missing', () => {
      const profile = convertIntakeToProfile({});
      expect(profile.preferences).toEqual([]);
    });
  });

  describe('workout style handling', () => {
    it('converts workout style when present', () => {
      const intake = {
        workoutStyle: {
          primary: 'strength',
          secondary: 'cardio',
        },
      };
      const profile = convertIntakeToProfile(intake);
      expect(profile.style).toEqual({
        primary: 'strength',
        secondary: 'cardio',
      });
    });

    it('handles workout style with only primary', () => {
      const intake = {
        workoutStyle: {
          primary: 'yoga',
        },
      };
      const profile = convertIntakeToProfile(intake);
      expect(profile.style?.primary).toBe('yoga');
      expect(profile.style?.secondary).toBeUndefined();
    });

    it('sets style to undefined when workoutStyle missing', () => {
      const profile = convertIntakeToProfile({});
      expect(profile.style).toBeUndefined();
    });

    it('uses default primary when workoutStyle.primary is missing', () => {
      const intake = { workoutStyle: {} };
      const profile = convertIntakeToProfile(intake);
      expect(profile.style?.primary).toBe('strength');
    });
  });

  describe('additional info passthrough', () => {
    it('passes through additional info', () => {
      const intake = { additionalInfo: 'I have a shoulder injury' };
      const profile = convertIntakeToProfile(intake);
      expect(profile.additionalInfo).toBe('I have a shoulder injury');
    });

    it('handles missing additional info', () => {
      const profile = convertIntakeToProfile({});
      expect(profile.additionalInfo).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('throws on null intake', () => {
      expect(() => convertIntakeToProfile(null as any)).toThrow();
    });

    it('handles undefined values in intake', () => {
      const intake = {
        sex: undefined,
        weight: undefined,
        age: undefined,
      };
      const profile = convertIntakeToProfile(intake);
      expect(profile.sex).toBe('other');
      expect(profile.weight).toBe(150);
      expect(profile.age).toBeUndefined();
    });

    it('preserves numeric zero for age', () => {
      // Note: age of 0 would be invalid but testing passthrough behavior
      const intake = { age: 0 };
      const profile = convertIntakeToProfile(intake);
      expect(profile.age).toBe(0);
    });
  });
});
