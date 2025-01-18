export type Sex = 'man' | 'woman' | 'other' | 'male' | 'female';
export type TrainingGoal = 
  | 'muscle_gain'
  | 'fat_loss'
  | 'strength'
  | 'endurance'
  | 'health'
  | 'mobility'
  | 'athletic_performance'
  | 'rehabilitation';

export type TrainingPreference = 
  | 'resistance'
  | 'free weights'
  | 'machines'
  | 'bodyweight'
  | 'plyometrics'
  | 'running'
  | 'swimming'
  | 'cycling'
  | 'yoga'
  | 'pilates'
  | 'group classes'
  | 'home workouts'
  | 'outdoor activities'
  | 'low impact'
  | 'high intensity'
  | 'olympic lifting'
  | 'powerlifting'
  | 'crossfit style'
  | 'functional training'
  | 'mobility work';

export interface UserProfile {
  sex: Sex;
  trainingGoal: TrainingGoal;
  daysAvailable: number;
  trainingPreferences: TrainingPreference[];
  age: number;
  weight: number; // in lbs
  height: number; // in inches
  additionalInfo: string;
  dailyBudget: number; // in minutes
}

export const SAMPLE_PROFILES: Record<string, UserProfile> = {
  sarahChen: {
    sex: "female",
    trainingGoal: "fat_loss",
    daysAvailable: 3,
    trainingPreferences: ["machines", "low impact", "home workouts"],
    age: 31,
    weight: 145,
    height: 64,
    additionalInfo: "Tech PM with sedentary lifestyle and lower back pain from sitting. Complete beginner looking for structured approach. Prefers morning workouts before 9am. Lives in apartment, needs quiet exercises.",
    dailyBudget: 45,
  },
  
  marcusThompson: {
    sex: "male",
    trainingGoal: "athletic_performance",
    daysAvailable: 5,
    trainingPreferences: ["free weights", "plyometrics", "functional training"],
    age: 42,
    weight: 225,
    height: 73,
    additionalInfo: "Former college basketball player, now teaching and coaching. Has rotator cuff injury history. Access to school gym. Looking to regain athletic ability and keep up with students.",
    dailyBudget: 90,
  },

  ritaPatel: {
    sex: "female",
    trainingGoal: "health",
    daysAvailable: 3,
    trainingPreferences: ["low impact", "machines", "group classes"],
    age: 67,
    weight: 132,
    height: 62,
    additionalInfo: "Retired accountant with osteoarthritis in knees. Takes blood pressure medication. Focus on maintaining independence and bone density. Prefers mid-morning sessions and detailed form instruction.",
    dailyBudget: 45,
  },

  jordanWright: {
    sex: "other",
    trainingGoal: "strength",
    daysAvailable: 6,
    trainingPreferences: ["olympic lifting", "powerlifting", "crossfit style"],
    age: 28,
    weight: 165,
    height: 68,
    additionalInfo: "Experienced with CrossFit and powerlifting. Has celiac disease. Works from home with flexible schedule. Competes in local CrossFit events. Very particular about programming methodology.",
    dailyBudget: 120,
  },

  alexRivera: {
    sex: "male",
    trainingGoal: "muscle_gain",
    daysAvailable: 4,
    trainingPreferences: ["free weights", "machines", "resistance"],
    age: 23,
    weight: 150,
    height: 69,
    additionalInfo: "Recent graduate starting first office job. Skinny build, wants to bulk up. Some experience with basic lifts from YouTube. Budget conscious, member at commercial gym chain.",
    dailyBudget: 60,
  },

  emmaLewis: {
    sex: "female",
    trainingGoal: "endurance",
    daysAvailable: 4,
    trainingPreferences: ["running", "cycling", "functional training"],
    age: 35,
    weight: 128,
    height: 65,
    additionalInfo: "Marketing executive training for first half marathon. Morning person. Previously focused only on cardio, now wants balanced program. Has mild asthma.",
    dailyBudget: 75,
  },

  davidKim: {
    sex: "male",
    trainingGoal: "rehabilitation",
    daysAvailable: 3,
    trainingPreferences: ["mobility work", "low impact", "resistance"],
    age: 45,
    weight: 190,
    height: 70,
    additionalInfo: "IT professional recovering from lower back surgery. Working with physical therapist. Needs gradually progressive program. Has ergonomic home office setup with standing desk.",
    dailyBudget: 45,
  },

  sophiaBrown: {
    sex: "female",
    trainingGoal: "strength",
    daysAvailable: 4,
    trainingPreferences: ["powerlifting", "free weights", "resistance"],
    age: 29,
    weight: 155,
    height: 67,
    additionalInfo: "Nurse working night shifts. Intermediate lifter interested in powerlifting. Irregular schedule needs flexible workout timing. High stress job requires focus on recovery.",
    dailyBudget: 90,
  },

  miguelTorres: {
    sex: "male",
    trainingGoal: "fat_loss",
    daysAvailable: 3,
    trainingPreferences: ["high intensity", "group classes", "functional training"],
    age: 38,
    weight: 235,
    height: 71,
    additionalInfo: "Restaurant owner with irregular hours. Former high school wrestler. Limited time but high intensity tolerance. Prefers evening workouts after dinner service.",
    dailyBudget: 45,
  },

  linaZhang: {
    sex: "female",
    trainingGoal: "mobility",
    daysAvailable: 5,
    trainingPreferences: ["yoga", "pilates", "mobility work"],
    age: 52,
    weight: 135,
    height: 63,
    additionalInfo: "University professor with desk job. Experiencing increasing stiffness. Regular yoga practitioner looking to expand routine. Interested in mind-body connection.",
    dailyBudget: 60,
  },

  jamesOConnor: {
    sex: "male",
    trainingGoal: "muscle_gain",
    daysAvailable: 5,
    trainingPreferences: ["free weights", "resistance", "machines"],
    age: 32,
    weight: 175,
    height: 71,
    additionalInfo: "Construction worker looking to build size. Already physically active at work. Needs program that accounts for physically demanding job. Experienced with basic lifts.",
    dailyBudget: 60,
  },

  aishaPatel: {
    sex: "female",
    trainingGoal: "health",
    daysAvailable: 4,
    trainingPreferences: ["low impact", "home workouts", "yoga"],
    age: 41,
    weight: 142,
    height: 64,
    additionalInfo: "Work from home mom with two young kids. Manages type 2 diabetes. Prefers home workouts during kids' nap time. Needs flexible schedule options.",
    dailyBudget: 30,
  },

  thomasWilson: {
    sex: "male",
    trainingGoal: "fat_loss",
    daysAvailable: 3,
    trainingPreferences: ["machines", "low impact", "swimming"],
    age: 58,
    weight: 245,
    height: 69,
    additionalInfo: "Accountant with knee replacement. Never consistently exercised before. Has pool access at local community center. Prefers structured, repeatable workouts.",
    dailyBudget: 45,
  },

  kellyNguyen: {
    sex: "female",
    trainingGoal: "athletic_performance",
    daysAvailable: 6,
    trainingPreferences: ["plyometrics", "free weights", "running"],
    age: 25,
    weight: 130,
    height: 66,
    additionalInfo: "Semi-professional soccer player. Needs sport-specific conditioning. Already has good baseline fitness. Looking for performance edge and injury prevention.",
    dailyBudget: 90,
  },

  robertCarter: {
    sex: "male",
    trainingGoal: "strength",
    daysAvailable: 4,
    trainingPreferences: ["powerlifting", "free weights", "resistance"],
    age: 35,
    weight: 205,
    height: 74,
    additionalInfo: "Police officer looking to improve job performance. Has home gym setup. Experience with basic powerlifting. Irregular shift work requires flexible scheduling.",
    dailyBudget: 75,
  },
  athleteProfile: {
    sex: "male" as Sex,
    trainingGoal: "muscle_gain" as TrainingGoal,
    daysAvailable: 5,
    trainingPreferences: [
      "resistance",
      "free weights",
      "plyometrics",
      "running",
    ] as TrainingPreference[],
    age: 25,
    weight: 180,
    height: 72,
    additionalInfo:
      "I was an athlete in college but have since lost my physique. famliar with weights and lifting, but need some help with the programming and diet to do some body recomp and get back to my best.",
    dailyBudget: 60,
  },
  beginnerProfile: {
    sex: "female" as Sex,
    trainingGoal: "weight_loss" as TrainingGoal,
    daysAvailable: 3,
    trainingPreferences: ["machines", "cardio", "yoga"] as TrainingPreference[],
    age: 35,
    weight: 150,
    height: 65,
    additionalInfo: "i'm new to fitness. looking to establish healthy habits",
    dailyBudget: 30,
  },
  seniorProfile: {
    sex: "other" as Sex,
    trainingGoal: "endurance" as TrainingGoal,
    daysAvailable: 4,
    trainingPreferences: [
      "resistance",
      "machines",
      "yoga",
    ] as TrainingPreference[],
    age: 65,
    weight: 160,
    height: 68,
    additionalInfo: "Focus on maintaining mobility and independence",
    dailyBudget: 45,
  },
  postpartumProfile: {
    sex: "female" as Sex,
    trainingGoal: "strength" as TrainingGoal,
    daysAvailable: 4,
    trainingPreferences: [
      "bodyweight",
      "resistance",
      "pilates",
      "yoga",
    ] as TrainingPreference[],
    age: 32,
    weight: 145,
    height: 67,
    additionalInfo: "6 months postpartum, cleared for exercise. Need to rebuild core strength and overall fitness safely",
    dailyBudget: 45,
  },
  remoteWorkerProfile: {
    sex: "male" as Sex,
    trainingGoal: "posture" as TrainingGoal,
    daysAvailable: 5,
    trainingPreferences: [
      "calisthenics",
      "resistance",
      "mobility",
    ] as TrainingPreference[],
    age: 28,
    weight: 165,
    height: 70,
    additionalInfo: "Software developer with back pain from sitting. Home gym setup available. Need help with posture and preventing desk job related issues",
    dailyBudget: 50,
  },
  rehabProfile: {
    sex: "female" as Sex,
    trainingGoal: "mobility" as TrainingGoal,
    daysAvailable: 6,
    trainingPreferences: [
      "resistance",
      "mobility",
      "swimming",
    ] as TrainingPreference[],
    age: 45,
    weight: 140,
    height: 64,
    additionalInfo: "Recovering from knee replacement surgery. Cleared by PT for exercise. Need to rebuild strength while protecting joints",
    dailyBudget: 55,
  },
  busyParentProfile: {
    sex: "male" as Sex,
    trainingGoal: "fat_loss" as TrainingGoal,
    daysAvailable: 3,
    trainingPreferences: [
      "hiit",
      "bodyweight",
      "cardio",
    ] as TrainingPreference[],
    age: 40,
    weight: 195,
    height: 71,
    additionalInfo: "Parent of 3 young kids. Limited time but have home equipment. Need efficient workouts that can be done in 30-45 minutes",
    dailyBudget: 35,
  },
  powerlifterProfile: {
    sex: "female" as Sex,
    trainingGoal: "strength" as TrainingGoal,
    daysAvailable: 4,
    trainingPreferences: [
      "free weights",
      "resistance",
      "powerlifting",
    ] as TrainingPreference[],
    age: 29,
    weight: 165,
    height: 66,
    additionalInfo: "Intermediate powerlifter looking to improve competition total. Current maxes: S-275, B-165, D-315",
    dailyBudget: 75,
  },
  stressedExecutiveProfile: {
    sex: "male" as Sex,
    trainingGoal: "stress_management" as TrainingGoal,
    daysAvailable: 4,
    trainingPreferences: [
      "cardio",
      "yoga",
      "meditation",
      "swimming",
    ] as TrainingPreference[],
    age: 52,
    weight: 190,
    height: 73,
    additionalInfo: "High-stress job, looking for exercise to help manage anxiety and improve sleep. Have access to nice gym in office building",
    dailyBudget: 65,
  },
  militaryProfile: {
    sex: "female" as Sex,
    trainingGoal: "performance" as TrainingGoal,
    daysAvailable: 6,
    trainingPreferences: [
      "calisthenics",
      "running",
      "resistance",
      "hiit",
    ] as TrainingPreference[],
    age: 24,
    weight: 135,
    height: 66,
    additionalInfo: "Active duty military. Need to maintain high level of functional fitness and pass regular PT tests. Access to base gym",
    dailyBudget: 55,
  },
};