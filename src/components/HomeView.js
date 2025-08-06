import React from 'react';
import { Plus, Users, User, Trophy, MessageCircle } from 'lucide-react';
import { getStatusColor, getStatusText, getStatusIcon, getUserName, getCredibilityColor, getCredibilityBadge } from '../utils.js';

function HomeView({ currentUser, bets, users, invitations, onLogout, onCreateBet, onViewInvitations, onViewProfile, onViewCredibility, onViewBet }) {
  const userBets = bets.filter(bet => bet.participants.includes(currentUser.id));
  const pendingInvitations = invitations.filter(inv => 
    inv.toUserId === currentUser.id && inv.status === 'pending'
  ).length;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Bet Me If You Can</h1>
            <p className="text-blue-100 text-sm">Hey {currentUser.username}! 👋</p>
            <div className="flex items-center space-x-2 text-blue-200 text-xs">
              <span>💰 {currentUser.tokens} Tokens</span>
              <span>•</span>
              <span className={getCredibilityColor(currentUser.credibility)}>
                🎯 {currentUser.credibility}/100 Credibility
              </span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="text-blue-100 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <button
          onClick={onCreateBet}
          className="w-full bg-green-500 text-white p-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors"
        >
          <Plus size={24} />
          <span>Create New Bet</span>
        </button>

        {pendingInvitations > 0 && (
          <button
            onClick={onViewInvitations}
            className="w-full bg-orange-500 text-white p-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-orange-600 transition-colors relative"
          >
            <Users size={24} />
            <span>Invitations ({pendingInvitations})</span>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {pendingInvitations}
            </span>
          </button>
        )}

        <button
          onClick={onViewProfile}
          className="w-full bg-purple-500 text-white p-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-purple-600 transition-colors"
        >
          <User size={24} />
          <span>Profile</span>
        </button>

        <button
          onClick={onViewCredibility}
          className="w-full bg-indigo-500 text-white p-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-indigo-600 transition-colors"
        >
          <span className="text-lg">🎯</span>
          <span>Credibility</span>
        </button>
      </div>

      <div className="px-4 pb-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">My Bets</h2>
        
        {userBets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                         <p>No bets available.</p>
             <p className="text-sm">Create your first bet!</p>
          </div>
        ) : (
          userBets.map(currentBet => (
            <div
              key={currentBet.id}
              onClick={() => onViewBet(currentBet)}
              className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{currentBet.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(currentBet.status)}`}>
                  {getStatusIcon(currentBet.status)}
                  <span>{getStatusText(currentBet.status)}</span>
                </span>
              </div>
              
                             <p className="text-gray-600 text-sm mb-3">{currentBet.description || 'No description'}</p>
              
              {currentBet.chatMessages && currentBet.chatMessages.length > 0 && (
                <div className="mb-3 p-2 bg-purple-50 rounded-lg border-l-2 border-purple-300">
                  <div className="flex items-center space-x-2 mb-1">
                    <MessageCircle size={12} className="text-purple-500" />
                                         <span className="text-xs text-purple-600 font-medium">Last message:</span>
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
                      <MessageCircle size={14} className="text-purple-500" />
                      <span className="text-purple-600 text-xs font-medium">
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HomeView; 