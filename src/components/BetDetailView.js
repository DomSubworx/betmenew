import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, Vote, Trophy, MessageCircle, Send, Share2, UserPlus } from 'lucide-react';
import { getUserName, getStatusColor, getStatusText, getStatusIcon, hasVoted, getVoteCount, formatTime } from '../utils.js';
import { useToast } from '../contexts/ToastContext.js';
import { dataService } from '../services/dataService.js';

function BetDetailView({ bet, currentUser, users, invitations, setInvitations, setBets, bets, onBack, onVote, onStartVoting }) {
  const { showError, showSuccess } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [selectedWinner, setSelectedWinner] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatEndRef = useRef(null);

  // 🎨 NEW: Chat bubble colors for each user
  const chatBubbleColors = [
    '#397367', // Hooker's green
    '#63CCCA', // Robin egg blue  
    '#5DA399', // Keppel
    '#42858C', // Dark cyan
    '#35393C', // Onyx
    '#6B8E23', // Olive drab (fallback)
    '#4682B4', // Steel blue (fallback)
    '#8FBC8F', // Dark sea green (fallback)
    '#DDA0DD', // Plum (fallback)
    '#F0E68C'  // Khaki (fallback)
  ];

  // 🎨 NEW: Get unique color for each user
  const getUserChatColor = (userId) => {
    const userIndex = users.findIndex(u => u.id === userId);
    return chatBubbleColors[userIndex % chatBubbleColors.length];
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [bet.chatMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isSendingMessage) return;

    const messageText = newMessage.trim();
    
    // 🎯 FIXED: Set loading state
    setIsSendingMessage(true);
    
    // 🎯 FIXED: Create message object for immediate UI update
    const message = {
      id: Date.now(),
      userId: currentUser.id,
      username: currentUser.username,
      message: messageText,
      timestamp: new Date().toISOString()
    };

    // 🎯 FIXED: Update UI immediately for responsive feedback
    setBets(prev => prev.map(b => 
      b.id === bet.id 
        ? { 
            ...b, 
            chatMessages: [...(b.chatMessages || []), message]
          }
        : b
    ));

    // 🎯 FIXED: Clear input immediately
    setNewMessage('');

    // 🎯 FIXED: Save to data service in background (don't block UI)
    try {
      await dataService.addChatMessage(bet.id, currentUser.id, messageText);
      console.log('✅ Chat message saved to data service');
      // 🎯 FIXED: Show subtle success feedback (optional - can be removed if too noisy)
      // showSuccess('Message sent!');
    } catch (error) {
      console.error('❌ Error saving chat message:', error);
      showError('Message sent but failed to save. Please try again.');
    } finally {
      // 🎯 FIXED: Clear loading state
      setIsSendingMessage(false);
    }
  };

  const inviteUserToBet = async (betId, userId) => {
    // 🎯 FIXED: Create invitation object
    const newInvitation = {
      id: Date.now(),
      betId: betId,
      fromUserId: currentUser.id,
      toUserId: userId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // 🎯 FIXED: Update local state immediately for UI responsiveness
    setInvitations(prev => [...prev, newInvitation]);
    showSuccess(`Invitation sent to ${getUserName(userId, users)}!`);

    // 🎯 FIXED: Save to data service in background (don't block UI)
    try {
      await dataService.createInvitation(newInvitation);
      console.log('✅ Invitation saved to data service');
    } catch (error) {
      console.error('❌ Error saving invitation:', error);
      showError('Invitation sent but failed to save. Please try again.');
    }
  };

  const handleVote = () => {
    console.log('🚨 HANDLE VOTE CLICKED!', { selectedWinner, betId: bet.id, voter: currentUser.username });
    
    if (!selectedWinner) {
      showError('Please select a winner!');
      return;
    }

    console.log('🗳️ About to call onVote with:', { betId: bet.id, winner: selectedWinner, voter: currentUser.username });
    console.log('🗳️ onVote function type:', typeof onVote);
    
    try {
      onVote(bet.id, selectedWinner, currentUser.username);
      console.log('✅ onVote called successfully');
    } catch (error) {
      console.error('❌ Error calling onVote:', error);
    }
    
    setSelectedWinner('');
  };

  const shareLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?bet=${bet.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      showSuccess('🔗 Bet link copied!');
    }
  };

  const isUserInvited = (userId) => {
    return invitations.some(inv => 
      inv.betId === bet.id && inv.toUserId === userId && inv.status === 'pending'
    );
  };

  const availableUsers = users.filter(user => 
    !bet.participants.includes(user.id) && 
    !isUserInvited(user.id) &&
    user.id !== currentUser.id
  );

  const totalPot = bet.stakeTokens * bet.participants.length;
  const appFee = Math.floor(totalPot * 0.03);
  const winnersReward = totalPot - appFee;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="bg-primary-500 text-white p-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="text-white hover:text-primary-100"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold truncate">{bet.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(bet.status)}`}>
                {getStatusIcon(bet.status)}
                <span>{getStatusText(bet.status)}</span>
              </span>
              <span className="text-primary-100 text-sm">
                {bet.participants.length} Participants
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Bet Info */}
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-2">{bet.title}</h2>
          {bet.description && (
            <p className="text-gray-600 text-sm mb-3">{bet.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <p className="text-gray-500">Pot:</p>
              <p className="font-medium">{totalPot} 🪙</p>
            </div>
            <div>
              <p className="text-gray-500">Stake:</p>
              <p className="font-medium">{bet.stakeTokens} 🪙</p>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            App Fee: {appFee} 🪙 • Win: {winnersReward} 🪙
          </div>
        </div>

        {/* Participants */}
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Users size={20} className="mr-2" />
            Participants ({bet.participants.length})
          </h3>
          <div className="space-y-2">
            {bet.participants.map(participantId => {
              const participant = users.find(u => u.id === participantId);
              const userBet = bet.participantBets?.[participantId];
              return (
                <div key={participantId} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{participant?.username}</div>
                    {userBet && (
                      <div className="text-sm text-gray-500">Betting on: {userBet}</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">💰 {participant?.tokens}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Voting Section */}
        {bet.status === 'voting' && (
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Vote size={20} className="mr-2" />
              Voting ({Object.keys(bet.votes || {}).length}/{bet.participants.length} votes)
            </h3>
            
            {!hasVoted(currentUser.username, bet) ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Choose the winner:</p>
                <div className="space-y-2">
                  {bet.outcomes.map((outcome, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedWinner(outcome)}
                      className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                        selectedWinner === outcome
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{outcome}</div>
                      <div className="text-sm text-gray-500">
                        Votes: {getVoteCount(outcome, bet)} {getVoteCount(outcome, bet) > 0 && '🗳️'}
                        {/* Debug info */}
                        {console.log(`Vote count for ${outcome}:`, getVoteCount(outcome, bet), 'bet votes:', bet.votes)}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleVote}
                  disabled={!selectedWinner}
                  className="w-full bg-primary-500 text-white p-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Submit Vote
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">You have already voted!</p>
                {bet.outcomes.map((outcome, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{outcome}</div>
                    <div className="text-sm text-gray-500">
                      Votes: {getVoteCount(outcome, bet)} {getVoteCount(outcome, bet) > 0 && '🗳️'}
                      {/* Debug info */}
                      {console.log(`Vote count for ${outcome} (already voted):`, getVoteCount(outcome, bet), 'bet votes:', bet.votes)}
                    </div>
                  </div>
                ))}
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Waiting for {bet.participants.length - Object.keys(bet.votes || {}).length} more vote(s)...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Winner Section */}
        {bet.status === 'completed' && bet.winner && (
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Trophy size={20} className="mr-2 text-yellow-500" />
              🎉 Winner Announced!
            </h3>
            <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
              <div className="font-bold text-xl text-yellow-800 mb-2">{bet.winner}</div>
              <div className="text-sm text-yellow-600 mb-3">
                Win for all who bet correctly: {Math.floor((bet.stakeTokens * bet.participants.length) * 0.97)} 🪙
              </div>
              
              {/* Show final vote counts */}
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <p className="text-sm font-medium text-yellow-700 mb-2">Final Vote Count:</p>
                <div className="space-y-1">
                  {bet.outcomes.map((outcome, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{outcome}</span>
                      <span className="font-medium">{getVoteCount(outcome, bet)} votes</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          {bet.status === 'active' && bet.creatorId === currentUser.id && (
                      <button
            onClick={() => {
              console.log('🚨 START VOTING BUTTON CLICKED!', { betId: bet.id, currentStatus: bet.status });
              onStartVoting(bet.id);
            }}
            className="flex-1 bg-primary-500 text-white p-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Vote size={20} />
            <span>Start Voting</span>
          </button>
          )}
          
          <button
            onClick={shareLink}
            className="flex-1 bg-secondary-500 text-white p-3 rounded-lg font-semibold hover:bg-secondary-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Share2 size={20} />
            <span>Share</span>
          </button>
        </div>

        {/* Invite Users */}
        {bet.status !== 'voting' && availableUsers.length > 0 && (
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <UserPlus size={20} className="mr-2" />
              Invite Friends
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {availableUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => inviteUserToBet(bet.id, user.id)}
                  className="p-3 rounded-lg border-2 border-gray-200 hover:border-primary-300 transition-colors text-left"
                >
                  <div className="font-medium">{user.username}</div>
                  <div className="text-sm text-gray-500">💰 {user.tokens} Tokens</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Show message when bet is in voting state */}
        {bet.status === 'voting' && (
          <div className="bg-gray-50 border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <Vote size={20} className="mr-2" />
              Voting in Progress
            </h3>
            <p className="text-sm text-gray-600">
              Invitations are disabled during voting. New participants cannot join once voting has started.
            </p>
          </div>
        )}

        {/* Show message when no users available to invite */}
        {bet.status !== 'voting' && availableUsers.length === 0 && (
          <div className="bg-gray-50 border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <UserPlus size={20} className="mr-2" />
              No Friends to Invite
            </h3>
            <p className="text-sm text-gray-600">
              All your friends are already participating in this bet or have been invited.
            </p>
          </div>
        )}

        {/* Chat Section */}
        <div className="bg-white border rounded-xl shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <MessageCircle size={20} className="mr-2" />
              Chat ({bet.chatMessages?.length || 0})
            </h3>
          </div>
          
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {bet.chatMessages && bet.chatMessages.length > 0 ? (
              bet.chatMessages.map((msg, index) => {
                const isCurrentUser = msg.userId === currentUser.id;
                const bubbleColor = getUserChatColor(msg.userId);
                
                return (
                  <div key={index} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className="max-w-xs p-3 rounded-lg text-white"
                      style={{
                        backgroundColor: bubbleColor,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div className="text-xs opacity-90 mb-1 font-medium">{msg.username}</div>
                      <div className="text-sm">{msg.message}</div>
                      <div className="text-xs opacity-75 mt-1">{formatTime(msg.timestamp)}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Write a message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!newMessage.trim() || isSendingMessage}
                className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSendingMessage ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BetDetailView; 