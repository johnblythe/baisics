import { jsPDF } from 'jspdf';
import { Program, Workout, Exercise } from '@/types';
import { formatRestPeriod } from '@/utils/formatters';

interface ExtendedWorkoutPlan {
  id: string;
  nutrition: {
    dailyCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
  };
  workouts: Workout[];
  bodyFatPercentage?: number;
  muscleMassDistribution?: string;
}

/**
 * TODO:
 * - Add upsell information / copyright / at your own risk etc.
 * - Add more styling
 * - Add URL to get back to the program
 */


export const generateWorkoutPDF = (program: Program): void => {
  const doc = new jsPDF();
  let yOffset = 20;
  const margin = 20;
  
  // Title
  doc.setFontSize(20);
  doc.text(program.name, margin, yOffset);
  yOffset += 15;

  // Description
  if (program.description) {
    doc.setFontSize(11);
    const descriptionLines = doc.splitTextToSize(program.description, doc.internal.pageSize.width - 2 * margin);
    doc.text(descriptionLines, margin, yOffset);
    yOffset += (descriptionLines.length * 7) + 10;
  }

  // Phases
  program.workoutPlans.forEach((plan: ExtendedWorkoutPlan, phaseIndex: number) => {
    // Phase Overview Section
    doc.setFontSize(16);
    doc.text(`Phase ${phaseIndex + 1} Overview`, margin, yOffset);
    yOffset += 12;

    // Body Composition
    doc.setFontSize(12);
    doc.text('Body Composition:', margin, yOffset);
    yOffset += 7;
    doc.setFontSize(11);
    if (plan.bodyFatPercentage) {
      doc.text(`Body Fat: ${plan.bodyFatPercentage}%`, margin + 5, yOffset);
      yOffset += 7;
    }
    if (plan.muscleMassDistribution) {
      doc.text(`Muscle Distribution: ${plan.muscleMassDistribution}`, margin + 5, yOffset);
      yOffset += 12;
    }

    // Nutrition
    doc.setFontSize(12);
    doc.text('Nutrition:', margin, yOffset);
    yOffset += 7;
    doc.setFontSize(11);
    doc.text(`Daily Calories: ${plan.nutrition.dailyCalories}`, margin + 5, yOffset);
    yOffset += 7;
    doc.text(`Protein: ${plan.nutrition.macros.protein}g`, margin + 5, yOffset);
    yOffset += 7;
    doc.text(`Carbs: ${plan.nutrition.macros.carbs}g`, margin + 5, yOffset);
    yOffset += 7;
    doc.text(`Fats: ${plan.nutrition.macros.fats}g`, margin + 5, yOffset);
    yOffset += 12;

    // Training Schedule
    doc.setFontSize(14);
    doc.text('Training Schedule', margin, yOffset);
    yOffset += 10;

    // Workouts in phase
    plan.workouts
      .sort((a: Workout, b: Workout) => (a.dayNumber || 0) - (b.dayNumber || 0))
      .forEach((workout: Workout) => {
        // Check if we need a new page
        if (yOffset > doc.internal.pageSize.height - 60) {
          doc.addPage();
          yOffset = 20;
        }

        doc.setFontSize(12);
        doc.text(`Session ${workout.dayNumber}`, margin, yOffset);
        yOffset += 8;

        // Exercise header
        doc.setFontSize(10);
        doc.text('Exercise', margin + 5, yOffset);
        doc.text('Sets', margin + 90, yOffset);
        doc.text('Reps', margin + 110, yOffset);
        doc.text('Rest', margin + 140, yOffset);
        yOffset += 4;

        // Horizontal line
        doc.line(margin + 5, yOffset, margin + 170, yOffset);
        yOffset += 4;

        // Exercises
        workout.exercises.forEach((exercise: Exercise) => {
          if (yOffset > doc.internal.pageSize.height - 20) {
            doc.addPage();
            yOffset = 20;
          }

          doc.setFontSize(10);
          doc.text(exercise.name, margin + 5, yOffset);
          doc.text(exercise.sets.toString(), margin + 90, yOffset);
          doc.text(exercise.reps.toString(), margin + 110, yOffset);
          const restPeriodText = formatRestPeriod(typeof exercise.restPeriod === 'string' ? parseInt(exercise.restPeriod) : exercise.restPeriod);
          doc.text(restPeriodText, margin + 140, yOffset);
          yOffset += 7;
        });

        yOffset += 10; // Space after workout
      });
    yOffset += 15; // Space after phase
  });

  // Create and open PDF in new tab
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, '_blank');
  // Clean up blob URL after opening
  setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
} 