import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { UserProgramStats } from '@/types/program';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');

    const whereClause = {
      userId,
      ...(programId ? { programId } : {}),
    };

    // Get all workout logs
    const workoutLogs = await prisma.workoutLog.findMany({
      where: whereClause,
      include: {
        exerciseLogs: {
          include: {
            exercise: true,
            setLogs: true,
          },
        },
      },
    });

    // Calculate total workouts
    const totalWorkouts = workoutLogs.length;

    // Calculate favorite exercises
    const exerciseCounts = new Map<string, number>();
    workoutLogs.forEach(log => {
      log.exerciseLogs.forEach(exerciseLog => {
        const count = exerciseCounts.get(exerciseLog.exercise.name) || 0;
        exerciseCounts.set(exerciseLog.exercise.name, count + 1);
      });
    });

    const favoriteExercises = Array.from(exerciseCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    // Calculate best performing exercises (based on progression)
    const exerciseProgress = new Map<string, { 
      initialWeight: number;
      currentWeight: number;
      timeSpan: number;
    }>();

    workoutLogs.forEach(log => {
      log.exerciseLogs.forEach(exerciseLog => {
        const exercise = exerciseLog.exercise.name;
        const maxWeight = Math.max(...exerciseLog.setLogs.map(set => set.weight || 0));
        
        if (!exerciseProgress.has(exercise)) {
          exerciseProgress.set(exercise, {
            initialWeight: maxWeight,
            currentWeight: maxWeight,
            timeSpan: 0,
          });
        } else {
          const progress = exerciseProgress.get(exercise)!;
          progress.currentWeight = Math.max(progress.currentWeight, maxWeight);
          progress.timeSpan = Math.max(progress.timeSpan, 
            new Date(log.completedAt || log.startedAt).getTime() - 
            new Date(log.startedAt).getTime());
        }
      });
    });

    const bestPerformingExercises = Array.from(exerciseProgress.entries())
      .map(([name, progress]) => ({
        name,
        progressionRate: progress.timeSpan > 0 
          ? (progress.currentWeight - progress.initialWeight) / (progress.timeSpan / (1000 * 60 * 60 * 24))
          : 0
      }))
      .sort((a, b) => b.progressionRate - a.progressionRate)
      .slice(0, 5);

    // Calculate consistency metrics
    const workoutsByDay = new Map<string, number>();
    let totalWeeks = 0;
    
    workoutLogs.forEach(log => {
      const day = new Date(log.startedAt).toLocaleDateString('en-US', { weekday: 'long' });
      workoutsByDay.set(day, (workoutsByDay.get(day) || 0) + 1);
      
      // Calculate total weeks from first to last workout
      if (workoutLogs.length > 1) {
        const firstWorkout = new Date(workoutLogs[workoutLogs.length - 1].startedAt);
        const lastWorkout = new Date(workoutLogs[0].startedAt);
        totalWeeks = Math.ceil((lastWorkout.getTime() - firstWorkout.getTime()) / (1000 * 60 * 60 * 24 * 7));
      }
    });

    const averageWorkoutsPerWeek = totalWeeks > 0 
      ? totalWorkouts / totalWeeks 
      : totalWorkouts;

    const mostConsistentDays = Array.from(workoutsByDay.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);

    const completedWorkouts = workoutLogs.filter(log => log.completedAt).length;
    const averageCompletionRate = totalWorkouts > 0 
      ? completedWorkouts / totalWorkouts 
      : 0;

    const response: UserProgramStats = {
      totalWorkouts,
      favoriteExercises,
      bestPerformingExercises,
      consistencyMetrics: {
        averageWorkoutsPerWeek,
        mostConsistentDays,
        averageCompletionRate,
      },
      ...(programId ? { programId } : {}),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user program stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user program stats' },
      { status: 500 }
    );
  }
} 