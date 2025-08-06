import React from 'react';
import { ArrowLeft, Camera, Wallet, Share2, Users, User, Copy, Trash2 } from 'lucide-react';
import { getUserName, getFriends } from '../utils.js';

function ProfileView({ currentUser, users, userProfiles, inviteLinks, onBack, onUploadPhoto, onGenerateInvite, onCopyInvite, onRemoveFriend }) {
  const friends = getFriends(currentUser.id, users);
  const currentProfilePhoto = userProfiles[currentUser.id];
  const currentInviteLink = inviteLinks[currentUser.id];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="text-white hover:text-purple-100"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Profil</h1>
            <p className="text-purple-100 text-sm">{currentUser.username}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Photo Section */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Camera size={20} className="mr-2" />
            Profilbild
          </h2>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              {currentProfilePhoto ? (
                <img 
                  src={currentProfilePhoto} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-purple-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-200">
                  <User size={32} className="text-purple-400" />
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
              <label
                htmlFor="profile-photo-input"
                className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors cursor-pointer inline-block"
              >
                Foto hochladen
              </label>
              <p className="text-sm text-gray-500 mt-1">
                {currentProfilePhoto ? 'Foto aktualisieren' : 'Noch kein Foto'}
              </p>
            </div>
          </div>
        </div>

        {/* Token Wallet Section */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Wallet size={20} className="mr-2" />
            Token Wallet
          </h2>
          
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Aktueller Kontostand</p>
                <p className="text-3xl font-bold">{currentUser.tokens} 🪙</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Status</p>
                <p className="text-lg font-semibold">
                  {currentUser.tokens > 500 ? '💰 Reich' : currentUser.tokens > 100 ? '💪 Gut' : '⚠️ Niedrig'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Aktive Wetten</p>
              <p className="text-xl font-bold text-gray-800">
                {users.filter(user => user.id === currentUser.id)[0]?.friends?.length || 0}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Freunde</p>
              <p className="text-xl font-bold text-gray-800">
                {friends.length}
              </p>
            </div>
          </div>
        </div>

        {/* Invite Link Section */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Share2 size={20} className="mr-2" />
            Freunde einladen
          </h2>
          
          <div className="space-y-3">
            {currentInviteLink ? (
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-sm text-purple-600 font-medium mb-2">Dein Einladungslink:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={currentInviteLink}
                    readOnly
                    className="flex-1 p-2 border rounded text-sm bg-white"
                  />
                  <button
                    onClick={() => onCopyInvite(currentInviteLink)}
                    className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600 transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onGenerateInvite(currentUser.id)}
                className="w-full bg-purple-500 text-white p-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Share2 size={20} />
                <span>Einladungslink erstellen</span>
              </button>
            )}
            
            <p className="text-sm text-gray-500">
              Teile diesen Link mit deinen Freunden, um sie direkt zu deiner Freundesliste hinzuzufügen.
            </p>
          </div>
        </div>

        {/* Friends List Section */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Users size={20} className="mr-2" />
            Meine Freunde ({friends.length})
          </h2>
          
          {friends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>Noch keine Freunde</p>
              <p className="text-sm">Erstelle einen Einladungslink um Freunde hinzuzufügen!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map(friend => (
                <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {userProfiles[friend.id] ? (
                      <img 
                        src={userProfiles[friend.id]} 
                        alt={friend.username} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <User size={20} className="text-purple-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{friend.username}</p>
                      <p className="text-sm text-gray-500">💰 {friend.tokens} Tokens</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onRemoveFriend(currentUser.id, friend.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Freund entfernen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileView; 