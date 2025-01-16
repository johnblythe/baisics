import { jsPDF } from 'jspdf';
import { Program, Workout, Exercise } from '@/types';
import { formatRestPeriod, formatExerciseMeasure } from '@/utils/formatters';

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
  
  // Baisics Branding
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('baisics', doc.internal.pageSize.width / 2, yOffset, { align: 'center' });
  yOffset += 6;

  // Tagline
  doc.setTextColor(107, 114, 128); // gray-500
  doc.setFontSize(14);
  // doc.setFont('helvetica', 'italic');
  doc.text('fitness for the rest of us', doc.internal.pageSize.width / 2, yOffset, { align: 'center' });
  yOffset += 25;

  // Program Title & Description
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(program.name, doc.internal.pageSize.width - 2 * margin);
  doc.text(titleLines, margin, yOffset);
  yOffset += (titleLines.length * 10) + 5;

  if (program.description) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const descriptionLines = doc.splitTextToSize(program.description, doc.internal.pageSize.width - 2 * margin);
    doc.text(descriptionLines, margin, yOffset);
    yOffset += (descriptionLines.length * 7) + 20;
  }

  // Legal Disclaimer
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Obligatory Legal Disclaimer', margin, yOffset);
  yOffset += 12;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const disclaimerText = doc.splitTextToSize(
    'The information presented herein is in no way intended as medical advice or to serve as a substitute for medical counseling. The information should be used in conjunction with the guidance and care of your physician. Consult your physician before beginning this program as you would with any exercise and nutrition program. If you choose not to obtain the consent of your physician and/or work with your physician throughout the duration of your time consulting with Baisics, LLC you are agreeing to accept full responsibility for your actions. By accepting your comprehensive fitness program, you recognize that despite all precautions on the part of Baisics, LLC, there are risks of injury or illness which can occur because of your use of the aforementioned information and you expressly assume such risks and waive, relinquish and release any claim which you may have against Baisics, LLC, or its affiliates as a result of any future physical injury or illness incurred in connection with, or as a result of, the use or misuse of your program.',
    doc.internal.pageSize.width - 2 * margin
  );
  doc.text(disclaimerText, margin, yOffset);
  yOffset += (disclaimerText.length * 5) + 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.text('In other words: talk to your doctor, and have fun with the program!', margin, yOffset);

  // Start new page for program content
  doc.addPage();
  yOffset = 20;

  // Repeat Program Title & Description
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const titleLines2 = doc.splitTextToSize(program.name, doc.internal.pageSize.width - 2 * margin);
  doc.text(titleLines2, margin, yOffset);
  yOffset += (titleLines2.length * 10) + 5;

  if (program.description) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const descriptionLines = doc.splitTextToSize(program.description, doc.internal.pageSize.width - 2 * margin);
    doc.text(descriptionLines, margin, yOffset);
    yOffset += (descriptionLines.length * 7) + 20;
  }

  // Phases
  program.workoutPlans.forEach((plan: ExtendedWorkoutPlan, phaseIndex: number) => {
    // Phase Overview Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Phase ${phaseIndex + 1} Overview`, margin, yOffset);
    yOffset += 12;

    // Nutrition
    doc.setFontSize(12);
    doc.text('Nutrition:', margin, yOffset);
    yOffset += 7;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
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
    doc.setFont('helvetica', 'bold');
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
        doc.setFont('helvetica', 'bold');
        doc.text(`Session ${workout.dayNumber}${workout.name ? `: ${workout.name}` : ''}`, margin, yOffset);
        yOffset += 8;

        if (workout.focus) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text(workout.focus, margin + 5, yOffset);
          yOffset += 10;
        }

        // Warmup Section
        if (workout.warmup) {
          const warmupData = typeof workout.warmup === 'string'
            ? JSON.parse(workout.warmup)
            : workout.warmup;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`Warmup${warmupData.duration ? ` (${warmupData.duration} mins)` : ''}:`, margin + 5, yOffset);
          yOffset += 5;
          
          doc.setFont('helvetica', 'normal');
          if (warmupData.activities && warmupData.activities.length > 0) {
            warmupData.activities.forEach((activity: string) => {
              doc.text(`• ${activity}`, margin + 10, yOffset);
              yOffset += 5;
            });
          } else {
            doc.text('• General warmup', margin + 10, yOffset);
            yOffset += 5;
          }
          yOffset += 5;
        }

        // Exercise header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Exercise', margin + 5, yOffset);
        doc.text('Sets', margin + 90, yOffset);
        doc.text('Reps', margin + 110, yOffset);
        doc.text('Rest', margin + 140, yOffset);
        yOffset += 4;

        // Horizontal line
        doc.line(margin + 5, yOffset, margin + 170, yOffset);
        yOffset += 4;

        // Exercises
        doc.setFont('helvetica', 'normal');
        workout.exercises.forEach((exercise: Exercise) => {
          if (yOffset > doc.internal.pageSize.height - 20) {
            doc.addPage();
            yOffset = 20;
          }

          doc.text(exercise.name, margin + 5, yOffset);
          doc.text(exercise.sets.toString(), margin + 90, yOffset);
          doc.text(formatExerciseMeasure(exercise), margin + 110, yOffset);
          const restPeriodText = formatRestPeriod(typeof exercise.restPeriod === 'string' ? parseInt(exercise.restPeriod) : exercise.restPeriod);
          doc.text(restPeriodText, margin + 140, yOffset);
          yOffset += 7;
        });

        // Cooldown Section
        if (workout.cooldown) {
          const cooldownData = typeof workout.cooldown === 'string'
            ? JSON.parse(workout.cooldown)
            : workout.cooldown;
                  
          yOffset += 5;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`Cooldown${cooldownData.duration ? ` (${cooldownData.duration} mins)` : ''}:`, margin + 5, yOffset);
          yOffset += 5;
          
          doc.setFont('helvetica', 'normal');
          if (cooldownData.activities && cooldownData.activities.length > 0) {
            cooldownData.activities.forEach((activity: string) => {
              doc.text(`• ${activity}`, margin + 10, yOffset);
              yOffset += 5;
            });
          } else {
            doc.text('• General cooldown', margin + 10, yOffset);
            yOffset += 5;
          }
        }

        yOffset += 15; // Space after workout
      });
    yOffset += 15; // Space after phase
  });

  // Add copyright and disclaimer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128); // Gray text
  const footerText = [
    '© 2025 Baisics. All rights reserved.',
    'Disclaimer: This program is for informational purposes only. Consult your physician before starting any exercise program.',
    'Visit baisics.app to manage your program and track your progress.'
  ];
  
  footerText.forEach((line, index) => {
    doc.text(line, margin, doc.internal.pageSize.height - 15 + (index * 4), { align: 'left' });
  });

  // Create and open PDF in new tab
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, '_blank');
  // Clean up blob URL after opening
  setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
} 