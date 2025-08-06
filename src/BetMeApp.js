import React, { useState, useEffect, useRef } from 'react';
import { useToast } from './contexts/ToastContext.js';

// Import utilities and data
import { 
  getUserTokens, 
  calculateMajorityVote
} from './utils.js';
import { dataService } from './services/dataService.js';
import { CREDIBILITY_CONFIG } from './constants.js';

// Import components
import LoginView from './components/LoginView.js';
import ProfileView from './components/ProfileView.js';
import CreateBetView from './components/CreateBetView.js';
import InvitationsView from './components/InvitationsView.js';
import ChooseOutcomeView from './components/ChooseOutcomeView.js';
import HomeView from './components/HomeView.js';
import BetDetailView from './components/BetDetailView.js';
import CredibilityLogView from './components/CredibilityLogView.js';
import EnvironmentSwitcher from './components/EnvironmentSwitcher.js';

export default function BetMeApp() {
  const { showError, showSuccess } = useToast();
  
  // State management
  const [currentView, setCurrentView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [bets, setBets] = useState([]);
  const [selectedBet, setSelectedBet] = useState(null);
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [selectedInvitation, setSelectedInvitation] = useState(null);

  const [userProfiles, setUserProfiles] = useState({});
  const [inviteLinks, setInviteLinks] = useState({});
  const [credibilityLogs, setCredibilityLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const processedCredibilityBetsRef = useRef(new Set());

  // Initialize data service and load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Initialize the appropriate data service
        dataService.initialize();
        
        // Load all data in parallel
        const [usersData, betsData, invitationsData, userProfilesData, credibilityLogsData] = await Promise.all([
          dataService.getUsers(),
          dataService.getBets(),
          dataService.getInvitations(),
          dataService.getUserProfiles(),
          currentUser ? dataService.getCredibilityLogs(currentUser.id) : Promise.resolve([])
        ]);
        
        setUsers(usersData);
        setBets(betsData);
        setInvitations(invitationsData);
        setUserProfiles(userProfilesData);
        setCredibilityLogs(credibilityLogsData);
      } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [showError, currentUser]);

  // Set up real-time subscriptions (only for Supabase mode)
  useEffect(() => {
    if (!currentUser) return;
    
    // Subscribe to bets changes
    const betsSubscription = dataService.subscribeToBets((payload) => {
      setBets(prev => {
        const newBets = [...prev];
        const existingIndex = newBets.findIndex(bet => bet.id === payload.new.id);
        
        if (existingIndex !== -1) {
          newBets[existingIndex] = payload.new;
        } else {
          newBets.unshift(payload.new);
        }
        
        return newBets;
      });
    });

    // Subscribe to invitations changes
    const invitationsSubscription = dataService.subscribeToInvitations(currentUser.id, (payload) => {
      setInvitations(prev => {
        const newInvitations = [...prev];
        const existingIndex = newInvitations.findIndex(inv => inv.id === payload.new.id);
        
        if (existingIndex !== -1) {
          newInvitations[existingIndex] = payload.new;
        } else {
          newInvitations.unshift(payload.new);
        }
        
        return newInvitations;
      });
    });

    return () => {
      betsSubscription();
      invitationsSubscription();
    };
  }, [currentUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dataService.cleanup();
    };
  }, []);

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
      const success = await dataService.updateUserTokens(userId, newTokens);
      if (success) {
        // Reload user data to get updated credibility
        const updatedUsers = await dataService.getUsers();
        setUsers(updatedUsers);
        
        if (currentUser?.id === userId) {
          const updatedUser = updatedUsers.find(u => u.id === userId);
          if (updatedUser) {
            setCurrentUser(updatedUser);
          }
        }
        
        // Reload credibility logs
        if (currentUser) {
          const updatedLogs = await dataService.getCredibilityLogs(currentUser.id);
          setCredibilityLogs(updatedLogs);
        }
      }
    } catch (error) {
      console.error('Error updating user credibility:', error);
    }
  };



  const createBet = async (betData) => {
    const stakeTokens = parseInt(betData.stakeTokens) || 0;
    if (stakeTokens > currentUser.tokens) {
      showError('Not enough tokens for this stake!');
      return;
    }

    try {
      // Create bet using data service
      const newBet = await dataService.createBet({
        title: betData.title,
        description: betData.description,
        creatorId: currentUser.id,
        participants: [currentUser.id],
        participantBets: { [currentUser.id]: betData.outcomes[0] || 'Outcome 1' },
        stakeTokens: stakeTokens,
        status: 'active',
        votes: {},
        chatMessages: [],
        outcomes: betData.outcomes
      });
      
      if (newBet) {
        // Add to local state
        setBets(prev => [newBet, ...prev]);
        setSelectedBet(newBet);
        setCurrentView('chooseOutcome');
        
        // Create invitations for participants
        for (const friendId of betData.participants) {
          await dataService.createInvitation({
            betId: newBet.id,
            fromUserId: currentUser.id,
            toUserId: friendId,
            status: 'pending'
          });
        }
        
        // Update user tokens
        await updateUserTokens(currentUser.id, currentUser.tokens - stakeTokens);
        
        showSuccess('Bet created successfully!');
      }
    } catch (error) {
      console.error('Error creating bet:', error);
      showError('Failed to create bet. Please try again.');
    }
  };

  const respondToInvitation = async (invitationId, response) => {
    const invitation = invitations.find(inv => inv.id === invitationId);
    
    if (response === 'accepted' && invitation) {
      const bet = bets.find(b => b.id === invitation.betId);
      if (bet) {
        // Check if user has enough tokens
        if (bet.stakeTokens > currentUser.tokens) {
          showError('Not enough tokens for this bet!');
          return;
        }
        
        // User must choose outcome when joining
        setCurrentView('chooseOutcome');
        setSelectedBet(bet);
        setSelectedInvitation(invitation);
        return;
      }
    }

    // Update invitation status
    await dataService.updateInvitationStatus(invitationId, response);
    
    // Update local state
    setInvitations(prev => prev.map(inv => 
      inv.id === invitationId 
        ? { ...inv, status: response }
        : inv
    ));
  };

  const startVoting = async (betId) => {
    // Update bet status in data service
    await dataService.updateBet(betId, { status: 'voting' });
    
    // Update local state
    setBets(prev => prev.map(bet => 
      bet.id === betId ? { ...bet, status: 'voting' } : bet
    ));
    
    // Update selectedBet immediately to show voting interface
    setSelectedBet(prev => 
      prev?.id === betId ? { ...prev, status: 'voting' } : prev
    );
  };

  const voteForWinner = async (betId, winner, voterName) => {
    const currentBet = bets.find(b => b.id === betId);
    if (!currentBet) return;

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
      // Calculate token reward - BASED ON BETS, NOT VOTES!
      const totalStake = currentBet.stakeTokens * currentBet.participants.length;
      const appFee = Math.floor(totalStake * 0.03);
      const winnersReward = totalStake - appFee;
      
      const finishedBet = { ...currentBet, votes: newVotes, winner, status: 'completed' };
      
      // Update bet in data service
      await dataService.updateBet(betId, { votes: newVotes, winner, status: 'completed' });
      
      setSelectedBet(finishedBet);
      
      // Process credibility for all participants (ONLY ONCE when bet completes)
      setTimeout(() => {
        processCredibilityForBet(finishedBet);
      }, 200);
      
      // Distribute reward to BETTORS (not voters)
      setTimeout(() => {
        // Who bet on the winning outcome?
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
    } else {
      // Update votes in data service
      await dataService.updateBet(betId, { votes: newVotes });
      
      // Update local state
      setBets(prevBets => prevBets.map(bet => 
        bet.id === betId ? { ...bet, votes: newVotes } : bet
      ));
      
      setSelectedBet(prev => 
        prev?.id === betId ? { ...prev, votes: newVotes } : prev
      );
    }
  };

  const getPendingInvitations = (userId) => {
    return invitations.filter(inv => inv.toUserId === userId && inv.status === 'pending');
  };



  // Profile functions
  const uploadProfilePhoto = async (userId, file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const profileData = { photoUrl: e.target.result };
      await dataService.updateUserProfile(userId, profileData);
      
      setUserProfiles(prev => ({
        ...prev,
        [userId]: e.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const generateInviteLink = async (userId) => {
    const inviteLink = await dataService.generateInviteLink(userId);
    setInviteLinks(prev => ({ ...prev, [userId]: inviteLink }));
    return inviteLink;
  };

  const copyInviteLink = (link) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      showSuccess('🔗 Invitation link copied!');
    }
  };

  const removeFriend = async (userId, friendId) => {
    const success = await dataService.removeFriend(userId, friendId);
    if (success) {
      // Reload users to get updated friends list
      const updatedUsers = await dataService.getUsers();
      setUsers(updatedUsers);
      
      // Update current user if needed
      if (currentUser?.id === userId) {
        const updatedUser = updatedUsers.find(u => u.id === userId);
        if (updatedUser) {
          setCurrentUser(updatedUser);
        }
      }
      
      showSuccess('Friend removed successfully!');
    } else {
      showError('Failed to remove friend. Please try again.');
    }
  };

  // Credibility management functions
  const updateUserCredibility = async (userId, change, reason, betId = null) => {
    try {
      const success = await dataService.updateUserCredibility(userId, change, reason, betId);
      if (success) {
        // Reload user data to get updated credibility
        const updatedUsers = await dataService.getUsers();
        setUsers(updatedUsers);
        
        if (currentUser?.id === userId) {
          const updatedUser = updatedUsers.find(u => u.id === userId);
          if (updatedUser) {
            setCurrentUser(updatedUser);
          }
        }
        
        // Reload credibility logs
        if (currentUser) {
          const updatedLogs = await dataService.getCredibilityLogs(currentUser.id);
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
      return;
    }

    if (bet.status !== 'completed' || !bet.votes || Object.keys(bet.votes).length === 0) {
      return;
    }

    const majorityVote = calculateMajorityVote(bet.votes);
    if (!majorityVote) return;

    // Mark this bet as processed IMMEDIATELY using ref
    processedCredibilityBetsRef.current.add(bet.id);

    // Process each participant
    bet.participants.forEach(participantId => {
      // Find the username for this participant ID
      const participant = users.find(u => u.id === participantId);
      if (!participant) return;
      
      const participantVote = bet.votes[participant.username];
      
      if (!participantVote) {
        // User didn't vote
        updateUserCredibility(
          participantId, 
          -CREDIBILITY_CONFIG.NO_VOTE, 
          'No vote', 
          bet.id
        );
      } else if (participantVote !== majorityVote) {
        // User voted against majority
        updateUserCredibility(
          participantId, 
          -CREDIBILITY_CONFIG.VOTE_AGAINST_MAJORITY, 
          'Voted against majority', 
          bet.id
        );
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
        bets={bets}
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
          // Deduct tokens
          updateUserTokens(currentUser.id, currentUser.tokens - selectedBet.stakeTokens);
          
          // Add user to bet with their chosen outcome
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
          
          // Mark invitation as accepted if present
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
      <>
        <HomeView 
          currentUser={currentUser}
          bets={bets}
          users={users}
          invitations={invitations}
          isLoading={isLoading}
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
        <EnvironmentSwitcher />
      </>
    );
  }

  // Fallback
  return (
    <>
      <div className="max-w-md mx-auto bg-white min-h-screen p-6">
        <h1>View not implemented yet</h1>
        <button onClick={() => setCurrentView('home')}>Back to Home</button>
      </div>
      <EnvironmentSwitcher />
    </>
  );
}