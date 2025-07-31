import React, { useState, useEffect } from 'react';
import { Plus, Users, Clock, Trophy, Vote, ArrowLeft, Check, UserPlus, Link, Copy } from 'lucide-react';

export default function BetMeApp() {
  const [currentView, setCurrentView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [bets, setBets] = useState([]);
  const [selectedBet, setSelectedBet] = useState(null);
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [selectedInvitation, setSelectedInvitation] = useState(null);

  // Initialisierung
  useEffect(() => {
    // Demo-User laden - alle mit allen befreundet
    const demoUsers = [
      { id: 1, username: 'Maxim', email: 'maxim@example.com', friends: [2, 3, 4, 5, 6, 7, 8, 9], tokens: 1000 },
      { id: 2, username: 'Moritz', email: 'moritz@example.com', friends: [1, 3, 4, 5, 6, 7, 8, 9], tokens: 1000 },
      { id: 3, username: 'Dominik', email: 'dominik@example.com', friends: [1, 2, 4, 5, 6, 7, 8, 9], tokens: 1000 },
      { id: 4, username: 'Niko', email: 'niko@example.com', friends: [1, 2, 3, 5, 6, 7, 8, 9], tokens: 1000 },
      { id: 5, username: 'Alex', email: 'alex@example.com', friends: [1, 2, 3, 4, 6, 7, 8, 9], tokens: 1000 },
      { id: 6, username: 'Eddy', email: 'eddy@example.com', friends: [1, 2, 3, 4, 5, 7, 8, 9], tokens: 1000 },
      { id: 7, username: 'Patrick', email: 'patrick@example.com', friends: [1, 2, 3, 4, 5, 6, 8, 9], tokens: 1000 },
      { id: 8, username: 'Human', email: 'human@example.com', friends: [1, 2, 3, 4, 5, 6, 7, 9], tokens: 1000 },
      { id: 9, username: 'Vess', email: 'vess@example.com', friends: [1, 2, 3, 4, 5, 6, 7, 8], tokens: 1000 }
    ];
    
    setUsers(demoUsers);
    
    // User-Tokens aus localStorage laden (falls vorhanden)
    const savedTokens = localStorage.getItem('betme-user-tokens');
    if (savedTokens) {
      const tokenData = JSON.parse(savedTokens);
      const updatedUsers = demoUsers.map(user => ({
        ...user,
        tokens: tokenData[user.id] || 1000
      }));
      setUsers(updatedUsers);
    }
    
    // Einladungen laden
    const savedInvitations = localStorage.getItem('betme-invitations');
    if (savedInvitations) {
      setInvitations(JSON.parse(savedInvitations));
    }
    
    // Demo-Wetten laden
    const savedBets = localStorage.getItem('betme-bets');
    if (savedBets) {
      setBets(JSON.parse(savedBets));
    } else {
      const demoBets = [
        {
          id: 1,
          title: "Bayern gewinnt gegen Dortmund",
          description: "Klassiker im deutschen Fußball",
          stake: "20€",
          creatorId: 1,
          participants: [1, 2, 3],
          outcomes: ["Bayern gewinnt", "Dortmund gewinnt", "Unentschieden"],
          stakeTokens: 50,
          status: "active",
          votes: {},
          winner: null,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: "Wer schafft 100 Liegestütze?",
          description: "Fitness-Challenge unter Freunden",
          stake: "Pizza",
          creatorId: 5,
          participants: [5, 6, 7],
          outcomes: ["Niemand schafft es", "Einer schafft es", "Mehrere schaffen es"],
          stakeTokens: 30,
          status: "voting",
          votes: {},
          winner: null,
          createdAt: new Date().toISOString()
        }
      ];
      setBets(demoBets);
      localStorage.setItem('betme-bets', JSON.stringify(demoBets));
    }
  }, []);

  // Speichern bei Änderungen
  useEffect(() => {
    if (bets.length > 0) {
      localStorage.setItem('betme-bets', JSON.stringify(bets));
    }
  }, [bets]);

  useEffect(() => {
    localStorage.setItem('betme-invitations', JSON.stringify(invitations));
  }, [invitations]);

  // Token-System speichern
  useEffect(() => {
    const tokenData = {};
    users.forEach(user => {
      tokenData[user.id] = user.tokens;
    });
    localStorage.setItem('betme-user-tokens', JSON.stringify(tokenData));
  }, [users]);

  // Login
  const handleLogin = (username) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setCurrentView('home');
    }
  };

  // User-Hilfsfunktionen
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unbekannt';
  };

  const getUserTokens = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.tokens : 0;
  };

  const updateUserTokens = (userId, newTokens) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, tokens: newTokens } : user
    ));
    
    // Aktuellen User auch updaten falls betroffen
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, tokens: newTokens }));
    }
  };

  const getFriends = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return [];
    return user.friends.map(friendId => users.find(u => u.id === friendId)).filter(Boolean);
  };

  const createBet = (betData) => {
    // Prüfen ob User genug Tokens hat
    const stakeTokens = parseInt(betData.stakeTokens) || 0;
    if (stakeTokens > currentUser.tokens) {
      alert('Nicht genug Tokens für diesen Einsatz!');
      return;
    }

    const newBet = {
      id: Date.now(),
      ...betData,
      creatorId: currentUser.id,
      participants: [currentUser.id],
      participantBets: {}, // Hier speichern wir wer auf was gesetzt hat
      status: 'active',
      votes: {},
      winner: null,
      createdAt: new Date().toISOString(),
      stakeTokens: stakeTokens
    };
    
    // Creator muss auch Outcome wählen
    setBets([newBet, ...bets]);
    setSelectedBet(newBet);
    setCurrentView('chooseOutcome');
    
    // Einladungen für ausgewählte Freunde erstellen
    const newInvitations = betData.participants.map(friendId => ({
      id: Date.now() + friendId,
      betId: newBet.id,
      fromUserId: currentUser.id,
      toUserId: friendId,
      status: 'pending',
      createdAt: new Date().toISOString()
    }));
    
    setInvitations([...invitations, ...newInvitations]);
  };

  const joinBetByLink = (betId) => {
    const bet = bets.find(b => b.id === parseInt(betId) && b.status === 'active');
    if (bet && !bet.participants.includes(currentUser.id) && bet.creatorId !== currentUser.id) {
      const newInvitation = {
        id: Date.now(),
        betId: bet.id,
        fromUserId: bet.creatorId,
        toUserId: currentUser.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
        viaLink: true
      };
      
      const existingInvitation = invitations.find(inv => 
        inv.betId === bet.id && inv.toUserId === currentUser.id
      );
      
      if (!existingInvitation) {
        setInvitations([...invitations, newInvitation]);
        return true;
      }
    }
    return false;
  };

  // Link-Parameter beim App-Start prüfen
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const betId = urlParams.get('bet');
    if (betId && currentUser) {
      const success = joinBetByLink(betId);
      if (success) {
        setCurrentView('invitations');
      }
      // URL Parameter entfernen
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [currentUser, bets, invitations]);

  const respondToInvitation = (invitationId, response) => {
    const invitation = invitations.find(inv => inv.id === invitationId);
    
    if (response === 'accepted' && invitation) {
      const bet = bets.find(b => b.id === invitation.betId);
      if (bet) {
        // Prüfen ob User genug Tokens hat
        if (bet.stakeTokens > currentUser.tokens) {
          alert('Nicht genug Tokens für diese Wette!');
          return;
        }
        
        // User muss Outcome wählen beim Beitreten
        setCurrentView('chooseOutcome');
        setSelectedBet(bet);
        setSelectedInvitation(invitation);
        return;
      }
    }

    setInvitations(prev => prev.map(inv => 
      inv.id === invitationId 
        ? { ...inv, status: response }
        : inv
    ));
  };

  const inviteUserToBet = (betId, userId) => {
    // Prüfen ob User bereits Teilnehmer oder schon eingeladen
    const bet = bets.find(b => b.id === betId);
    const existingInvitation = invitations.find(inv => 
      inv.betId === betId && inv.toUserId === userId
    );
    
    if (bet && !bet.participants.includes(userId) && !existingInvitation) {
      const newInvitation = {
        id: Date.now() + userId,
        betId: betId,
        fromUserId: currentUser.id,
        toUserId: userId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      setInvitations([...invitations, newInvitation]);
      return true;
    }
    return false;
  };

  const getPendingInvitations = (userId) => {
    return invitations.filter(inv => 
      inv.toUserId === userId && inv.status === 'pending'
    );
  };

  const startVoting = (betId) => {
    setBets(prevBets => prevBets.map(currentBet => 
      currentBet.id === betId ? { ...currentBet, status: 'voting' } : currentBet
    ));
    
    const updatedBet = bets.find(b => b.id === betId);
    if (updatedBet) {
      setSelectedBet({ ...updatedBet, status: 'voting' });
    }
  };

  const voteForWinner = (betId, winner, voterName) => {
    setBets(prevBets => prevBets.map(currentBet => {
      if (currentBet.id === betId) {
        const newVotes = { ...currentBet.votes, [voterName]: winner };
        const voteCount = Object.values(newVotes).filter(vote => vote === winner).length;
        const totalVotes = Object.keys(newVotes).length;
        const participantCount = currentBet.participants.length;
        
        let hasWon = false;
        if (participantCount === 2) {
          hasWon = totalVotes === 2 && voteCount >= 1;
        } else {
          const majority = Math.floor(participantCount / 2) + 1;
          hasWon = voteCount >= majority;
        }
        
        if (hasWon) {
          // Token-Belohnung berechnen - BASIEREND AUF WETTEN, NICHT VOTES!
          const totalStake = currentBet.stakeTokens * currentBet.participants.length;
          const appFee = Math.floor(totalStake * 0.03);
          const winnersReward = totalStake - appFee;
          
          const finishedBet = { ...currentBet, votes: newVotes, winner, status: 'finished' };
          setSelectedBet(finishedBet);
          
          // Belohnung an WETTER (nicht Voter) verteilen
          setTimeout(() => {
            // Wer hat auf das Gewinner-Outcome GEWETTET?
            const winningBettors = Object.entries(currentBet.participantBets || {})
              .filter(([userId, bet]) => bet === winner)
              .map(([userId]) => parseInt(userId));
            
            if (winningBettors.length > 0) {
              const rewardPerWinner = Math.floor(winnersReward / winningBettors.length);
              
              winningBettors.forEach(userId => {
                updateUserTokens(userId, getUserTokens(userId) + rewardPerWinner);
              });
            }
          }, 100);
          
          return finishedBet;
        }
        
        if (participantCount === 2 && totalVotes === 2) {
          const outcomes = Object.values(newVotes);
          const uniqueOutcomes = [...new Set(outcomes)];
          if (uniqueOutcomes.length === 2) {
            const tieBet = { ...currentBet, votes: newVotes, winner: 'Unentschieden', status: 'finished' };
            setSelectedBet(tieBet);
            return tieBet;
          }
        }
        
        const votingBet = { ...currentBet, votes: newVotes };
        setSelectedBet(votingBet);
        return votingBet;
      }
      return currentBet;
    }));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'voting': return 'bg-yellow-100 text-yellow-800';
      case 'finished': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Aktiv';
      case 'voting': return 'Abstimmung';
      case 'finished': return 'Beendet';
      default: return 'Unbekannt';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <Clock size={16} />;
      case 'voting': return <Vote size={16} />;
      case 'finished': return <Trophy size={16} />;
      default: return <Clock size={16} />;
    }
  };

  // LOGIN SCREEN
  if (currentView === 'login') {
    return <LoginView users={users} onLogin={handleLogin} />;
  }

  // HAUPTSEITE
  if (currentView === 'home') {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Bet Me If You Can</h1>
              <p className="text-blue-100 text-sm">Hey {currentUser.username}! 👋</p>
              <p className="text-blue-200 text-xs">💰 {currentUser.tokens} Tokens</p>
            </div>
            <button 
              onClick={() => {setCurrentUser(null); setCurrentView('login');}}
              className="text-blue-100 hover:text-white text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <button
            onClick={() => setCurrentView('create')}
            className="w-full bg-green-500 text-white p-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors"
          >
            <Plus size={24} />
            <span>Neue Wette erstellen</span>
          </button>

          {getPendingInvitations(currentUser.id).length > 0 && (
            <button
              onClick={() => setCurrentView('invitations')}
              className="w-full bg-orange-500 text-white p-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-orange-600 transition-colors relative"
            >
              <Users size={24} />
              <span>Einladungen ({getPendingInvitations(currentUser.id).length})</span>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {getPendingInvitations(currentUser.id).length}
              </span>
            </button>
          )}
        </div>

        <div className="px-4 pb-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Deine Wetten</h2>
          
          {bets.filter(bet => bet.participants.includes(currentUser.id)).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Trophy size={48} className="mx-auto mb-4 opacity-50" />
              <p>Keine Wetten vorhanden.</p>
              <p className="text-sm">Erstelle deine erste Wette!</p>
            </div>
          ) : (
            bets.filter(bet => bet.participants.includes(currentUser.id)).map(currentBet => (
              <div
                key={currentBet.id}
                onClick={() => {
                  setSelectedBet(currentBet);
                  setCurrentView('detail');
                }}
                className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{currentBet.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(currentBet.status)}`}>
                    {getStatusIcon(currentBet.status)}
                    <span>{getStatusText(currentBet.status)}</span>
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{currentBet.description || 'Keine Beschreibung'}</p>
                
                {/* Creator Info in Karte */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <span>👑</span>
                    <span>von {getUserName(currentBet.creatorId)}</span>
                    {currentBet.creatorId === currentUser.id && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-1">Du</span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Users size={16} />
                    <span>{currentBet.participants.length} Teilnehmer</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      Pot: {currentBet.stakeTokens * currentBet.participants.length} 🪙
                    </div>
                    <div className="text-xs text-gray-500">Einsatz: {currentBet.stakeTokens} 🪙</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // WETTE ERSTELLEN
  if (currentView === 'create') {
    return <CreateBetView 
      currentUser={currentUser} 
      friends={getFriends(currentUser.id)} 
      onBack={() => setCurrentView('home')} 
      onSubmit={createBet} 
    />;
  }

  // EINLADUNGEN ANSEHEN
  if (currentView === 'invitations') {
    return <InvitationsView 
      currentUser={currentUser}
      invitations={getPendingInvitations(currentUser.id)}
      bets={bets}
      getUserName={getUserName}
      onBack={() => setCurrentView('home')}
      onRespond={respondToInvitation}
    />;
  }

  // JOIN BY CODE entfernen
  
  // OUTCOME WÄHLEN
  if (currentView === 'chooseOutcome' && selectedBet) {
    return <ChooseOutcomeView 
      bet={selectedBet}
      currentUser={currentUser}
      invitation={selectedInvitation}
      onOutcomeChosen={(outcome) => {
        // Tokens abziehen
        updateUserTokens(currentUser.id, currentUser.tokens - selectedBet.stakeTokens);
        
        // User zur Wette hinzufügen mit seinem gewählten Outcome
        setBets(prev => prev.map(b => 
          b.id === selectedBet.id 
            ? { 
                ...b, 
                // Nur hinzufügen wenn noch nicht dabei (verhindert Duplikate)
                participants: b.participants.includes(currentUser.id) 
                  ? b.participants 
                  : [...b.participants, currentUser.id],
                participantBets: {
                  ...b.participantBets,
                  [currentUser.id]: outcome
                }
              }
            : b
        ));
        
        // Einladung als akzeptiert markieren falls vorhanden
        if (selectedInvitation) {
          setInvitations(prev => prev.map(inv => 
            inv.id === selectedInvitation.id 
              ? { ...inv, status: 'accepted' }
              : inv
          ));
        }
        
        setSelectedInvitation(null);
        setCurrentView('home');
      }}
      onBack={() => setCurrentView('home')}
    />;
  }

  // WETTE DETAIL - KOMPLETT NEU
  if (currentView === 'detail' && selectedBet) {
    const inviteUser = (userId) => {
      // Prüfen ob bereits eingeladen
      const existingInvitation = invitations.find(inv => 
        inv.betId === selectedBet.id && inv.toUserId === userId && inv.status === 'pending'
      );
      
      if (existingInvitation) {
        alert('User ist bereits eingeladen!');
        return;
      }

      const newInvitation = {
        id: Date.now() + userId,
        betId: selectedBet.id,
        fromUserId: currentUser.id,
        toUserId: userId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      setInvitations([...invitations, newInvitation]);
      alert(`${getUserName(userId)} wurde eingeladen!`);
    };

    const isUserInvited = (userId) => {
      return invitations.some(inv => 
        inv.betId === selectedBet.id && 
        inv.toUserId === userId && 
        inv.status === 'pending'
      );
    };

    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center">
          <button onClick={() => setCurrentView('home')} className="mr-3">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Wetten-Details</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* Wetten Info */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h2 className="text-xl font-bold mb-2">{selectedBet.title}</h2>
            <p className="text-gray-600 mb-4">{selectedBet.description || 'Keine weitere Beschreibung'}</p>
            
            {/* Creator Info */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 font-medium">👑 Erstellt von:</span>
                <span className="font-semibold text-blue-800">{getUserName(selectedBet.creatorId)}</span>
                {selectedBet.creatorId === currentUser.id && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Du</span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Pot:</span>
                <div className="font-semibold text-green-600">
                  {selectedBet.stakeTokens * selectedBet.participants.length} 🪙
                </div>
              </div>
              <div>
                <span className="text-gray-500">Einsatz:</span>
                <div className="font-semibold">{selectedBet.stakeTokens} 🪙</div>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <div className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Clock size={16} />
                  <span>Aktiv</span>
                </div>
              </div>
            </div>
          </div>

          {/* FREUNDE EINLADEN - DIREKT HIER */}
          {selectedBet.status === 'active' && selectedBet.creatorId === currentUser.id && (
            <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500">
              <h3 className="text-lg font-semibold mb-3">👥 Weitere Freunde einladen</h3>
              
              <div className="space-y-2">
                {users
                  .filter(user => 
                    user.id !== currentUser.id && 
                    !selectedBet.participants.includes(user.id)
                  )
                  .map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <span className="font-medium">{user.username}</span>
                        {isUserInvited(user.id) && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                            Eingeladen
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => inviteUser(user.id)}
                        disabled={isUserInvited(user.id)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                          isUserInvited(user.id) 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {isUserInvited(user.id) ? 'Eingeladen' : 'Einladen'}
                      </button>
                    </div>
                  ))}
              </div>
              
              {users.filter(user => user.id !== currentUser.id && !selectedBet.participants.includes(user.id)).length === 0 && (
                <p className="text-gray-500 text-center py-4">Alle Freunde sind bereits dabei</p>
              )}
            </div>
          )}

          {/* Link teilen */}
          <div className="bg-blue-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Link size={20} className="mr-2" />
              Wette teilen
            </h3>
            
            <button
              onClick={() => {
                const shareUrl = `${window.location.origin}${window.location.pathname}?bet=${selectedBet.id}`;
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(shareUrl);
                  alert('🔗 Link kopiert!');
                }
              }}
              className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Link size={16} />
              <span>Link teilen</span>
            </button>
          </div>

          {/* Outcomes mit Wetten */}
          <div>
            <h3 className="text-lg font-semibold mb-3">💰 Wer setzt worauf?</h3>
            <div className="space-y-2">
              {selectedBet.outcomes?.map((outcome, index) => {
                const bettorsForOutcome = Object.entries(selectedBet.participantBets || {})
                  .filter(([userId, bet]) => bet === outcome)
                  .map(([userId]) => parseInt(userId));
                
                return (
                  <div key={outcome} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{outcome}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                        {bettorsForOutcome.length} Wetter
                      </span>
                    </div>
                    {bettorsForOutcome.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        {bettorsForOutcome.map(userId => getUserName(userId)).join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teilnehmer */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Teilnehmer</h3>
            <div className="space-y-2">
              {selectedBet.participants.map(userId => {
                const user = users.find(u => u.id === userId);
                return (
                  <div key={userId} className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{user?.username || 'Unbekannt'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Abstimmung starten */}
          {selectedBet.status === 'active' && selectedBet.creatorId === currentUser.id && (
            <button
              onClick={() => {
                // Wette auf "voting" setzen
                setBets(prevBets => prevBets.map(bet => 
                  bet.id === selectedBet.id ? { ...bet, status: 'voting' } : bet
                ));
                // selectedBet auch updaten für sofortige UI-Aktualisierung
                setSelectedBet({ ...selectedBet, status: 'voting' });
                alert('Abstimmung gestartet! Alle Teilnehmer können jetzt abstimmen.');
              }}
              className="w-full bg-yellow-500 text-white p-4 rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
            >
              Abstimmung starten
            </button>
          )}

          {/* VOTING INTERFACE */}
          {selectedBet.status === 'voting' && (
            <div className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-500">
              <h3 className="text-lg font-semibold mb-3">🗳️ Abstimmung läuft</h3>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📊 Abstimmungsregeln</h4>
                {selectedBet.participants.length === 2 ? (
                  <p className="text-blue-700 text-sm">
                    Beide Teilnehmer müssen abstimmen. Bei unterschiedlichen Stimmen gibt es ein Unentschieden.
                  </p>
                ) : (
                  <p className="text-blue-700 text-sm">
                    Absolute Mehrheit nötig: {Math.floor(selectedBet.participants.length / 2) + 1} von {selectedBet.participants.length} Stimmen
                  </p>
                )}
                <div className="text-center text-sm text-gray-600 mt-2">
                  Bereits abgestimmt: {Object.keys(selectedBet.votes || {}).length} von {selectedBet.participants.length}
                </div>
              </div>

              {/* VOTING ERGEBNISSE ANZEIGEN */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">🗳️ Bisherige Stimmen</h4>
                
                {Object.keys(selectedBet.votes || {}).length === 0 ? (
                  <p className="text-gray-500 text-center py-2">Noch keine Stimmen abgegeben</p>
                ) : (
                  <div className="space-y-2">
                    {/* Alle abgegebenen Votes anzeigen, auch wenn Outcome nicht in der Liste */}
                    {Object.entries(selectedBet.votes || {}).map(([voter, vote]) => (
                      <div key={`${voter}-${vote}`} className="flex justify-between items-center p-2 bg-white rounded border-l-4 border-blue-400">
                        <div>
                          <span className="font-medium text-gray-800">{vote}</span>
                          <div className="text-xs text-gray-600">
                            {voter}
                          </div>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                          1 Stimme
                        </span>
                      </div>
                    ))}
                    
                    {/* Gruppiert nach Outcomes */}
                    <div className="mt-3 pt-3 border-t">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Gruppiert:</h5>
                      {(() => {
                        const voteGroups = {};
                        Object.entries(selectedBet.votes || {}).forEach(([voter, vote]) => {
                          if (!voteGroups[vote]) voteGroups[vote] = [];
                          voteGroups[vote].push(voter);
                        });
                        
                        return Object.entries(voteGroups).map(([outcome, voters]) => (
                          <div key={outcome} className="flex justify-between items-center p-2 bg-blue-50 rounded mb-1">
                            <div>
                              <span className="font-medium text-gray-800">"{outcome}"</span>
                              <div className="text-xs text-gray-600">
                                {voters.join(', ')}
                              </div>
                            </div>
                            <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded-full text-xs font-semibold">
                              {voters.length} Stimme(n)
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {!Object.keys(selectedBet.votes || {}).includes(currentUser.username) ? (
                <VotingComponent
                  bet={selectedBet}
                  currentUser={currentUser}
                  onVote={voteForWinner}
                />
              ) : (
                <div className="text-center p-3 bg-green-100 text-green-800 rounded-lg">
                  ✅ Du hast bereits abgestimmt!
                  <div className="text-sm mt-1">
                    Deine Stimme: <strong>{selectedBet.votes[currentUser.username]}</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FINISHED RESULT */}
          {selectedBet.status === 'finished' && selectedBet.winner && (
            <div className="space-y-4">
              {/* Hauptergebnis */}
              <div className="bg-green-50 p-4 rounded-xl text-center border-l-4 border-green-500">
                <Trophy size={48} className="mx-auto mb-3 text-yellow-500" />
                {selectedBet.winner === 'Unentschieden' ? (
                  <>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">🤝 Unentschieden!</h3>
                    <p className="text-gray-700">Die Einsätze gehen zurück an die Teilnehmer.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-green-800 mb-2">🎉 Gewinner-Outcome: {selectedBet.winner}!</h3>
                    <p className="text-green-700">
                      Gewinn pro Gewinner: {(() => {
                        const totalStake = selectedBet.stakeTokens * selectedBet.participants.length;
                        const winnersReward = Math.floor(totalStake * 0.97);
                        const winningBettors = Object.entries(selectedBet.participantBets || {})
                          .filter(([userId, bet]) => bet === selectedBet.winner);
                        return winningBettors.length > 0 ? Math.floor(winnersReward / winningBettors.length) : 0;
                      })()} 🪙
                    </p>
                  </>
                )}
              </div>

              {/* Gewinner und Verlierer Aufschlüsselung - BASIEREND AUF WETTEN */}
              {selectedBet.winner !== 'Unentschieden' && (
                <div className="space-y-3">
                  {/* Gewinner - Wer hat auf das richtige Outcome GEWETTET */}
                  <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      🏆 Gewinner (richtig gewettet)
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(selectedBet.participantBets || {})
                        .filter(([userId, bet]) => bet === selectedBet.winner)
                        .map(([userId, bet]) => {
                          const user = users.find(u => u.id === parseInt(userId));
                          const totalStake = selectedBet.stakeTokens * selectedBet.participants.length;
                          const winnersReward = Math.floor(totalStake * 0.97);
                          const winningBettors = Object.entries(selectedBet.participantBets || {})
                            .filter(([uid, b]) => b === selectedBet.winner);
                          const reward = winningBettors.length > 0 ? Math.floor(winnersReward / winningBettors.length) : 0;
                          
                          return (
                            <div key={userId} className="flex justify-between items-center p-2 bg-green-100 rounded">
                              <span className="font-medium text-green-800">
                                {user?.username || 'Unbekannt'}
                                {parseInt(userId) === currentUser.id && <span className="ml-2 text-xs bg-green-200 px-2 py-1 rounded-full">Du</span>}
                              </span>
                              <div className="text-right">
                                <div className="text-green-700 font-semibold">
                                  +{reward} 🪙
                                </div>
                                <div className="text-xs text-green-600">Gewinn</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Verlierer - Wer hat auf falsche Outcomes GEWETTET */}
                  {Object.entries(selectedBet.participantBets || {}).some(([userId, bet]) => bet !== selectedBet.winner) && (
                    <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500">
                      <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                        😞 Verlierer (falsch gewettet)
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(selectedBet.participantBets || {})
                          .filter(([userId, bet]) => bet !== selectedBet.winner)
                          .map(([userId, bet]) => {
                            const user = users.find(u => u.id === parseInt(userId));
                            return (
                              <div key={userId} className="flex justify-between items-center p-2 bg-red-100 rounded">
                                <div>
                                  <span className="font-medium text-red-800">
                                    {user?.username || 'Unbekannt'}
                                    {parseInt(userId) === currentUser.id && <span className="ml-2 text-xs bg-red-200 px-2 py-1 rounded-full">Du</span>}
                                  </span>
                                  <div className="text-xs text-red-600">Wette: "{bet}"</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-red-700 font-semibold">
                                    -{selectedBet.stakeTokens} 🪙
                                  </div>
                                  <div className="text-xs text-red-600">Verlust</div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// OUTCOME WÄHLEN KOMPONENTE
function ChooseOutcomeView({ bet, currentUser, invitation, onOutcomeChosen, onBack }) {
  const [selectedOutcome, setSelectedOutcome] = useState('');

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 flex items-center">
        <button onClick={onBack} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Outcome wählen</h1>
      </div>

      <div className="p-4 space-y-6">
        <div className="bg-blue-50 p-4 rounded-xl">
          <h2 className="text-xl font-bold mb-2">{bet.title}</h2>
          <p className="text-blue-700 text-sm mb-3">
            Wähle das Outcome auf das du setzen möchtest. Einsatz: {bet.stakeTokens} 🪙
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Worauf möchtest du setzen?</h3>
          <div className="space-y-3">
            {bet.outcomes?.map((outcome) => (
              <label key={outcome} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="outcome"
                  value={outcome}
                  checked={selectedOutcome === outcome}
                  onChange={(e) => setSelectedOutcome(e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">{outcome}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={() => selectedOutcome && onOutcomeChosen(selectedOutcome)}
          disabled={!selectedOutcome}
          className="w-full bg-green-500 text-white p-4 rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Wette platzieren ({bet.stakeTokens} 🪙)
        </button>
      </div>
    </div>
  );
}

// VOTING KOMPONENTE - ZWEI-STUFEN-ABSTIMMUNG
function VotingComponent({ bet, currentUser, onVote }) {
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmVote = () => {
    if (selectedOutcome) {
      onVote(bet.id, selectedOutcome, currentUser.username);
      setSelectedOutcome('');
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    setSelectedOutcome('');
    setIsConfirming(false);
  };

  return (
    <div className="space-y-4">
      {/* Schritt 1: Outcome auswählen */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          1. Welches Ergebnis ist eingetreten?
        </label>
        <select
          value={selectedOutcome}
          onChange={(e) => setSelectedOutcome(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isConfirming}
        >
          <option value="">Ergebnis wählen</option>
          {bet.outcomes?.map(outcome => (
            <option key={outcome} value={outcome}>{outcome}</option>
          ))}
        </select>
      </div>

      {/* Schritt 2: Bestätigung */}
      {selectedOutcome && (
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h4 className="font-semibold text-orange-800 mb-2">2. Stimme bestätigen</h4>
          <p className="text-orange-700 text-sm mb-3">
            Du stimmst für: <strong>"{selectedOutcome}"</strong>
          </p>
          <p className="text-orange-600 text-xs mb-4">
            ⚠️ Nach der Bestätigung kannst du deine Stimme nicht mehr ändern!
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={handleConfirmVote}
              className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              ✅ Stimme bestätigen
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              ❌ Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LoginView({ users, onLogin }) {
  const [username, setUsername] = useState('');

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
      <div className="w-full p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bet Me If You Can</h1>
          <p className="text-gray-600">Wähle deinen Account</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <select
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Wähle einen Account</option>
              {users.map(user => (
                <option key={user.id} value={user.username}>{user.username}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => username && onLogin(username)}
            disabled={!username}
            className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-300"
          >
            Einloggen
          </button>

          <div className="text-center text-xs text-gray-500 mt-4">
            Demo-Accounts: Maxim, Moritz, Dominik, Niko, Alex, Eddy, Patrick, Human, Vess
          </div>
        </div>
      </div>
    </div>
  );
}

function InvitationsView({ currentUser, invitations, bets, getUserName, onBack, onRespond }) {
  const getBetTitle = (betId) => {
    const bet = bets.find(b => b.id === betId);
    return bet ? bet.title : 'Unbekannte Wette';
  };

  const getBetDetails = (betId) => {
    const bet = bets.find(b => b.id === betId);
    return bet ? { 
      stakeTokens: bet.stakeTokens, 
      pot: bet.stakeTokens * bet.participants.length 
    } : { stakeTokens: 0, pot: 0 };
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 flex items-center">
        <button onClick={onBack} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Einladungen ({invitations.length})</h1>
      </div>

      <div className="p-4 space-y-4">
        {invitations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>Keine offenen Einladungen</p>
          </div>
        ) : (
          invitations.map(invitation => {
            const betDetails = getBetDetails(invitation.betId);
            const bet = bets.find(b => b.id === invitation.betId);
            const creatorName = getUserName(invitation.fromUserId);
            
            return (
              <div key={invitation.id} className="bg-white border rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{getBetTitle(invitation.betId)}</h3>
                    <p className="text-sm text-gray-600">
                      {invitation.viaLink ? `Über geteilten Link von ${creatorName}` : `Von ${creatorName}`}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    Warten
                  </span>
                </div>

                <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                  <span>Einsatz: {betDetails.stakeTokens} 🪙</span>
                  <span>Pot: {betDetails.pot} 🪙</span>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => onRespond(invitation.id, 'accepted')}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Check size={16} />
                    <span>Annehmen</span>
                  </button>
                  <button
                    onClick={() => onRespond(invitation.id, 'declined')}
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Ablehnen
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// JoinBetView KOMPONENTE ENTFERNEN

function CreateBetView({ currentUser, friends, onBack, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stakeTokens, setStakeTokens] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [outcomes, setOutcomes] = useState(['', '']);

  const toggleFriend = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const addOutcome = () => {
    setOutcomes([...outcomes, '']);
  };

  const updateOutcome = (index, value) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = value;
    setOutcomes(newOutcomes);
  };

  const removeOutcome = (index) => {
    if (outcomes.length > 2) {
      setOutcomes(outcomes.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    const validOutcomes = outcomes.filter(o => o.trim());
    const stakeNum = parseInt(stakeTokens) || 0;
    
    if (title && stakeNum > 0 && validOutcomes.length >= 2 && stakeNum <= currentUser.tokens) {
      const totalParticipants = selectedFriends.length + 1;
      const totalPot = stakeNum * totalParticipants;
      const appFee = Math.floor(totalPot * 0.03);
      
      onSubmit({
        title,
        description: description || '',
        stakeTokens: stakeNum,
        participants: selectedFriends,
        outcomes: validOutcomes,
        pot: `${totalPot} 🪙`,
        appFee: `${appFee} 🪙`
      });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 flex items-center">
        <button onClick={onBack} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Neue Wette erstellen</h1>
      </div>

      <div className="p-4 space-y-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Du bist automatisch Teilnehmer:</strong> {currentUser.username} 
            <span className="ml-2 text-blue-600">💰 {currentUser.tokens} Tokens</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Wetten-Titel</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Bayern gewinnt gegen Dortmund"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Weitere Details zur Wette..."
            rows={3}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Einsatz in Tokens</label>
          <input
            type="number"
            value={stakeTokens}
            onChange={(e) => setStakeTokens(e.target.value)}
            placeholder="z.B. 50"
            min="1"
            max={currentUser.tokens}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Du hast {currentUser.tokens} Tokens verfügbar
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mögliche Ergebnisse (mind. 2)</label>
          <div className="space-y-2">
            {outcomes.map((outcome, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => updateOutcome(index, e.target.value)}
                  placeholder={index === 0 ? "z.B. Bayern gewinnt" : index === 1 ? "z.B. Dortmund gewinnt" : `Outcome ${index + 1}`}
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {outcomes.length > 2 && (
                  <button
                    onClick={() => removeOutcome(index)}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addOutcome}
            className="mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            + Weiteres Ergebnis hinzufügen
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Freunde einladen</label>
          {friends.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
              <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Keine Freunde verfügbar</p>
              <p className="text-xs">Andere User können per Einladungscode beitreten</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map(friend => (
                <label key={friend.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(friend.id)}
                    onChange={() => toggleFriend(friend.id)}
                    className="mr-3"
                  />
                  <span className="font-medium">{friend.username}</span>
                  <span className="ml-auto text-sm text-gray-500">{friend.email}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-sm text-yellow-700">
            💡 Nach der Erstellung kannst du einen Link erstellen und in Social Media teilen!
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!title || !stakeTokens || parseInt(stakeTokens) <= 0 || parseInt(stakeTokens) > currentUser.tokens || outcomes.filter(o => o.trim()).length < 2}
          className="w-full bg-green-500 text-white p-4 rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Wette erstellen
        </button>
      </div>
    </div>
  );
}

function BetDetailView({ bet, currentUser, users, invitations, setInvitations, setBets, bets, onBack, onVote, onStartVoting }) {
  const [selectedWinner, setSelectedWinner] = useState('');
  const [message, setMessage] = useState('');

  // Lokale Funktionen in der Komponente definieren
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unbekannt';
  };

  const inviteUserToBet = (betId, userId) => {
    const existingInvitation = invitations.find(inv => 
      inv.betId === betId && inv.toUserId === userId
    );
    
    if (!bet.participants.includes(userId) && !existingInvitation) {
      const newInvitation = {
        id: Date.now() + userId,
        betId: betId,
        fromUserId: currentUser.id,
        toUserId: userId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      setInvitations([...invitations, newInvitation]);
      return true;
    }
    return false;
  };

  const handleVote = () => {
    if (selectedWinner) {
      onVote(bet.id, selectedWinner, currentUser.username);
      setSelectedWinner('');
      setMessage('✅ Deine Stimme wurde abgegeben!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const shareLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?bet=${bet.id}`;
    
    if (navigator.share) {
      // Native Share API (Mobile)
      navigator.share({
        title: `Wette: ${bet.title}`,
        text: `Ich habe eine neue Wette erstellt! Einsatz: ${bet.stake}`,
        url: shareUrl
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      setMessage('🔗 Link kopiert! Teile ihn in WhatsApp, Instagram etc.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const hasVoted = (username) => {
    return Object.keys(bet.votes || {}).includes(username);
  };

  const getVoteCount = (outcome) => {
    return Object.values(bet.votes || {}).filter(vote => vote === outcome).length;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'voting': return 'bg-yellow-100 text-yellow-800';
      case 'finished': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Aktiv';
      case 'voting': return 'Abstimmung';
      case 'finished': return 'Beendet';
      default: return 'Unbekannt';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <Clock size={16} />;
      case 'voting': return <Vote size={16} />;
      case 'finished': return <Trophy size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center">
        <button onClick={onBack} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Wetten-Details</h1>
      </div>

      <div className="p-4 space-y-6">
        {message && (
          <div className="text-center p-3 rounded-lg bg-blue-50 text-blue-700">
            {message}
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-xl">
          <h2 className="text-xl font-bold mb-2">{bet.title}</h2>
          <p className="text-gray-600 mb-4">{bet.description || 'Keine weitere Beschreibung'}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Pot:</span>
              <div className="font-semibold text-green-600">
                {bet.stakeTokens * bet.participants.length} 🪙
              </div>
            </div>
            <div>
              <span className="text-gray-500">App-Gebühr:</span>
              <div className="font-semibold">
                {Math.floor(bet.stakeTokens * bet.participants.length * 0.03)} 🪙
              </div>
            </div>
            <div>
              <span className="text-gray-500">Einsatz:</span>
              <div className="font-semibold">{bet.stakeTokens} 🪙</div>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bet.status)}`}>
                {getStatusIcon(bet.status)}
                <span>{getStatusText(bet.status)}</span>
              </div>
            </div>
          </div>
        </div>

        {bet.status === 'active' && (
          <div className="bg-blue-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Link size={20} className="mr-2" />
              Wette teilen
            </h3>
            
            <button
              onClick={shareLink}
              className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Link size={16} />
              <span>Link teilen</span>
            </button>
            
            <p className="text-xs text-blue-600 mt-3 text-center">
              📱 Teile den Link in WhatsApp, Instagram, Telegram etc.<br/>
              Freunde werden zur App geleitet und können beitreten!
            </p>
          </div>
        )}

        {bet.outcomes && bet.outcomes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Mögliche Ergebnisse</h3>
            <div className="space-y-2">
              {bet.outcomes.map((outcome, index) => (
                <div key={outcome} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{outcome}</span>
                  <div className="flex items-center space-x-2">
                    {bet.status === 'voting' && (
                      <span className="text-sm text-gray-500">
                        {getVoteCount(outcome)} Stimme(n)
                      </span>
                    )}
                    {bet.winner === outcome && (
                      <Trophy size={16} className="text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-3">Teilnehmer</h3>
          <div className="space-y-2">
            {bet.participants.map(userId => (
              <div key={userId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{getUserName(userId)}</span>
                <div className="flex items-center space-x-2">
                  {hasVoted(getUserName(userId)) && (
                    <Check size={16} className="text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {bet.status === 'voting' && (
          <div className="bg-blue-50 p-4 rounded-xl mb-4">
            <h4 className="font-semibold text-blue-800 mb-2">📊 Abstimmungsregeln</h4>
            {bet.participants.length === 2 ? (
              <p className="text-blue-700 text-sm">
                Beide Teilnehmer müssen abstimmen. Bei unterschiedlichen Stimmen gibt es ein Unentschieden.
              </p>
            ) : (
              <p className="text-blue-700 text-sm">
                Absolute Mehrheit nötig: {Math.floor(bet.participants.length / 2) + 1} von {bet.participants.length} Stimmen
              </p>
            )}
            <div className="text-center text-sm text-gray-600 mt-2">
              Bereits abgestimmt: {Object.keys(bet.votes || {}).length} von {bet.participants.length}
            </div>
          </div>
        )}

        {bet.status === 'voting' && (
          <div className="bg-yellow-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold mb-3">Abstimmung</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Welches Ergebnis ist eingetreten?</label>
                <select
                  value={selectedWinner}
                  onChange={(e) => setSelectedWinner(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Ergebnis wählen</option>
                  {bet.outcomes?.map(outcome => (
                    <option key={outcome} value={outcome}>{outcome}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleVote}
                disabled={!selectedWinner || hasVoted(currentUser.username)}
                className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {hasVoted(currentUser.username) ? 'Du hast bereits abgestimmt' : 'Abstimmen'}
              </button>
            </div>
          </div>
        )}

        {bet.status === 'finished' && bet.winner && (
          <div className="bg-green-50 p-4 rounded-xl text-center">
            <Trophy size={48} className="mx-auto mb-3 text-yellow-500" />
            {bet.winner === 'Unentschieden' ? (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-2">🤝 Unentschieden!</h3>
                <p className="text-gray-700">Die Einsätze gehen zurück an die Teilnehmer.</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-green-800 mb-2">🎉 Ergebnis: {bet.winner}!</h3>
                <p className="text-green-700">
                  Gewinn für alle, die richtig getippt haben: {Math.floor((bet.stakeTokens * bet.participants.length) * 0.97)} 🪙
                </p>
              </>
            )}
          </div>
        )}

        {bet.status === 'active' && bet.creatorId === currentUser.id && (
          <button
            onClick={() => onStartVoting(bet.id)}
            className="w-full bg-yellow-500 text-white p-4 rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
          >
            Abstimmung starten
          </button>
        )}
      </div>
    </div>
  );
}