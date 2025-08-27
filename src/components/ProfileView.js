import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Wallet, Share2, Users, User, Copy, Trash2, Target } from 'lucide-react';
import { getFriends } from '../utils.js';

function ProfileView({ currentUser, users, bets, userProfiles, inviteLinks, onBack, onUploadPhoto, onGenerateInviteLink, onCopyInviteLink, onRemoveFriend, onViewTokenHistory, onViewCredibility, onRestoreDemoFriendships, onClearUserFriends }) {
  const friends = getFriends(currentUser.id, users);
  const currentProfilePhoto = userProfiles[currentUser.id];
  const currentInviteLink = inviteLinks[currentUser.id];

  // Calculate active bets for current user
  const activeBets = bets ? bets.filter(bet => 
    bet.participants.includes(currentUser.id) && bet.status === 'active'
  ).length : 0;

  return (
    <motion.div className="max-w-md mx-auto bg-white min-h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="bg-primary-500 text-white p-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="text-white hover:text-primary-100"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-primary-100 text-sm">{currentUser.username}</p>
          </div>
        </div>
      </div>

      <div className="p-6 pb-20 space-y-6">
        {/* Profile Photo Section */}
        <motion.div className="bg-white border rounded-xl p-6 shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                      <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Camera size={20} className="mr-2" />
              Profile Photo
            </h2>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              {currentProfilePhoto ? (
                <img 
                  src={currentProfilePhoto} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                  <User size={32} className="text-primary-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    onUploadPhoto(currentUser.id, file);
                  }
                }}
                className="hidden"
                id="profile-photo-input"
              />
              <motion.label
                htmlFor="profile-photo-input"
                className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors cursor-pointer inline-block"
                whileTap={{ scale: 0.98 }}
              >
                Upload Photo
              </motion.label>
                              <p className="text-sm text-gray-500 mt-1">
                  {currentProfilePhoto ? 'Update photo' : 'No photo yet'}
                </p>
            </div>
          </div>
        </motion.div>

        {/* Token Wallet Section */}
        <motion.div className="bg-white border rounded-xl p-6 shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.05 }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Wallet size={20} className="mr-2" />
            Token Wallet
          </h2>
          
          <motion.button
            onClick={onViewTokenHistory}
            className="w-full bg-accent-500 rounded-lg p-4 text-white hover:bg-accent-600 transition-colors cursor-pointer"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Current Balance</p>
                <p className="text-3xl font-bold">{currentUser.tokens} 💰</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Status</p>
                <p className="text-lg font-semibold">
                  {currentUser.tokens > 500 ? '💰 Rich' : currentUser.tokens > 100 ? '💪 Good' : '⚠️ Low'}
                </p>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs opacity-75">Click to view token history</p>
            </div>
          </motion.button>
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Active Bets</p>
              <p className="text-xl font-bold text-gray-800">
                {activeBets}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Friends</p>
              <p className="text-xl font-bold text-gray-800">
                {friends.length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Credibility Stats Section */}
        <motion.div className="bg-white border rounded-xl p-6 shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Target size={20} className="mr-2" />
            Credibility Stats
          </h2>
          
          <motion.button
            onClick={onViewCredibility}
            className="w-full bg-secondary-500 rounded-lg p-4 text-white hover:bg-secondary-600 transition-colors cursor-pointer"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Current Score</p>
                <p className="text-3xl font-bold">{currentUser.credibility || 100}/100</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Status</p>
                <p className="text-lg font-semibold">
                  {currentUser.credibility >= 80 ? '🎯 Excellent' : 
                   currentUser.credibility >= 60 ? '🎯 Good' : 
                   currentUser.credibility >= 40 ? '🎯 Fair' : '🎯 Poor'}
                </p>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs opacity-75">Click to view credibility history</p>
            </div>
          </motion.button>
          

        </motion.div>

        {/* Invite Link Section */}
        <motion.div className="bg-white border rounded-xl p-6 shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.15 }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Share2 size={20} className="mr-2" />
                          Invite Friends
          </h2>
          
          <div className="space-y-3">
            {currentInviteLink ? (
                          <div className="bg-primary-50 rounded-lg p-3">
              <p className="text-sm text-primary-600 font-medium mb-2">Your invitation link:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={currentInviteLink}
                    readOnly
                    className="flex-1 p-2 border rounded text-sm bg-white"
                  />
                  <motion.button
                    onClick={() => onCopyInviteLink(currentInviteLink)}
                    className="bg-primary-500 text-white p-2 rounded hover:bg-primary-600 transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Copy size={16} />
                  </motion.button>
                </div>
              </div>
            ) : (
              <motion.button
                onClick={() => onGenerateInviteLink(currentUser.id)}
                className="w-full bg-primary-500 text-white p-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
                whileTap={{ scale: 0.98 }}
              >
                <Share2 size={20} />
                <span>Create Invitation Link</span>
              </motion.button>
            )}
            
            <p className="text-sm text-gray-500">
              Share this link with your friends. When they visit it, they'll automatically be added to your friends list!
            </p>
          </div>
        </motion.div>

        {/* Friends List Section */}
        <motion.div className="bg-white border rounded-xl p-6 shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.2 }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Users size={20} className="mr-2" />
            My Friends ({friends.length})
          </h2>
          
          {/* 🎯 PRODUCTION READY: Test Mode for Friend Addition System */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">🧪 Test Friend Addition System</h3>
            <p className="text-xs text-yellow-700 mb-3">
              Test the automatic friend addition system for production deployment
            </p>
            <div className="space-y-2">
              <button
                onClick={() => onClearUserFriends(currentUser.id)}
                className="w-full text-xs bg-red-100 text-red-800 px-2 py-1 rounded border border-red-300 hover:bg-red-200 transition-colors"
              >
                🧹 Clear ALL My Friends (Test Mode)
              </button>
              <button
                onClick={() => onRestoreDemoFriendships()}
                className="w-full text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-300 hover:bg-green-200 transition-colors"
              >
                🔄 Restore All Demo Friendships
              </button>
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                <strong>Production Test:</strong> Clear friends → Generate invite link → Visit link with different user → Should automatically become friends!
              </div>
            </div>
          </div>
          
          {friends.length === 0 ? (
            <motion.div className="text-center py-8 text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>No friends yet</p>
              <p className="text-sm">Create an invitation link to add friends!</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
              {friends.map((friend, idx) => (
                <motion.div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, delay: idx * 0.03 }}
                >
                  <div className="flex items-center space-x-3">
                    {userProfiles[friend.id] ? (
                      <img 
                        src={userProfiles[friend.id]} 
                        alt={friend.username} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User size={20} className="text-primary-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{friend.username}</p>
                      <p className="text-sm text-gray-500">💰 {friend.tokens} Tokens</p>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={() => onRemoveFriend(currentUser.id, friend.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Remove friend"
                    whileTap={{ scale: 0.96 }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ProfileView; 