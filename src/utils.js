// Utility functions for BetMe app
import { Clock, Vote, Trophy, AlertTriangle } from 'lucide-react';
import { BET_STATUS, CREDIBILITY_LEVELS, VOTING_CONFIG } from './constants.js';

// Status utility functions
export const getStatusColor = (status) => {
  switch(status) {
    case BET_STATUS.ACTIVE: return 'bg-green-100 text-green-800';
    case BET_STATUS.VOTING: return 'bg-yellow-100 text-yellow-800';
    case BET_STATUS.COMPLETED: return 'bg-blue-100 text-blue-800';
    case BET_STATUS.ANNULLED: return 'bg-red-100 text-red-800';
    case BET_STATUS.FINISHED: return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status) => {
  switch(status) {
    case BET_STATUS.ACTIVE: return 'Active';
    case BET_STATUS.VOTING: return 'Voting';
    case BET_STATUS.COMPLETED: return 'Completed';
    case BET_STATUS.ANNULLED: return 'Annulled';
    case BET_STATUS.FINISHED: return 'Finished';
    default: return 'Unknown';
  }
};

export const getStatusIcon = (status) => {
  switch(status) {
    case BET_STATUS.ACTIVE: return <Clock size={16} />;
    case BET_STATUS.VOTING: return <Vote size={16} />;
    case BET_STATUS.COMPLETED: return <Trophy size={16} />;
    case BET_STATUS.ANNULLED: return <AlertTriangle size={16} />;
    case BET_STATUS.FINISHED: return <Trophy size={16} />;
    default: return <Clock size={16} />;
  }
};

// User utility functions
export const getUserName = (userId, users) => {
  const user = users.find(u => u.id === userId);
  return user ? user.username : 'Unknown';
};

export const getUserTokens = (userId, users) => {
  const user = users.find(u => u.id === userId);
  return user ? user.tokens : 0;
};

export const getFriends = (userId, users) => {
  const user = users.find(u => u.id === userId);
  if (!user) return [];
  return user.friends.map(friendId => users.find(u => u.id === friendId)).filter(Boolean);
};

// Time formatting
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
  
  if (isToday) {
    return `Today, ${date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  } else if (isYesterday) {
    return `Yesterday, ${date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  } else {
    return `${date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })}, ${date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  }
};

// LocalStorage helpers
export const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const loadFromLocalStorage = (key, defaultValue = null) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
};

// Bet utility functions
export const getBetChatMessages = (betId, bets) => {
  const bet = bets.find(b => b.id === betId);
  return bet?.chatMessages || [];
};

export const hasVoted = (username, bet) => {
  return bet.votes && Object.keys(bet.votes).includes(username);
};

export const getVoteCount = (outcome, bet) => {
  if (!bet.votes) return 0;
  return Object.values(bet.votes).filter(vote => vote === outcome).length;
};

// Credibility utility functions
export const getUserCredibility = (userId, users) => {
  const user = users.find(u => u.id === userId);
  return user ? user.credibility : 100;
};

export const getCredibilityColor = (credibility) => {
  if (credibility >= 80) return 'text-green-600';
  if (credibility >= 60) return 'text-yellow-600';
  if (credibility >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export const getCredibilityBadge = (credibility) => {
  for (const level of Object.values(CREDIBILITY_LEVELS)) {
    if (credibility >= level.min) {
      return { text: level.text, color: level.color };
    }
  }
  return { text: CREDIBILITY_LEVELS.VERY_LOW.text, color: CREDIBILITY_LEVELS.VERY_LOW.color };
};

export const calculateMajorityVote = (votes) => {
  if (!votes || Object.keys(votes).length === 0) return null;
  
  const voteCounts = {};
  Object.values(votes).forEach(vote => {
    voteCounts[vote] = (voteCounts[vote] || 0) + 1;
  });
  
  const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
  const maxVotes = Math.max(...Object.values(voteCounts));
  const majorityOutcomes = Object.keys(voteCounts).filter(outcome => voteCounts[outcome] === maxVotes);
  
  // 🎯 FIXED: Only return a winner if there's a clear majority (more than 50% of votes)
  // AND there's only one outcome with the maximum votes
  if (majorityOutcomes.length === 1 && maxVotes > totalVotes / 2) {
    return majorityOutcomes[0];
  }
  
  return null;
};

// 🆕 NEW: Calculate absolute majority (more than 50% of ALL participants)
export const calculateAbsoluteMajority = (votes, totalParticipants) => {
  if (!votes || Object.keys(votes).length === 0) return null;
  
  const voteCounts = {};
  Object.values(votes).forEach(vote => {
    voteCounts[vote] = (voteCounts[vote] || 0) + 1;
  });
  
  const maxVotes = Math.max(...Object.values(voteCounts));
  const majorityOutcomes = Object.keys(voteCounts).filter(outcome => voteCounts[outcome] === maxVotes);
  
  // Absolute majority: more than 50% of ALL participants
  // For 3 participants: threshold = Math.floor(3 * 0.50) = 1, so we need > 1 votes = 2 or more votes
  const absoluteMajorityThreshold = Math.floor(totalParticipants * VOTING_CONFIG.MAJORITY_THRESHOLD_PERCENTAGE);
  
  console.log('🔍 Absolute majority calculation:', {
    votes,
    totalParticipants,
    voteCounts,
    maxVotes,
    majorityOutcomes,
    absoluteMajorityThreshold,
    hasMajority: majorityOutcomes.length === 1 && maxVotes > absoluteMajorityThreshold
  });
  
  if (majorityOutcomes.length === 1 && maxVotes > absoluteMajorityThreshold) {
    return majorityOutcomes[0];
  }
  
  return null;
};

// 🆕 NEW: Check if voting window has expired
export const isVotingWindowExpired = (votingStartTime) => {
  if (!votingStartTime) return false;
  
  const votingStart = new Date(votingStartTime);
  const now = new Date();
  const votingWindowMs = VOTING_CONFIG.VOTING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  
  return (now - votingStart) > votingWindowMs;
};

// 🆕 NEW: Get time remaining in voting window
export const getVotingTimeRemaining = (votingStartTime) => {
  if (!votingStartTime) return null;
  
  const votingStart = new Date(votingStartTime);
  const now = new Date();
  const votingWindowMs = VOTING_CONFIG.VOTING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const timeElapsed = now - votingStart;
  const timeRemaining = votingWindowMs - timeElapsed;
  
  if (timeRemaining <= 0) return 0;
  
  return timeRemaining;
};

// 🆕 NEW: Format time remaining as human readable
export const formatTimeRemaining = (timeRemainingMs) => {
  if (timeRemainingMs <= 0) return 'Expired';
  
  const days = Math.floor(timeRemainingMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((timeRemainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((timeRemainingMs % (60 * 60 * 1000)) / (60 * 1000));
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

// 🆕 NEW: Check if all participants have voted
export const hasAllParticipantsVoted = (bet, users) => {
  if (!bet.participants || !bet.votes) return false;
  
  return bet.participants.every(participantId => {
    const participant = users.find(u => u.id === participantId);
    return participant && bet.votes[participant.username];
  });
};

// 🆕 NEW: Get participants who haven't voted
export const getNonVotingParticipants = (bet, users) => {
  if (!bet.participants || !bet.votes) return bet.participants || [];
  
  return bet.participants.filter(participantId => {
    const participant = users.find(u => u.id === participantId);
    return !participant || !bet.votes[participant.username];
  });
};

// 🆕 NEW: Get participants who voted against absolute majority
export const getParticipantsVotingAgainstMajority = (bet, users, absoluteMajority) => {
  if (!absoluteMajority || !bet.votes || !bet.participants) return [];
  
  return bet.participants.filter(participantId => {
    const participant = users.find(u => u.id === participantId);
    if (!participant) return false;
    
    const participantVote = bet.votes[participant.username];
    return participantVote && participantVote !== absoluteMajority;
  });
};

export const getNonVoters = (bet, users) => {
  const voters = Object.keys(bet.votes || {});
  return bet.participants.filter(participantId => !voters.includes(participantId.toString()));
}; 