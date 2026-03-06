export const TRIAL_DURATION_DAYS = 14;

type TrialUser = {
  isPremium: boolean;
  trialStartedAt: Date | string | null;
  trialEndsAt: Date | string | null;
};

export function isTrialActive(user: TrialUser): boolean {
  if (user.isPremium) return false;
  if (!user.trialEndsAt) return false;
  return new Date(user.trialEndsAt) > new Date();
}

export function isEffectivelyPremium(user: TrialUser): boolean {
  return user.isPremium || isTrialActive(user);
}

export function hasTrialExpired(user: TrialUser): boolean {
  if (user.isPremium) return false;
  if (!user.trialStartedAt || !user.trialEndsAt) return false;
  return new Date(user.trialEndsAt) <= new Date();
}

export function getTrialDaysRemaining(user: TrialUser): number {
  if (!user.trialEndsAt) return 0;
  const diff = new Date(user.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function hasUsedTrial(user: TrialUser): boolean {
  return user.trialStartedAt !== null;
}

export function calculateTrialEnd(): Date {
  const end = new Date();
  end.setDate(end.getDate() + TRIAL_DURATION_DAYS);
  return end;
}
