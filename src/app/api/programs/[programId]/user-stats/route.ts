interface UserStatsResponse {
  weight: {
    current: number;
    start: number;
    lastUpdated: string;
  };
  measurements?: {
    // Future expansion for other measurements
    chest?: number;
    waist?: number;
    // etc
  };
} 