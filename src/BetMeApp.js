import React, { useState, useEffect, useRef } from 'react';
import { Plus, Users, Clock, Trophy, Vote, ArrowLeft, Check, UserPlus, Link, Copy, MessageCircle, Send, User, Camera, Wallet, Share2, Trash2 } from 'lucide-react';

// Import utilities and data
import { 
  getStatusColor, 
  getStatusText, 
  getStatusIcon, 
  getUserName, 
  getUserTokens, 
  getFriends, 
  formatTime, 
  hasVoted, 
  getVoteCount,
  calculateMajorityVote
} from './utils.js';
import { supabaseService } from './supabaseService.js';

// Import components
import LoginView from './components/LoginView.js';
import ProfileView from './components/ProfileView.js';
import CreateBetView from './components/CreateBetView.js';
import InvitationsView from './components/InvitationsView.js';
import ChooseOutcomeView from './components/ChooseOutcomeView.js';
import HomeView from './components/HomeView.js';
import BetDetailView from './components/BetDetailView.js';
import CredibilityLogView from './components/CredibilityLogView.js';

export default function BetMeApp() {
  // State management
  const [currentView, setCurrentView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [bets, setBets] = useState([]);
  const [selectedBet, setSelectedBet] = useState(null);
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [userProfiles, setUserProfiles] = useState({});
  const [inviteLinks, setInviteLinks] = useState({});
  const [credibilityLogs, setCredibilityLogs] = useState([]);
  const processedCredibilityBetsRef = useRef(new Set());

  // Credibility system configuration
  const CREDIBILITY_CONFIG = {
    VOTE_AGAINST_MAJORITY: 15, // Points lost for voting against majority
    NO_VOTE: 10, // Points lost for not voting
    MIN_CREDIBILITY: 0,
    MAX_CREDIBILITY: 100
  };

  // Initialize app data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Loading data from Supabase...');
        
        // Load all data in parallel
        const [usersData, betsData, invitationsData, userProfilesData, credibilityLogsData] = await Promise.all([
          supabaseService.getUsers(),
          supabaseService.getBets(),
          supabaseService.getInvitations(currentUser?.id),
          supabaseService.getUserProfiles(),
          currentUser ? supabaseService.getCredibilityLogs(currentUser.id) : Promise.resolve([])
        ]);
        
        setUsers(usersData);
        setBets(betsData);
        setInvitations(invitationsData);
        setUserProfiles(userProfilesData);
        setCredibilityLogs(credibilityLogsData);
        
        console.log('✅ Data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading data:', error);
      }
    };
    
    loadData();
  }, [currentUser?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentUser) return;
    
    // Subscribe to bets changes
    const betsSubscription = supabaseService.subscribeToBets((payload) => {
      console.log('🔄 Bets updated:', payload);
      setBets(prev => {
        const newBets = [...prev];
        const index = newBets.findIndex(bet => bet.id === payload.new.id);
        if (index >= 0) {
          newBets[index] = payload.new;
        } else {
          newBets.unshift(payload.new);
        }
        return newBets;
      });
    });
    
    // Subscribe to invitations changes
    const invitationsSubscription = supabaseService.subscribeToInvitations(currentUser.id, (payload) => {
      console.log('🔄 Invitations updated:', payload);
      setInvitations(prev => {
        const newInvitations = [...prev];
        const index = newInvitations.findIndex(inv => inv.id === payload.new.id);
        if (index >= 0) {
          newInvitations[index] = payload.new;
        } else {
          newInvitations.unshift(payload.new);
        }
        return newInvitations;
      });
    });
    
    return () => {
      betsSubscription?.unsubscribe();
      invitationsSubscription?.unsubscribe();
    };
  }, [currentUser]);

  // Auto-scroll chat
  useEffect(() => {
    if (selectedBet?.chatMessages) {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [selectedBet?.chatMessages]);

  // Core functions
  const handleLogin = (username) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setCurrentView('home');
    }
  };

  const updateUserTokens = async (userId, newTokens) => {
    try {
      const success = await supabaseService.updateUserTokens(userId, newTokens);
      if (success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, tokens: newTokens } : user
        ));
        if (currentUser?.id === userId) {
          setCurrentUser(prev => ({ ...prev, tokens: newTokens }));
        }
      }
    } catch (error) {
      console.error('Error updating user tokens:', error);
    }
  };

  const sendMessage = async (betId, message) => {
    if (!message.trim()) return;
    
    try {
      const success = await supabaseService.addChatMessage(betId, currentUser.id, message.trim());
      if (success) {
        // The real-time subscription will handle updating the UI
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const createBet = async (betData) => {
    const stakeTokens = parseInt(betData.stakeTokens) || 0;
    if (stakeTokens > currentUser.tokens) {
      alert('Not enough tokens for this stake!');
      return;
    }

    try {
      const newBet = await supabaseService.createBet({
        title: betData.title,
        description: betData.description,
        creator_id: currentUser.id,
        participants: [currentUser.id],
        participant_bets: { [currentUser.id]: stakeTokens },
        stake_tokens: stakeTokens,
        status: 'active',
        votes: {},
        chat_messages: []
      });
      
      if (newBet) {
        setBets(prev => [newBet, ...prev]);
        setSelectedBet(newBet);
        setCurrentView('chooseOutcome');
        
        // Create invitations for participants
        for (const friendId of betData.participants) {
          await supabaseService.createInvitation({
            bet_id: newBet.id,
            from_user_id: currentUser.id,
            to_user_id: friendId,
            status: 'pending'
          });
        }
        
        // Update user tokens
        await updateUserTokens(currentUser.id, currentUser.tokens - stakeTokens);
      }
    } catch (error) {
      console.error('Error creating bet:', error);
      alert('Failed to create bet. Please try again.');
    }
  };
  };

  const respondToInvitation = (invitationId, response) => {
    const invitation = invitations.find(inv => inv.id === invitationId);
    
    if (response === 'accepted' && invitation) {
      const bet = bets.find(b => b.id === invitation.betId);
      if (bet) {
        // Prüfen ob User genug Tokens hat
                 if (bet.stakeTokens > currentUser.tokens) {
           alert('Not enough tokens for this bet!');
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

  const startVoting = (betId) => {
    setBets(prev => prev.map(bet => 
      bet.id === betId ? { ...bet, status: 'voting' } : bet
    ));
    
    // Update selectedBet immediately to show voting interface
    setSelectedBet(prev => 
      prev?.id === betId ? { ...prev, status: 'voting' } : prev
    );
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
          
          const finishedBet = { ...currentBet, votes: newVotes, winner, status: 'completed' };
          setSelectedBet(finishedBet);
          
          // Process credibility for all participants (ONLY ONCE when bet completes)
          setTimeout(() => {
            processCredibilityForBet(finishedBet);
          }, 200);
          
          // Belohnung an WETTER (nicht Voter) verteilen
          setTimeout(() => {
            // Wer hat auf das Gewinner-Outcome GEWETTET?
            const winningBettors = Object.entries(currentBet.participantBets || {})
              .filter(([userId, bet]) => bet === winner)
              .map(([userId]) => parseInt(userId));
            
            if (winningBettors.length > 0) {
              const rewardPerWinner = Math.floor(winnersReward / winningBettors.length);
              
              winningBettors.forEach(userId => {
                updateUserTokens(userId, getUserTokens(userId, users) + rewardPerWinner);
              });
            }
          }, 100);
          
          return finishedBet;
        }
        
        // REMOVED: The tie condition that was causing double credibility processing
        // Now ties just continue voting without triggering credibility processing
        
        const votingBet = { ...currentBet, votes: newVotes };
        setSelectedBet(votingBet);
        return votingBet;
      }
      return currentBet;
    }));
  };

  const getPendingInvitations = (userId) => {
    return invitations.filter(inv => inv.toUserId === userId && inv.status === 'pending');
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

  // Profile functions
  const uploadProfilePhoto = (userId, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUserProfiles(prev => ({
        ...prev,
        [userId]: e.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const generateInviteLink = (userId) => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const inviteLink = `${window.location.origin}${window.location.pathname}?invite=${inviteCode}&user=${userId}`;
    setInviteLinks(prev => ({ ...prev, [userId]: inviteLink }));
    return inviteLink;
  };

  const copyInviteLink = (link) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
             alert('🔗 Invitation link copied!');
    }
  };

  const removeFriend = (userId, friendId) => {
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId || user.id === friendId) {
        return {
          ...user,
          friends: user.friends.filter(id => id !== userId && id !== friendId)
        };
      }
      return user;
    }));
  };

  // Credibility management functions
  const updateUserCredibility = async (userId, change, reason, betId = null) => {
    try {
      const success = await supabaseService.updateUserCredibility(userId, change, reason, betId);
      if (success) {
        // Reload user data to get updated credibility
        const updatedUsers = await supabaseService.getUsers();
        setUsers(updatedUsers);
        
        if (currentUser?.id === userId) {
          const updatedUser = updatedUsers.find(u => u.id === userId);
          if (updatedUser) {
            setCurrentUser(updatedUser);
          }
        }
        
        // Reload credibility logs
        if (currentUser) {
          const updatedLogs = await supabaseService.getCredibilityLogs(currentUser.id);
          setCredibilityLogs(updatedLogs);
        }
      }
    } catch (error) {
      console.error('Error updating user credibility:', error);
    }
  };

  const processCredibilityForBet = (bet) => {
    // Prevent multiple processing of the same bet using a ref (immune to React double execution)
    if (processedCredibilityBetsRef.current.has(bet.id)) {
      console.log(`Credibility already processed for bet ${bet.id} - SKIPPING`);
      return;
    }

    if (bet.status !== 'completed' || !bet.votes || Object.keys(bet.votes).length === 0) {
      return;
    }

    const majorityVote = calculateMajorityVote(bet.votes);
    if (!majorityVote) return;

    console.log(`Processing credibility for bet ${bet.id}, majority: ${majorityVote}`);

    // Mark this bet as processed IMMEDIATELY using ref
    processedCredibilityBetsRef.current.add(bet.id);

    // Process each participant
    bet.participants.forEach(participantId => {
      // Find the username for this participant ID
      const participant = users.find(u => u.id === participantId);
      if (!participant) return;
      
      const participantVote = bet.votes[participant.username];
      
      console.log(`Participant ${participant.username} voted: ${participantVote}, majority: ${majorityVote}`);
      
      if (!participantVote) {
        // User didn't vote
        console.log(`No vote penalty for ${participant.username}`);
        updateUserCredibility(
          participantId, 
          -CREDIBILITY_CONFIG.NO_VOTE, 
          'No vote', 
          bet.id
        );
      } else if (participantVote !== majorityVote) {
        // User voted against majority
        console.log(`Vote against majority penalty for ${participant.username}`);
        updateUserCredibility(
          participantId, 
          -CREDIBILITY_CONFIG.VOTE_AGAINST_MAJORITY, 
          'Voted against majority', 
          bet.id
        );
      } else {
        console.log(`No penalty for ${participant.username} - voted with majority`);
      }
    });
  };

  // Render views
  if (currentView === 'login') {
    return <LoginView users={users} onLogin={handleLogin} />;
  }

  if (currentView === 'profile') {
    return (
      <ProfileView 
        currentUser={currentUser}
        users={users}
        userProfiles={userProfiles}
        inviteLinks={inviteLinks}
        onBack={() => setCurrentView('home')}
        onUploadPhoto={uploadProfilePhoto}
        onGenerateInvite={generateInviteLink}
        onCopyInvite={copyInviteLink}
        onRemoveFriend={removeFriend}
      />
    );
  }

  if (currentView === 'credibility') {
    return (
      <CredibilityLogView 
        currentUser={currentUser}
        credibilityLogs={credibilityLogs}
        users={users}
        onBack={() => setCurrentView('home')}
      />
    );
  }

  if (currentView === 'create') {
    return (
      <CreateBetView 
        currentUser={currentUser}
        users={users}
        onBack={() => setCurrentView('home')}
        onSubmit={createBet}
      />
    );
  }

  if (currentView === 'invitations') {
    return (
      <InvitationsView 
        currentUser={currentUser}
        invitations={getPendingInvitations(currentUser.id)}
        bets={bets}
        users={users}
        onBack={() => setCurrentView('home')}
        onRespond={respondToInvitation}
      />
    );
  }

  if (currentView === 'chooseOutcome' && selectedBet) {
    return (
      <ChooseOutcomeView 
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
      />
    );
  }

  // Detail view
  if (currentView === 'detail' && selectedBet) {
    return (
      <BetDetailView 
        bet={selectedBet}
        currentUser={currentUser}
        users={users}
        invitations={invitations}
        setInvitations={setInvitations}
        setBets={setBets}
        bets={bets}
        onBack={() => setCurrentView('home')}
        onVote={voteForWinner}
        onStartVoting={startVoting}
      />
    );
  }

  // Home view
  if (currentView === 'home') {
    return (
      <HomeView 
        currentUser={currentUser}
        bets={bets}
        users={users}
        invitations={invitations}
        onLogout={() => {setCurrentUser(null); setCurrentView('login');}}
        onCreateBet={() => setCurrentView('create')}
        onViewInvitations={() => setCurrentView('invitations')}
        onViewProfile={() => setCurrentView('profile')}
        onViewCredibility={() => setCurrentView('credibility')}
        onViewBet={(bet) => {
          setSelectedBet(bet);
          setCurrentView('detail');
        }}
      />
    );
  }

  // Fallback
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-6">
      <h1>View not implemented yet</h1>
      <button onClick={() => setCurrentView('home')}>Back to Home</button>
    </div>
  );
}