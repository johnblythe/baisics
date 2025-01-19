import { jsPDF } from 'jspdf';
import { Program, Workout, Exercise } from '@/types';
import { formatRestPeriod, formatExerciseMeasure } from '@/utils/formatters';
import { disclaimer, disclaimerSimple } from './disclaimer';

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
  phaseExpectations?: string;
  phaseKeyPoints?: string[];
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
    disclaimer,
    doc.internal.pageSize.width - 2 * margin
  );
  doc.text(disclaimerText, margin, yOffset);
  yOffset += (disclaimerText.length * 5) + 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.text(disclaimerSimple, margin, yOffset);

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

    // Phase Overview Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Phase Overview', margin, yOffset);
    yOffset += 10;

    // What to Expect
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('What to Expect:', margin + 5, yOffset);
    yOffset += 7;
    doc.setFont('helvetica', 'normal');
    const expectationsText = doc.splitTextToSize(
      plan.phaseExpectations || "Clients should expect to learn proper machine setup, develop basic exercise form, and establish consistent workout habits while experiencing initial weight loss and energy improvements",
      doc.internal.pageSize.width - 2 * (margin + 5)
    );
    doc.text(expectationsText, margin + 5, yOffset);
    yOffset += (expectationsText.length * 7) + 10;

    // Keys to Success
    doc.setFont('helvetica', 'bold');
    doc.text('Keys to Success:', margin + 5, yOffset-10);
    // yOffset += 7;
    doc.setFont('helvetica', 'normal');
    const keyPoints = plan.phaseKeyPoints || [
      "Machine exercises focus on controlled movements with 2 sets of 12-15 reps",
      "10 minutes of steady-state cardio at moderate intensity follows each strength session",
      "Rest periods of 30-60 seconds between exercises",
      "Emphasis on proper breathing and machine adjustments",
      "Progressive increase in weights as form improves"
    ];
    keyPoints.forEach((point: string) => {
      const pointText = doc.splitTextToSize(`• ${point}`, doc.internal.pageSize.width - 2 * (margin + 10));
      doc.text(pointText, margin + 10, yOffset);
      yOffset += (pointText.length * 7) + 3;
    });
    
    // Start new page for training schedule
    doc.addPage();
    yOffset = 20;

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