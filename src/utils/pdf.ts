import { jsPDF } from 'jspdf';
import { ProgramFullDisplay } from '@/app/start/types';

/**
 * TODO:
 * - Add upsell information / copyright / at your own risk etc.
 * - Add more styling
 * - Add URL to get back to the program
 */


export const generateWorkoutPDF = (program: ProgramFullDisplay): void => {
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
  program.workoutPlans.forEach((plan, phaseIndex) => {
    // Phase Overview Section
    doc.setFontSize(16);
    doc.text(`Phase ${phaseIndex + 1} Overview`, margin, yOffset);
    yOffset += 12;

    // Body Composition
    doc.setFontSize(12);
    doc.text('Body Composition:', margin, yOffset);
    yOffset += 7;
    doc.setFontSize(11);
    doc.text(`Body Fat: ${plan.bodyFatPercentage}%`, margin + 5, yOffset);
    yOffset += 7;
    doc.text(`Muscle Distribution: ${plan.muscleMassDistribution}`, margin + 5, yOffset);
    yOffset += 12;

    // Nutrition
    doc.setFontSize(12);
    doc.text('Nutrition:', margin, yOffset);
    yOffset += 7;
    doc.setFontSize(11);
    doc.text(`Daily Calories: ${plan.dailyCalories}`, margin + 5, yOffset);
    yOffset += 7;
    doc.text(`Protein: ${plan.proteinGrams}g`, margin + 5, yOffset);
    yOffset += 7;
    doc.text(`Carbs: ${plan.carbGrams}g`, margin + 5, yOffset);
    yOffset += 7;
    doc.text(`Fats: ${plan.fatGrams}g`, margin + 5, yOffset);
    yOffset += 12;

    // Training Schedule
    doc.setFontSize(14);
    doc.text('Training Schedule', margin, yOffset);
    yOffset += 10;

    // Workouts in phase
    plan.workouts
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .forEach((workout) => {
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
        workout.exercises.forEach((exercise) => {
          if (yOffset > doc.internal.pageSize.height - 20) {
            doc.addPage();
            yOffset = 20;
          }

          doc.setFontSize(10);
          doc.text(exercise.name, margin + 5, yOffset);
          doc.text(exercise.sets.toString(), margin + 90, yOffset);
          doc.text(exercise.reps.toString(), margin + 110, yOffset);
          doc.text(exercise.restPeriod || '', margin + 140, yOffset);
          yOffset += 7;
        });

        yOffset += 10; // Space after workout
      });

    yOffset += 15; // Space after phase
  });

  // Save with sanitized filename
  const filename = program.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const pdfOutput = `${filename}-workout-program.pdf`;
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, '_blank');
  // Clean up blob URL after opening
  setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

  // actual downloads later
  // doc.save(`${filename}-workout-program.pdf`);
}; 