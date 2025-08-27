import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Check, X } from 'lucide-react';
import { getUserName } from '../utils.js';

function InvitationsView({ currentUser, invitations, bets, users, onBack, onRespond }) {
  // Debug logging to see what we're receiving
  console.log('🔍 InvitationsView Debug:', {
    currentUser: currentUser?.username,
    invitations: invitations,
    invitationsType: typeof invitations,
    invitationsLength: invitations?.length,
    isArray: Array.isArray(invitations),
    bets: bets?.length,
    users: users?.length
  });

  const getBetDetails = (betId) => {
    const bet = bets.find(b => b.id === betId);
    if (!bet) return null;
    
    return {
      title: bet.title,
      description: bet.description,
      stakeTokens: bet.stakeTokens,
      outcomes: bet.outcomes,
      participants: bet.participants || []
    };
  };

  // Comprehensive safety check: ensure invitations is a valid array
  if (!invitations || !Array.isArray(invitations)) {
    console.log('⚠️ InvitationsView: invitations is not a valid array, showing loading state');
    return (
      <motion.div className="max-w-md mx-auto bg-white min-h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="bg-secondary-500 text-white p-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="text-white hover:text-secondary-100"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Invitations</h1>
              <p className="text-secondary-100 text-sm">Loading...</p>
            </div>
          </div>
        </div>

        <motion.div className="p-6 text-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Users size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Invitations</h2>
          <p className="text-gray-600">Please wait while we load your invitations...</p>
          <p className="text-xs text-gray-400 mt-2">
            Debug: {typeof invitations} - {invitations ? 'exists' : 'null/undefined'}
          </p>
        </motion.div>
      </motion.div>
    );
  }

  if (invitations.length === 0) {
    return (
      <motion.div className="max-w-md mx-auto bg-white min-h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="bg-secondary-500 text-white p-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="text-white hover:text-secondary-100"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Invitations</h1>
              <p className="text-secondary-100 text-sm">No new invitations</p>
            </div>
          </div>
        </div>

        <motion.div className="p-6 text-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Users size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Invitations</h2>
          <p className="text-gray-600">You have no pending invitations.</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div className="max-w-md mx-auto bg-white min-h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-secondary-500 text-white p-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="text-white hover:text-secondary-100"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Invitations</h1>
            <p className="text-secondary-100 text-sm">{invitations.length} pending</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <AnimatePresence initial={false}>
        {invitations.map((invitation, idx) => {
          const betDetails = getBetDetails(invitation.betId);
          const creatorName = getUserName(invitation.fromUserId, users);
          
          if (!betDetails) return null;

          return (
            <motion.div key={invitation.id} className="bg-white border rounded-xl p-4 shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              whileHover={{ scale: 1.01, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{betDetails.title}</h3>
                  <p className="text-sm text-gray-500">from {creatorName}</p>
                </div>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  New
                </span>
              </div>

              {betDetails.description && (
                <p className="text-gray-600 text-sm mb-3">{betDetails.description}</p>
              )}

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-sm">
                  <p className="text-gray-500">Token Stake:</p>
                  <p className="font-medium">💰 {betDetails.stakeTokens}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Possible Outcomes:</p>
                <div className="space-y-1">
                  {betDetails.outcomes.map((outcome, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded">
                      {outcome}
                    </div>
                  ))}
                </div>
              </div>

              {/* 🎯 NEW: Current Participants Section */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Users size={16} className="mr-1" />
                  Current Participants ({betDetails.participants.length})
                </p>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  {betDetails.participants.length > 0 ? (
                    <div className="space-y-1">
                      {betDetails.participants.map((participantId, index) => {
                        const participant = users.find(u => u.id === participantId);
                        return (
                          <div key={participantId} className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700 font-medium">
                              {participant?.username || 'Unknown User'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-2">
                      No participants yet
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  onClick={() => onRespond(invitation.id, 'accepted')}
                  className="flex-1 bg-green-500 text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Check size={20} />
                  <span>Accept</span>
                </motion.button>
                <motion.button
                  onClick={() => onRespond(invitation.id, 'declined')}
                  className="flex-1 bg-red-500 text-white p-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <X size={20} />
                  <span>Decline</span>
                </motion.button>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default InvitationsView; 