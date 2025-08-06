// Utility functions for BetMe app
import { Clock, Vote, Trophy } from 'lucide-react';
import { BET_STATUS, CREDIBILITY_LEVELS } from './constants.js';

// Status utility functions
export const getStatusColor = (status) => {
  switch(status) {
    case BET_STATUS.ACTIVE: return 'bg-green-100 text-green-800';
    case BET_STATUS.VOTING: return 'bg-yellow-100 text-yellow-800';
    case BET_STATUS.COMPLETED: return 'bg-blue-100 text-blue-800';
    case BET_STATUS.FINISHED: return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status) => {
  switch(status) {
    case BET_STATUS.ACTIVE: return 'Active';
    case BET_STATUS.VOTING: return 'Voting';
    case BET_STATUS.COMPLETED: return 'Completed';
    case BET_STATUS.FINISHED: return 'Finished';
    default: return 'Unknown';
  }
};

export const getStatusIcon = (status) => {
  switch(status) {
    case BET_STATUS.ACTIVE: return <Clock size={16} />;
    case BET_STATUS.VOTING: return <Vote size={16} />;
    case BET_STATUS.COMPLETED: return <Trophy size={16} />;
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
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
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
  
  const maxVotes = Math.max(...Object.values(voteCounts));
  const majorityOutcomes = Object.keys(voteCounts).filter(outcome => voteCounts[outcome] === maxVotes);
  
  return majorityOutcomes.length === 1 ? majorityOutcomes[0] : null;
};

export const getNonVoters = (bet, users) => {
  const voters = Object.keys(bet.votes || {});
  return bet.participants.filter(participantId => !voters.includes(participantId.toString()));
}; 