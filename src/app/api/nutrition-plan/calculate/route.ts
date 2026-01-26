import { NextResponse } from 'next/server';
import {
  calculateMacros,
  lbsToKg,
  feetInchesToCm,
  type Sex,
  type ActivityLevel,
  type Goal as MacroGoal
} from '@/utils/macros';

/**
 * Valid activity levels
 */
const VALID_ACTIVITY_LEVELS: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'very_active'];

/**
 * Valid sex values
 */
const VALID_SEX_VALUES: Sex[] = ['male', 'female'];

/**
 * Valid goal values
 */
const VALID_GOALS: MacroGoal[] = ['lose', 'maintain', 'gain'];

/**
 * POST /api/nutrition-plan/calculate
 * Calculates suggested nutrition targets from body stats.
 * Does NOT save the result - client must call POST /api/nutrition-plan to save.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { height, weight, age, sex, activityLevel, goal } = body;

    // Validate required fields
    const missingFields: string[] = [];

    if (height === undefined || height === null) missingFields.push('height');
    if (weight === undefined || weight === null) missingFields.push('weight');
    if (age === undefined || age === null) missingFields.push('age');
    if (!sex) missingFields.push('sex');
    if (!activityLevel) missingFields.push('activityLevel');
    if (!goal) missingFields.push('goal');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate types
    if (typeof age !== 'number' || age < 1 || age > 120) {
      return NextResponse.json(
        { error: 'age must be a number between 1 and 120' },
        { status: 400 }
      );
    }

    if (!VALID_SEX_VALUES.includes(sex)) {
      return NextResponse.json(
        { error: `sex must be one of: ${VALID_SEX_VALUES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!VALID_ACTIVITY_LEVELS.includes(activityLevel)) {
      return NextResponse.json(
        { error: `activityLevel must be one of: ${VALID_ACTIVITY_LEVELS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!VALID_GOALS.includes(goal)) {
      return NextResponse.json(
        { error: `goal must be one of: ${VALID_GOALS.join(', ')}` },
        { status: 400 }
      );
    }

    // Parse height - supports { feet, inches } or cm
    let heightCm: number;
    if (typeof height === 'object' && height.feet !== undefined) {
      const feet = Number(height.feet) || 0;
      const inches = Number(height.inches) || 0;
      heightCm = feetInchesToCm(feet, inches);
    } else if (typeof height === 'number') {
      heightCm = height; // Assume cm
    } else {
      return NextResponse.json(
        { error: 'height must be a number (cm) or { feet, inches }' },
        { status: 400 }
      );
    }

    if (heightCm < 50 || heightCm > 300) {
      return NextResponse.json(
        { error: 'height must be between 50 and 300 cm' },
        { status: 400 }
      );
    }

    // Parse weight - supports { lbs } or kg
    let weightKg: number;
    if (typeof weight === 'object' && weight.lbs !== undefined) {
      weightKg = lbsToKg(Number(weight.lbs));
    } else if (typeof weight === 'number') {
      weightKg = weight; // Assume kg
    } else {
      return NextResponse.json(
        { error: 'weight must be a number (kg) or { lbs }' },
        { status: 400 }
      );
    }

    if (weightKg < 20 || weightKg > 350) {
      return NextResponse.json(
        { error: 'weight must be between 20 and 350 kg' },
        { status: 400 }
      );
    }

    // Calculate macros
    const result = calculateMacros({
      weightKg,
      heightCm,
      age,
      sex,
      activityLevel,
      goal,
    });

    return NextResponse.json({
      suggested: {
        dailyCalories: result.targetCalories,
        proteinGrams: result.protein,
        carbGrams: result.carbs,
        fatGrams: result.fats,
      },
      metadata: {
        bmr: result.bmr,
        tdee: result.tdee,
        formula: result.formula,
      },
    });
  } catch (error) {
    console.error('Error calculating nutrition targets:', error);
    return NextResponse.json(
      { error: 'Failed to calculate nutrition targets' },
      { status: 500 }
    );
  }
}
