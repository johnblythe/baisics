// These could go in types/checkin.ts
export interface CheckInStats {
  userId: string
  programId: string 
  checkInId: string

  weight?: number
  bodyFatLow?: number
  bodyFatHigh?: number
  muscleMassDistribution?: string
  notes?: string

  // Wellness Metrics
  sleepHours?: number
  sleepQuality?: number // 1-10 scale
  energyLevel?: number // 1-10 scale
  stressLevel?: number // 1-10 scale
  soreness?: number // 1-10 scale
  recovery?: number // 1-10 scale

  // Nutrition Tracking
  calories?: number
  proteinGrams?: number
  carbGrams?: number
  fatGrams?: number
  waterLiters?: number
  dietAdherence?: number // 1-10 scale
  hungerLevels?: number // 1-10 scale
  cravings?: number // 1-10 scale

  // Body Measurements
  chest?: number
  waist?: number
  hips?: number
  bicepLeft?: number
  bicepRight?: number
  bicepLeftFlex?: number
  bicepRightFlex?: number
  thighLeft?: number
  thighRight?: number
  calfLeft?: number
  calfRight?: number
}

interface CheckInPhoto {
  id: string
  type: string
  base64Data: string
  stats: CheckInStats | null
}

interface FlattenedCheckIn {
  id: string
  date: string
  type: 'initial' | 'progress' | 'end'
  stats: CheckInStats
  photos: CheckInPhoto[]
}