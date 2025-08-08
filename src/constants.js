// Application constants and configuration

export const APP_CONFIG = {
  APP_NAME: 'Bet Me If You Can',
  DEFAULT_TOKENS: 1000,
  APP_FEE_PERCENTAGE: 0.03, // 3% app fee
  MIN_CREDIBILITY: 0,
  MAX_CREDIBILITY: 100
};

export const CREDIBILITY_CONFIG = {
  VOTE_AGAINST_MAJORITY: 15, // Points lost for voting against majority
  NO_VOTE: 10, // Points lost for not voting
  MIN_CREDIBILITY: 0,
  MAX_CREDIBILITY: 100
};

export const VOTING_CONFIG = {
  VOTING_WINDOW_DAYS: 3, // 3-day voting window
  CANCELLATION_FEE_PERCENTAGE: 0.20, // 20% cancellation fee for annulment
  MAJORITY_THRESHOLD_PERCENTAGE: 0.50 // More than 50% for absolute majority
};

export const BET_STATUS = {
  ACTIVE: 'active',
  VOTING: 'voting',
  COMPLETED: 'completed',
  ANNULLED: 'annulled', // New status for expired voting
  FINISHED: 'finished'
};

export const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined'
};

export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000
};

export const CREDIBILITY_LEVELS = {
  TRUSTWORTHY: { min: 90, text: 'Trustworthy', color: 'bg-green-100 text-green-800' },
  GOOD: { min: 70, text: 'Good', color: 'bg-blue-100 text-blue-800' },
  AVERAGE: { min: 50, text: 'Average', color: 'bg-yellow-100 text-yellow-800' },
  LOW: { min: 30, text: 'Low', color: 'bg-orange-100 text-orange-800' },
  VERY_LOW: { min: 0, text: 'Very Low', color: 'bg-red-100 text-red-800' }
}; 