import React from 'react';
import { ArrowLeft, Users, Check, X } from 'lucide-react';
import { getUserName } from '../utils.js';

function InvitationsView({ currentUser, invitations, bets, users, onBack, onRespond }) {
  const getBetTitle = (betId) => {
    const bet = bets.find(b => b.id === betId);
    return bet ? bet.title : 'Unbekannte Wette';
  };

  const getBetDetails = (betId) => {
    const bet = bets.find(b => b.id === betId);
    if (!bet) return null;
    
    return {
      title: bet.title,
      description: bet.description,
      stakeTokens: bet.stakeTokens,
      outcomes: bet.outcomes
    };
  };

  if (invitations.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="text-white hover:text-orange-100"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Einladungen</h1>
              <p className="text-orange-100 text-sm">Keine neuen Einladungen</p>
            </div>
          </div>
        </div>

        <div className="p-6 text-center">
          <Users size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Keine Einladungen</h2>
          <p className="text-gray-600">Du hast keine ausstehenden Einladungen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="text-white hover:text-orange-100"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Einladungen</h1>
            <p className="text-orange-100 text-sm">{invitations.length} ausstehend</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {invitations.map(invitation => {
          const betDetails = getBetDetails(invitation.betId);
          const creatorName = getUserName(invitation.fromUserId, users);
          
          if (!betDetails) return null;

          return (
            <div key={invitation.id} className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{betDetails.title}</h3>
                  <p className="text-sm text-gray-500">von {creatorName}</p>
                </div>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  Neu
                </span>
              </div>

              {betDetails.description && (
                <p className="text-gray-600 text-sm mb-3">{betDetails.description}</p>
              )}

                             <div className="bg-gray-50 rounded-lg p-3 mb-4">
                 <div className="text-sm">
                   <p className="text-gray-500">Token-Einsatz:</p>
                   <p className="font-medium">💰 {betDetails.stakeTokens}</p>
                 </div>
               </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Mögliche Ergebnisse:</p>
                <div className="space-y-1">
                  {betDetails.outcomes.map((outcome, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded">
                      {outcome}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => onRespond(invitation.id, 'accepted')}
                  className="flex-1 bg-green-500 text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Check size={20} />
                  <span>Annehmen</span>
                </button>
                <button
                  onClick={() => onRespond(invitation.id, 'declined')}
                  className="flex-1 bg-red-500 text-white p-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <X size={20} />
                  <span>Ablehnen</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InvitationsView; 