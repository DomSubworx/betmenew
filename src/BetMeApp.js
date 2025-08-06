import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from './contexts/ToastContext.js';
import { dataService } from './services/dataService.js';
import { BET_STATUS } from './constants.js';
import { calculateMajorityVote } from './utils.js';

// Import views
import LoginView from './components/LoginView.js';
import HomeView from './components/HomeView.js';
import CreateBetView from './components/CreateBetView.js';
import BetDetailView from './components/BetDetailView.js';
import ChooseOutcomeView from './components/ChooseOutcomeView.js';
import ProfileView from './components/ProfileView.js';
import InvitationsView from './components/InvitationsView.js';
import CredibilityLogView from './components/CredibilityLogView.js';
import EnvironmentSwitcher from './components/EnvironmentSwitcher.js';

export default function BetMeApp() {
  // Core state
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data state - all synchronized with data service
  const [users, setUsers] = useState([]);
  const [bets, setBets] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [credibilityLogs, setCredibilityLogs] = useState([]);
  
  // UI state
  const [selectedBet, setSelectedBet] = useState(null);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [inviteLinks, setInviteLinks] = useState({});
  
  // Refs for preventing duplicate processing
  const processedCredibilityBetsRef = useRef(new Set());
  
  // Toast context
  const { showError, showSuccess } = useToast();

  // ============================================================================
  // CORE DATA MANAGEMENT - SINGLE SOURCE OF TRUTH
  // ============================================================================

  /**
   * Load all application data from the data service
   * This is the single source of truth for data loading
   */
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Initialize data service
      dataService.initialize();
      
      // Load all data in parallel for efficiency
      const [usersData, betsData, userProfilesData, credibilityLogsData] = await Promise.all([
        dataService.getUsers(),
        dataService.getBets(),
        dataService.getUserProfiles(),
        currentUser ? dataService.getCredibilityLogs(currentUser.id) : Promise.resolve([])
      ]);
      
      // Update all state atomically
      setUsers(usersData);
      setBets(betsData);
      setUserProfiles(userProfilesData);
      setCredibilityLogs(credibilityLogsData);
      
      console.log('✅ All data loaded successfully:', {
        users: usersData.length,
        bets: betsData.length,
        profiles: Object.keys(userProfilesData).length,
        logs: credibilityLogsData.length
      });
    } catch (error) {
      console.error('❌ Error loading data:', error);
      showError('Failed to load data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, showError]);

  /**
   * Load invitations for a specific user
   * Called when user logs in or when invitations need refresh
   */
  const loadUserInvitations = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      // Load all invitations for the user (not just pending ones)
      const allInvitations = await dataService.getInvitations(); // No userId filter
      const userInvitations = allInvitations.filter(inv => inv.toUserId === userId);
      setInvitations(userInvitations);
      console.log(`✅ Loaded ${userInvitations.length} invitations for user ${userId} (${userInvitations.filter(inv => inv.status === 'pending').length} pending)`);
    } catch (error) {
      console.error('❌ Error loading invitations:', error);
      showError('Failed to load invitations.');
    }
  }, [showError]);

  /**
   * Refresh all data - used after major operations
   */
  const refreshAllData = useCallback(async () => {
    await loadAllData();
    if (currentUser) {
      await loadUserInvitations(currentUser.id);
    }
  }, [loadAllData, loadUserInvitations, currentUser]);

  // ============================================================================
  // INITIALIZATION AND CLEANUP
  // ============================================================================

  // Load initial data on app startup
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

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

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  /**
   * Handle user login with proper data loading
   */
  const handleLogin = useCallback(async (username) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      showError('User not found!');
      return;
    }

    try {
      setCurrentUser(user);
      setCurrentView('home');
      
      // Load user-specific data
      await loadUserInvitations(user.id);
      
      console.log(`✅ User ${user.username} logged in successfully`);
    } catch (error) {
      console.error('❌ Login error:', error);
      showError('Login failed. Please try again.');
    }
  }, [users, loadUserInvitations, showError]);

  /**
   * Handle user logout
   */
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentView('login');
    setInvitations([]);
    setSelectedBet(null);
    setSelectedInvitation(null);
    console.log('✅ User logged out');
  }, []);

  // ============================================================================
  // BET MANAGEMENT
  // ============================================================================

  /**
   * Create a new bet with proper state synchronization
   */
  const createBet = useCallback(async (betData) => {
    if (!currentUser) {
      showError('You must be logged in to create a bet!');
      return;
    }

    const stakeTokens = parseInt(betData.stakeTokens) || 0;
    if (stakeTokens > currentUser.tokens) {
      showError('Not enough tokens for this stake!');
      return;
    }

    if (!betData.participants || betData.participants.length === 0) {
      showError('Please select at least one friend to invite!');
      return;
    }

    try {
      console.log('🎲 Creating bet:', betData);
      
      // Create bet in data service
      const newBet = await dataService.createBet({
        title: betData.title,
        description: betData.description,
        creatorId: currentUser.id,
        participants: [currentUser.id], // Creator is always first participant
        participantBets: { [currentUser.id]: betData.outcomes[0] || 'Outcome 1' },
        stakeTokens: stakeTokens,
        status: BET_STATUS.ACTIVE,
        votes: {},
        chatMessages: [],
        outcomes: betData.outcomes
      });
      
      if (!newBet) {
        throw new Error('Failed to create bet');
      }

      console.log('✅ Bet created:', newBet);

      // Create invitations for all selected friends
      const invitationPromises = betData.participants.map(friendId => 
        dataService.createInvitation({
          betId: newBet.id,
          fromUserId: currentUser.id,
          toUserId: friendId,
          status: 'pending'
        })
      );

      const newInvitations = await Promise.all(invitationPromises);
      console.log('✅ Invitations created:', newInvitations.length);

      // Update user tokens
      await dataService.updateUserTokens(currentUser.id, currentUser.tokens - stakeTokens);

      // Refresh all data to ensure consistency
      await refreshAllData();
      
      // Update current user state
      setCurrentUser(prev => ({ ...prev, tokens: prev.tokens - stakeTokens }));
      
      showSuccess('Bet created successfully!');
      setCurrentView('home');
      
    } catch (error) {
      console.error('❌ Error creating bet:', error);
      showError('Failed to create bet. Please try again.');
    }
  }, [currentUser, refreshAllData, showError, showSuccess]);

  /**
   * Update user tokens with proper state synchronization
   */
  const updateUserTokens = useCallback(async (userId, newTokens) => {
    try {
      const success = await dataService.updateUserTokens(userId, newTokens);
      if (success) {
        // Refresh user data to get updated state
        await refreshAllData();
        
        // Update current user if needed
        if (currentUser?.id === userId) {
          setCurrentUser(prev => ({ ...prev, tokens: newTokens }));
        }
      }
      return success;
    } catch (error) {
      console.error('❌ Error updating user tokens:', error);
      return false;
    }
  }, [refreshAllData, currentUser]);

  // ============================================================================
  // INVITATION MANAGEMENT
  // ============================================================================

  /**
   * Get pending invitations for a user
   */
  const getPendingInvitations = useCallback((userId) => {
    const pending = invitations.filter(inv => inv.toUserId === userId && inv.status === 'pending');
    console.log(`📨 Pending invitations for user ${userId}:`, pending.length);
    return pending;
  }, [invitations]);

  /**
   * Respond to an invitation with proper state management
   */
  const respondToInvitation = useCallback(async (invitationId, response) => {
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (!invitation) {
      showError('Invitation not found!');
      return;
    }

    try {
      console.log(`📨 Responding to invitation ${invitationId} with: ${response}`);

      if (response === 'accepted') {
        const bet = bets.find(b => b.id === invitation.betId);
        if (!bet) {
          showError('Bet not found!');
          return;
        }

        // Check if user has enough tokens
        if (bet.stakeTokens > currentUser.tokens) {
          showError('Not enough tokens for this bet!');
          return;
        }

        // User must choose outcome when joining
        setSelectedBet(bet);
        setSelectedInvitation(invitation);
        setCurrentView('chooseOutcome');
        return;
      }

      // Update invitation status
      await dataService.updateInvitationStatus(invitationId, response);
      
      // Refresh invitations to ensure state is in sync
      await loadUserInvitations(currentUser.id);
      
      showSuccess(`Invitation ${response}!`);
      
    } catch (error) {
      console.error('❌ Error responding to invitation:', error);
      showError('Failed to respond to invitation. Please try again.');
    }
  }, [invitations, bets, currentUser, loadUserInvitations, showError, showSuccess]);

  // ============================================================================
  // CREDIBILITY MANAGEMENT
  // ============================================================================

  /**
   * Process credibility changes for a completed bet
   */
  const processCredibilityForBet = useCallback(async (bet) => {
    // Prevent multiple processing of the same bet
    if (processedCredibilityBetsRef.current.has(bet.id)) {
      console.log('🔄 Bet already processed for credibility:', bet.id);
      return;
    }

    if (bet.status !== BET_STATUS.COMPLETED || !bet.votes || Object.keys(bet.votes).length === 0) {
      console.log('❌ Bet not ready for credibility processing:', bet.id, bet.status);
      return;
    }

    const majorityVote = calculateMajorityVote(bet.votes);
    if (!majorityVote) {
      console.log('❌ No majority vote found for bet:', bet.id);
      return;
    }

    console.log('🎯 Processing credibility for bet:', bet.id, 'Winner:', majorityVote);

    // Mark this bet as processed
    processedCredibilityBetsRef.current.add(bet.id);

    // Process each participant
    for (const participantId of bet.participants) {
      const participant = users.find(u => u.id === participantId);
      if (!participant) {
        console.log('❌ Participant not found:', participantId);
        continue;
      }

      const userVote = bet.votes[participant.username];
      let credibilityChange = 0;
      let reason = '';

      if (!userVote) {
        // No vote penalty
        credibilityChange = -10;
        reason = 'No vote submitted';
      } else if (userVote === majorityVote) {
        // Correct vote - small bonus
        credibilityChange = 5;
        reason = 'Voted with majority';
      } else {
        // Wrong vote penalty
        credibilityChange = -15;
        reason = 'Voted against majority';
      }

      console.log(`👤 Processing ${participant.username}: ${reason} (${credibilityChange})`);
      
      try {
        await dataService.updateUserCredibility(participantId, credibilityChange, reason, bet.id);
      } catch (error) {
        console.error('❌ Error updating credibility for', participant.username, error);
      }
    }

    console.log('✅ Credibility processing complete for bet:', bet.id);
    
    // Refresh data after processing all credibility changes
    setTimeout(() => {
      refreshAllData();
    }, 100);
  }, [users, refreshAllData]);

  // ============================================================================
  // VOTING AND BET COMPLETION
  // ============================================================================

  /**
   * Start voting for a bet
   */
  const startVoting = useCallback(async (betId) => {
    try {
      console.log('🗳️ Starting voting for bet:', betId);
      
      await dataService.updateBet(betId, { status: BET_STATUS.VOTING });
      
      // Refresh data to get updated bet status
      await refreshAllData();
      
      showSuccess('Voting started! All participants can now vote.');
    } catch (error) {
      console.error('❌ Error starting voting:', error);
      showError('Failed to start voting. Please try again.');
    }
  }, [refreshAllData, showError, showSuccess]);

  /**
   * Submit a vote for a bet
   */
  const voteForWinner = useCallback(async (betId, winner, voterName) => {
    console.log('🚨 VOTE FUNCTION CALLED!', { betId, winner, voterName });
    
    try {
      console.log('🗳️ VOTE SUBMISSION STARTED:', { betId, winner, voterName });
      console.log('🗳️ Current bets state:', bets);
      
      const currentBet = bets.find(b => b.id === betId);
      if (!currentBet) {
        console.error('❌ Bet not found:', betId);
        showError('Bet not found!');
        return;
      }

      console.log('🗳️ Found bet:', currentBet);
      console.log('🗳️ Current votes:', currentBet.votes);

      const newVotes = { ...currentBet.votes, [voterName]: winner };
      console.log('🗳️ New votes object:', newVotes);
      
      // Update bet with new votes immediately for UI responsiveness
      const updatedBet = { ...currentBet, votes: newVotes };
      console.log('🗳️ Updated bet object:', updatedBet);
      
      // Force immediate UI update
      setBets(prev => {
        console.log('🗳️ Updating bets state, previous:', prev);
        const newBets = prev.map(b => b.id === betId ? updatedBet : b);
        console.log('🗳️ New bets state:', newBets);
        return newBets;
      });
      
      // Also update selectedBet if it's the current bet being viewed
      if (selectedBet && selectedBet.id === betId) {
        setSelectedBet(updatedBet);
      }
      
      // Save to data service
      console.log('🗳️ Saving to data service...');
      await dataService.updateBet(betId, { votes: newVotes });
      console.log('🗳️ Saved to data service successfully');
      
      // Check if voting is complete
      const participants = currentBet.participants;
      console.log('🗳️ Participants:', participants);
      
      const hasAllVotes = participants.every(participantId => {
        const participant = users.find(u => u.id === participantId);
        const hasVoted = participant && newVotes[participant.username];
        console.log(`🗳️ Participant ${participant?.username} (${participantId}) has voted:`, hasVoted);
        return hasVoted;
      });

      console.log('🗳️ Has all votes:', hasAllVotes);

      if (hasAllVotes) {
        console.log('🗳️ VOTING COMPLETE - Calculating winner...');
        // Calculate winner and complete bet
        const majorityVote = calculateMajorityVote(newVotes);
        console.log('🗳️ Majority vote result:', majorityVote);
        
        if (majorityVote) {
          const completedBet = { 
            ...updatedBet, 
            status: BET_STATUS.COMPLETED, 
            winner: majorityVote 
          };
          
          console.log('🗳️ Completed bet object:', completedBet);
          
          // Update UI immediately
          setBets(prev => prev.map(b => b.id === betId ? completedBet : b));
          setSelectedBet(completedBet);
          
          // Save to data service
          await dataService.updateBet(betId, { 
            status: BET_STATUS.COMPLETED, 
            winner: majorityVote 
          });
          
          // Process credibility changes
          console.log('🗳️ Processing credibility changes...');
          await processCredibilityForBet(completedBet);
          
          showSuccess(`🎉 Voting complete! Winner: ${majorityVote}`);
          
          // Refresh all data to ensure consistency
          setTimeout(() => {
            console.log('🗳️ Refreshing all data...');
            refreshAllData();
          }, 500);
        } else {
          showError('No clear winner. Voting will continue.');
        }
      } else {
        console.log('🗳️ Voting not complete yet');
        showSuccess('✅ Vote submitted!');
      }
      
    } catch (error) {
      console.error('❌ Error voting:', error);
      showError('Failed to submit vote. Please try again.');
    }
  }, [bets, users, setBets, selectedBet, setSelectedBet, processCredibilityForBet, refreshAllData, showError, showSuccess]);

  // ============================================================================
  // PROFILE AND UTILITY FUNCTIONS
  // ============================================================================

  const uploadProfilePhoto = useCallback(async (userId, file) => {
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
  }, []);

  const generateInviteLink = useCallback(async (userId) => {
    const inviteLink = await dataService.generateInviteLink(userId);
    setInviteLinks(prev => ({ ...prev, [userId]: inviteLink }));
    return inviteLink;
  }, []);

  const copyInviteLink = useCallback((link) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      showSuccess('🔗 Invitation link copied!');
    }
  }, [showSuccess]);

  const removeFriend = useCallback(async (userId, friendId) => {
    const success = await dataService.removeFriend(userId, friendId);
    if (success) {
      await refreshAllData();
      showSuccess('Friend removed successfully!');
    } else {
      showError('Failed to remove friend. Please try again.');
    }
  }, [refreshAllData, showError, showSuccess]);

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================

  // Login view
  if (currentView === 'login') {
    return (
      <LoginView 
        users={users}
        onLogin={handleLogin}
        isLoading={isLoading}
      />
    );
  }

  // Invitations view
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

  // Choose outcome view
  if (currentView === 'chooseOutcome' && selectedBet) {
    return (
      <ChooseOutcomeView 
        bet={selectedBet}
        currentUser={currentUser}
        invitation={selectedInvitation}
        onOutcomeChosen={async (outcome) => {
          console.log('🎯 User chose outcome:', { outcome, betId: selectedBet.id, userId: currentUser.id });
          
          // Deduct tokens
          await updateUserTokens(currentUser.id, currentUser.tokens - selectedBet.stakeTokens);
          
          // Add user to bet with their chosen outcome
          const updatedBet = {
            ...selectedBet,
            participants: selectedBet.participants.includes(currentUser.id) 
              ? selectedBet.participants 
              : [...selectedBet.participants, currentUser.id],
            participantBets: {
              ...selectedBet.participantBets,
              [currentUser.id]: outcome
            }
          };
          
          console.log('📝 Updating bet with new participant:', {
            betId: selectedBet.id,
            newParticipants: updatedBet.participants,
            newParticipantBets: updatedBet.participantBets
          });
          
          await dataService.updateBet(selectedBet.id, {
            participants: updatedBet.participants,
            participantBets: updatedBet.participantBets
          });
          
          // Mark invitation as accepted if present
          if (selectedInvitation) {
            console.log('✅ Marking invitation as accepted:', selectedInvitation.id);
            await dataService.updateInvitationStatus(selectedInvitation.id, 'accepted');
          }
          
          // Refresh all data
          console.log('🔄 Refreshing all data after invitation acceptance');
          await refreshAllData();
          
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

  // Profile view
  if (currentView === 'profile') {
    return (
      <ProfileView 
        currentUser={currentUser}
        users={users}
        bets={bets}
        userProfiles={userProfiles}
        inviteLinks={inviteLinks}
        onBack={() => setCurrentView('home')}
        onViewCredibility={() => setCurrentView('credibility')}
        onUploadPhoto={uploadProfilePhoto}
        onGenerateInviteLink={generateInviteLink}
        onCopyInviteLink={copyInviteLink}
        onRemoveFriend={removeFriend}
      />
    );
  }

  // Credibility log view
  if (currentView === 'credibility') {
    return (
      <CredibilityLogView 
        currentUser={currentUser}
        credibilityLogs={credibilityLogs}
        users={users}
        onBack={() => setCurrentView('profile')}
      />
    );
  }

  // Create bet view
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

  // Home view (default)
  return (
    <>
      <HomeView 
        currentUser={currentUser}
        bets={bets}
        users={users}
        invitations={invitations}
        isLoading={isLoading}
        onLogout={handleLogout}
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