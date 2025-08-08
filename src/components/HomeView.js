import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Trophy, MessageCircle, Vote } from 'lucide-react';
import { getStatusColor, getStatusText, getStatusIcon, getUserName, getCredibilityBadge } from '../utils.js';
import LoadingSpinner from './LoadingSpinner.js';

function HomeView({ currentUser, bets, users, invitations, onLogout, onCreateBet, onViewInvitations, onViewProfile, onViewCredibility, onViewTokenHistory, onViewBet, isLoading = false }) {
  const userBets = bets.filter(bet => bet.participants.includes(currentUser.id));
  const pendingInvitations = invitations.filter(inv => 
    inv.toUserId === currentUser.id && inv.status === 'pending'
  ).length;

  // Helper function to check if user needs to vote
  const needsToVote = (bet) => {
    if (bet.status !== 'voting') return false;
    if (!bet.votes) return true;
    return !bet.votes[currentUser.username];
  };

  // Debug logging
  console.log('🏠 HomeView Debug:', {
    currentUser: currentUser?.username,
    currentUserId: currentUser?.id,
    totalBets: bets.length,
    userBetsCount: userBets.length,
    totalInvitations: invitations.length,
    pendingInvitations,
    userBetsList: userBets.map(b => ({ 
      id: b.id, 
      title: b.title, 
      status: b.status,
      participants: b.participants,
      creatorId: b.creatorId
    })),
    allBets: bets.map(b => ({ 
      id: b.id, 
      title: b.title, 
      participants: b.participants,
      creatorId: b.creatorId
    }))
  });

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="bg-primary-500 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Bet Me If You Can</h1>
            <p className="text-primary-100 text-sm">Hey {currentUser.username}! 👋</p>
            <div className="flex items-center space-x-2 text-primary-200 text-xs">
              <button
                onClick={onViewTokenHistory}
                className="text-white font-semibold hover:text-primary-100 transition-colors cursor-pointer"
              >
                💰 {currentUser.tokens} Tokens
              </button>
              <span>•</span>
              <button
                onClick={onViewCredibility}
                className="text-white font-semibold hover:text-primary-100 transition-colors cursor-pointer"
              >
                🎯 {currentUser.credibility || 100}/100 Credibility
              </button>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="text-primary-100 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <motion.button
          onClick={onCreateBet}
          className="w-full bg-accent-500 text-white p-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-accent-600 transition-colors relative overflow-hidden"
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 10px 25px rgba(93, 163, 153, 0.3)"
          }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            type: "spring",
            stiffness: 200
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-600 opacity-0"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="relative z-10 flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <Plus size={24} />
            </motion.div>
            <span>Create New Bet</span>
          </motion.div>
        </motion.button>

        {pendingInvitations > 0 && (
          <motion.button
            onClick={onViewInvitations}
            className="w-full bg-secondary-500 text-white p-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-secondary-600 transition-colors relative"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3,
              delay: 0.1,
              type: "spring",
              stiffness: 200
            }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Users size={24} />
            </motion.div>
            <span>Invitations ({pendingInvitations})</span>
            <motion.span 
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: 0.2,
                type: "spring",
                stiffness: 300
              }}
            >
              {pendingInvitations}
            </motion.span>
          </motion.button>
        )}


      </div>

      <div className="px-4 pb-20 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">My Bets</h2>
        
        {isLoading ? (
          <LoadingSpinner size="lg" text="Loading bets..." />
        ) : userBets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy size={48} className="mx-auto mb-4 opacity-50" />
            <p>No bets available.</p>
            <p className="text-sm">Create your first bet!</p>
          </div>
        ) : (
          userBets.map((currentBet, index) => (
            <motion.div
              key={currentBet.id}
              onClick={() => onViewBet(currentBet)}
              className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.1,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Voting notification indicator */}
              {needsToVote(currentBet) && (
                <motion.div
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg z-10"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 500,
                    damping: 15
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Vote size={12} />
                </motion.div>
              )}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{currentBet.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(currentBet.status)}`}>
                  {getStatusIcon(currentBet.status)}
                  <span>{getStatusText(currentBet.status)}</span>
                </span>
              </div>
              
                             <p className="text-gray-600 text-sm mb-3">{currentBet.description || 'No description'}</p>
              
              {currentBet.chatMessages && currentBet.chatMessages.length > 0 && (
                                <div className="mb-3 p-2 bg-primary-50 rounded-lg border-l-2 border-primary-300">
                  <div className="flex items-center space-x-2 mb-1">
                    <MessageCircle size={12} className="text-primary-500" />
                    <span className="text-xs text-primary-600 font-medium">Last message:</span>
                  </div>
                  <p className="text-xs text-gray-700 truncate">
                    <span className="font-medium">{currentBet.chatMessages[currentBet.chatMessages.length - 1].username}:</span> {currentBet.chatMessages[currentBet.chatMessages.length - 1].message}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Users size={16} />
                                     <span>{currentBet.participants.length} Participants</span>
                  {currentBet.chatMessages && currentBet.chatMessages.length > 0 && (
                    <div className="flex items-center space-x-1 ml-2">
                      <MessageCircle size={14} className="text-primary-500" />
                      <span className="text-primary-600 text-xs font-medium">
                        {currentBet.chatMessages.length}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">💰 {currentBet.stakeTokens} Tokens</p>
                                     <p className="text-xs text-gray-500">from {getUserName(currentBet.creatorId, users)}</p>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getCredibilityBadge(currentUser.credibility).color}`}>
                      {getCredibilityBadge(currentUser.credibility).text}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default HomeView; 