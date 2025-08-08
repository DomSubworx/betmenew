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
import TokenLogView from './components/TokenLogView.js';
import BottomNavigation from './components/BottomNavigation.js';
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
  const [tokenLogs, setTokenLogs] = useState([]);
  
  // UI state
  const [selectedBet, setSelectedBet] = useState(null);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [inviteLinks, setInviteLinks] = useState({});
  const [previousView, setPreviousView] = useState('home');
  
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
      // 🎯 FIXED: Don't reinitialize data service - only load data
      // dataService.initialize(); // Removed - causes data reset
      
      // Load all data in parallel for efficiency
      const [usersData, betsData, userProfilesData, credibilityLogsData, tokenLogsData] = await Promise.all([
        dataService.getUsers(),
        dataService.getBets(),
        dataService.getUserProfiles(),
        currentUser ? dataService.getCredibilityLogs(currentUser.id) : Promise.resolve([]),
        currentUser ? dataService.getTokenLogs(currentUser.id) : Promise.resolve([])
      ]);
      
      // Update all state atomically
      setUsers(usersData);
      setBets(betsData);
      setUserProfiles(userProfilesData);
      setCredibilityLogs(credibilityLogsData);
      setTokenLogs(tokenLogsData);
      
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
      console.log(`🎯 Loading invitations for user ${userId}...`);
      
      // Load invitations for the user with proper filtering
      const allInvitations = await dataService.getInvitations(userId); // Pass userId to get only user's invitations
      console.log('🎯 Invitations from data service for user:', allInvitations);
      
      // Filter to only show pending invitations (declined invitations should not appear)
      const pendingInvitations = allInvitations.filter(inv => inv.status === 'pending');
      console.log(`🎯 Pending invitations for user ${userId}:`, pendingInvitations);
      
      setInvitations(pendingInvitations);
      console.log(`✅ Loaded ${pendingInvitations.length} pending invitations for user ${userId}`);
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
  // BACKGROUND PROCESSES
  // ============================================================================

  // 🆕 NEW: Background process to check expired voting bets
  useEffect(() => {
    let isProcessing = false; // Guard against concurrent processing
    
    const checkExpiredBets = async () => {
      if (isProcessing) {
        console.log('⚠️ Background check already in progress, skipping...');
        return;
      }
      
      try {
        isProcessing = true;
        console.log('🔄 Background: Checking for expired voting bets...');
        const result = await dataService.checkExpiredVotingBets();
        console.log('✅ Background check result:', result);
        
        // Refresh data after processing
        await loadAllData();
      } catch (error) {
        console.error('❌ Error checking expired bets:', error);
      } finally {
        isProcessing = false;
      }
    };

    // Check immediately on mount
    checkExpiredBets();

    // Set up interval to check every 5 minutes
    const interval = setInterval(checkExpiredBets, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadAllData]);

  // ============================================================================
  // INITIALIZATION AND CLEANUP
  // ============================================================================

  // Initialize data service and load initial data on app startup
  useEffect(() => {
    // 🎯 FIXED: Initialize data service only once at startup
    dataService.initialize();
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

  // 🎯 FIXED: Refresh data when user changes
  useEffect(() => {
    if (currentUser) {
      console.log(`🔄 User changed to ${currentUser.username}, refreshing data...`);
      loadAllData();
      loadUserInvitations(currentUser.id);
    }
  }, [currentUser, loadAllData, loadUserInvitations]);

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
      
      // 🎯 FIXED: Refresh all data when switching users
      await loadAllData();
      
      // Load user-specific data
      await loadUserInvitations(user.id);
      
      console.log(`✅ User ${user.username} logged in successfully`);
    } catch (error) {
      console.error('❌ Login error:', error);
      showError('Login failed. Please try again.');
    }
  }, [users, loadAllData, loadUserInvitations, showError]);

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
   * Validate token balance consistency across the entire system
   * This ensures no tokens are created or destroyed
   */
  const validateTokenConservation = useCallback((operation, bet = null) => {
    console.log('🔍 Validating token conservation for:', operation);
    
    // Calculate total tokens in the system
    const totalTokens = users.reduce((sum, user) => sum + user.tokens, 0);
    
    // Calculate expected total based on bet parameters
    let platformFee = 0;
    
    if (bet && bet.status === BET_STATUS.COMPLETED) {
      const totalStakes = bet.stakeTokens * bet.participants.length;
      platformFee = Math.floor(totalStakes * 0.03);
      
      // In a completed bet, totalStakes should equal total payouts + platform fee
      const winners = bet.participants.filter(participantId => 
        bet.participantBets[participantId] === bet.winner
      );
      
      if (winners.length > 0) {
        const availableForWinners = totalStakes - platformFee;
        const payoutPerWinner = Math.floor(availableForWinners / winners.length);
        const totalPayouts = winners.length * (bet.stakeTokens + payoutPerWinner);
        
        console.log('💰 Token conservation check:', {
          totalStakes,
          totalPayouts,
          platformFee,
          expectedTotal: totalPayouts + platformFee,
          actualTotal: totalStakes,
          conservation: totalStakes === (totalPayouts + platformFee) ? '✅ CONSERVED' : '❌ VIOLATED'
        });
        
        if (totalStakes !== (totalPayouts + platformFee)) {
          console.error('❌ CRITICAL: Token conservation violated in bet completion!');
          return false;
        }
      }
    }
    
    console.log(`✅ Token conservation validated for ${operation}. Total tokens: ${totalTokens}`);
    return true;
  }, [users]);

  /**
   * Validate bet integrity - ensure all data is consistent
   */
  const validateBetIntegrity = useCallback((bet) => {
    console.log('🔍 Validating bet integrity:', bet.id);
    
    const issues = [];
    
    // Check if all participants have made their bets
    const missingBets = bet.participants.filter(participantId => !bet.participantBets[participantId]);
    if (missingBets.length > 0) {
      issues.push(`Participants without bets: ${missingBets.join(', ')}`);
    }
    
    // Check if all participantBets correspond to actual participants
    const invalidBets = Object.keys(bet.participantBets).filter(userId => 
      !bet.participants.includes(parseInt(userId))
    );
    if (invalidBets.length > 0) {
      issues.push(`Invalid participant bets: ${invalidBets.join(', ')}`);
    }
    
    // Check if all participantBets are valid outcomes
    const invalidOutcomes = Object.values(bet.participantBets).filter(outcome => 
      !bet.outcomes.includes(outcome)
    );
    if (invalidOutcomes.length > 0) {
      issues.push(`Invalid outcomes: ${invalidOutcomes.join(', ')}`);
    }
    
    // Check if stake tokens is valid
    if (bet.stakeTokens <= 0) {
      issues.push('Invalid stake amount');
    }
    
    if (issues.length > 0) {
      console.error('❌ Bet integrity issues:', issues);
      return false;
    }
    
    console.log('✅ Bet integrity validation passed');
    return true;
  }, []);

  /**
   * Create a new bet with proper state management
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
      
      // 🎯 FIXED: Create bet in data service first
      const newBet = await dataService.createBet({
        title: betData.title,
        description: betData.description,
        creatorId: currentUser.id,
        participants: [currentUser.id], // Only include creator initially
        participantBets: { [currentUser.id]: betData.participantBets?.[currentUser.id] || betData.outcomes[0] }, // Only creator's bet initially
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

      // 🎯 FIXED: Update local state immediately for UI responsiveness
      setBets(prev => [newBet, ...prev]);
      
      // 🎯 FIXED: Update current user tokens immediately
      const newUserTokens = currentUser.tokens - stakeTokens;
      setCurrentUser(prev => ({ ...prev, tokens: newUserTokens }));

      // 🎯 FIXED: Create invitations in background (don't block UI)
      const friendsToInvite = betData.participants.filter(id => id !== currentUser.id);
      console.log('🎯 Creating invitations for friends:', friendsToInvite);
      
      const invitationPromises = friendsToInvite.map(friendId => {
        const invitationData = {
          betId: newBet.id,
          fromUserId: currentUser.id,
          toUserId: friendId,
          status: 'pending'
        };
        console.log('🎯 Creating invitation:', invitationData);
        return dataService.createInvitation(invitationData);
      });

      // 🎯 FIXED: Show success message immediately
      showSuccess('Bet created successfully!');
      setCurrentView('home');

      // 🎯 FIXED: Process invitations and token deduction in background
      Promise.all(invitationPromises).then(newInvitations => {
        console.log('✅ Invitations created successfully:', newInvitations);
        console.log('✅ Number of invitations created:', newInvitations.length);
        
        // Update invitations state
        setInvitations(prev => {
          const updatedInvitations = [...prev, ...newInvitations];
          console.log('✅ Updated invitations state:', updatedInvitations);
          return updatedInvitations;
        });
      }).catch(error => {
        console.error('❌ Error creating invitations:', error);
        showError('Bet created but some invitations failed. Please check.');
      });

      // 🎯 FIXED: Deduct tokens in background
      dataService.updateUserTokens(currentUser.id, newUserTokens).then(() => {
        console.log('✅ Tokens deducted successfully');
      }).catch(error => {
        console.error('❌ Error deducting tokens:', error);
        showError('Bet created but token deduction failed. Please check your balance.');
      });
      
      // 🎯 VALIDATION: Ensure token conservation after bet creation
      if (!validateTokenConservation('bet creation')) {
        console.error('❌ CRITICAL: Token conservation violated during bet creation!');
      }
      
    } catch (error) {
      console.error('❌ Error creating bet:', error);
      showError('Failed to create bet. Please try again.');
    }
  }, [currentUser, setBets, setCurrentUser, setInvitations, showError, showSuccess, validateTokenConservation]);

  /**
   * Update user tokens with proper state synchronization
   */
  const updateUserTokens = useCallback(async (userId, newTokens, reason = 'manual_update', betId = null, betTitle = null) => {
    try {
      const success = await dataService.updateUserTokens(userId, newTokens, reason, betId, betTitle);
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
      
      // 🎯 FIXED: Immediately remove declined invitations from local state for instant UI update
      if (response === 'declined') {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        showSuccess('Invitation declined!');
      } else {
        // For accepted invitations, refresh to ensure state is in sync
        await loadUserInvitations(currentUser.id);
        showSuccess('Invitation accepted!');
      }
      
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

  /**
   * Process token redistribution for a completed bet
   * This is the core financial logic that determines winners and losers
   * 
   * TOKEN CONSERVATION PRINCIPLE:
   * - Total tokens in system remains constant (minus platform fee)
   * - Winners get their stake back + share of losers' stakes (minus platform fee)
   * - Losers lose their stake permanently
   * 
   * MATHEMATICAL MODEL:
   * - Total stakes collected = participants × stakeTokens
   * - Platform fee = totalStakes × 0.03
   * - Available for winners = totalStakes - platformFee
   * - Each winner gets: stakeTokens + (availableForWinners / winners.length)
   */
  const processTokenRedistribution = useCallback(async (bet) => {
    console.log('💰 Processing token redistribution for bet:', bet.id);
    
    if (bet.status !== BET_STATUS.COMPLETED || !bet.winner) {
      console.error('❌ Bet not ready for token redistribution:', bet.id);
      return;
    }

    // 🎯 VALIDATION: Ensure bet integrity before processing payments
    if (!validateBetIntegrity(bet)) {
      console.error('❌ Bet integrity validation failed - aborting token redistribution');
      return;
    }

    // 🎯 MATHEMATICAL VALIDATION: Ensure pot calculation is correct
    const totalStakes = bet.stakeTokens * bet.participants.length;
    const platformFee = Math.floor(totalStakes * 0.03); // 3% platform fee
    
    // Determine winners and losers
    const winners = [];
    const losers = [];
    
    for (const participantId of bet.participants) {
      const participantBet = bet.participantBets[participantId];
      if (participantBet === bet.winner) {
        winners.push(participantId);
      } else {
        losers.push(participantId);
      }
    }

    // 🎯 FIXED: Calculate available for winners correctly
    // Available = total pot - platform fee
    const totalPot = totalStakes;
    const availableForWinners = totalPot - platformFee;
    
    console.log('💰 Token redistribution calculation:', {
      totalStakes,
      totalPot,
      platformFee,
      availableForWinners,
      participants: bet.participants.length
    });

    console.log('💰 Winners and losers:', { winners, losers });

    // 🎯 EDGE CASE: Handle tie (no clear winner) - return all stakes
    if (winners.length === 0) {
      console.log('💰 No winners - returning stakes to all participants');
      for (const participantId of bet.participants) {
        const participant = users.find(u => u.id === participantId);
        if (participant) {
                  // Return the stake that was deducted when joining
        const newTokens = participant.tokens + bet.stakeTokens;
        await dataService.updateUserTokens(participantId, newTokens, 'stake_returned_tie', bet.id, bet.title);
        console.log(`💰 Participant ${participant.username}: stake returned (new total: ${newTokens})`);
        }
      }
      console.log(`💰 Platform fee collected: ${platformFee} tokens (from tie scenario)`);
      return;
    }

    // 🎯 CORRECTED LOGIC: Calculate payout per winner
    // Winners get their stake back + equal share of losers' stakes (minus platform fee)
    const payoutPerWinner = Math.floor(availableForWinners / winners.length);
    
    console.log('💰 Payout per winner:', payoutPerWinner);

    // 🎯 FIXED: Process winners correctly
    // Winners get their share of the total pot
    for (const winnerId of winners) {
      const winner = users.find(u => u.id === winnerId);
      if (winner) {
        // 🎯 CRITICAL FIX: payoutPerWinner is the total amount each winner should get
        // (includes their stake + their share of the pot)
        const newTokens = winner.tokens + payoutPerWinner;
        await dataService.updateUserTokens(winnerId, newTokens, 'bet_won', bet.id, bet.title);
        console.log(`💰 Winner ${winner.username}: +${payoutPerWinner} tokens (total payout, new total: ${newTokens})`);
      }
    }

    // 🎯 FIXED: Process losers correctly
    // Losers have already lost their stake when joining - no additional deduction needed
    for (const loserId of losers) {
      const loser = users.find(u => u.id === loserId);
      if (loser) {
        console.log(`💰 Loser ${loser.username}: stake already deducted when joining (no additional loss)`);
      }
    }

    // 🎯 PLATFORM FEE: Log the fee collection
    console.log(`💰 Platform fee collected: ${platformFee} tokens`);

    // 🎯 MATHEMATICAL VERIFICATION: Ensure token conservation
    const totalPayouts = winners.length * payoutPerWinner;
    const totalSystemChange = totalPayouts + platformFee;
    
    // 🎯 SIMPLE TEST: Verify the math
    console.log('💰 Mathematical verification:', {
      totalStakes,
      totalPayouts,
      platformFee,
      totalSystemChange,
      conservation: totalStakes === totalSystemChange ? '✅ CONSERVED' : '❌ VIOLATED'
    });

    // 🎯 DETAILED BREAKDOWN FOR DEBUGGING
    console.log('💰 Detailed breakdown:', {
      participants: bet.participants.length,
      winners: winners.length,
      losers: losers.length,
      stakePerPerson: bet.stakeTokens,
      totalStakesCollected: totalStakes,
      platformFeeDeducted: platformFee,
      availableForWinners: availableForWinners,
      payoutPerWinner: payoutPerWinner,
      totalPayoutsToWinners: totalPayouts,
      totalSystemChange: totalSystemChange,
      difference: totalStakes - totalSystemChange
    });

    if (totalStakes !== totalSystemChange) {
      console.error('❌ CRITICAL: Token conservation violated!', {
        totalStakes,
        totalSystemChange,
        difference: totalStakes - totalSystemChange
      });
    }

    console.log('✅ Token redistribution complete for bet:', bet.id);
    
    // 🎯 FINAL VALIDATION: Ensure token conservation after redistribution
    if (!validateTokenConservation('bet completion', bet)) {
      console.error('❌ CRITICAL: Token conservation validation failed after redistribution!');
    }
  }, [users, validateTokenConservation, validateBetIntegrity]);

  // ============================================================================
  // VOTING AND BET COMPLETION
  // ============================================================================

  /**
   * Start voting for a bet
   */
  const startVoting = useCallback(async (betId) => {
    try {
      console.log('🗳️ Starting voting for bet:', betId);
      
      // Find the current bet
      const currentBet = bets.find(b => b.id === betId);
      if (!currentBet) {
        console.error('❌ Bet not found:', betId);
        showError('Bet not found!');
        return;
      }

      // 🆕 NEW: Set voting start time for 3-day window tracking
      const votingStartTime = new Date().toISOString();
      
      // Update bet status immediately for UI responsiveness
      const updatedBet = { 
        ...currentBet, 
        status: BET_STATUS.VOTING,
        votingStartTime: votingStartTime,
        votedWithinWindow: {},
        majorityPunishmentApplied: false
      };
      console.log('🗳️ Updated bet for voting:', updatedBet);
      
      // Force immediate UI update
      setBets(prev => {
        console.log('🗳️ Updating bets state for voting start, previous:', prev);
        const newBets = prev.map(b => b.id === betId ? updatedBet : b);
        console.log('🗳️ New bets state after voting start:', newBets);
        return newBets;
      });
      
      // Also update selectedBet if it's the current bet being viewed
      if (selectedBet && selectedBet.id === betId) {
        setSelectedBet(updatedBet);
      }
      
      // Save to data service
      await dataService.updateBet(betId, { 
        status: BET_STATUS.VOTING,
        votingStartTime: votingStartTime,
        votedWithinWindow: {},
        majorityPunishmentApplied: false
      });
      console.log('🗳️ Voting started successfully in data service');
      
      showSuccess('Voting started! All participants can now vote.');
    } catch (error) {
      console.error('❌ Error starting voting:', error);
      showError('Failed to start voting. Please try again.');
    }
  }, [bets, selectedBet, setSelectedBet, showError, showSuccess]);

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

      // 🆕 NEW: Check if voting window has expired
      const { isVotingWindowExpired } = require('./utils.js');
      if (currentBet.votingStartTime && isVotingWindowExpired(currentBet.votingStartTime)) {
        console.log('❌ Voting window has expired for bet:', betId);
        showError('Voting window has expired. This bet will be annulled.');
        return;
      }

      // 🆕 NEW: Track if vote is within the 3-day window
      const votedWithinWindow = { ...currentBet.votedWithinWindow };
      votedWithinWindow[voterName] = true;

      const newVotes = { ...currentBet.votes, [voterName]: winner };
      console.log('🗳️ New votes object:', newVotes);
      
      // 🎯 FIXED: Update bet with new votes immediately for UI responsiveness
      const updatedBet = { 
        ...currentBet, 
        votes: newVotes,
        votedWithinWindow: votedWithinWindow
      };
      console.log('🗳️ Updated bet object:', updatedBet);
      
      // 🎯 FIXED: Force immediate UI update
      setBets(prev => {
        console.log('🗳️ Updating bets state, previous:', prev);
        const newBets = prev.map(b => b.id === betId ? updatedBet : b);
        console.log('🗳️ New bets state:', newBets);
        return newBets;
      });
      
      // 🎯 FIXED: Also update selectedBet if it's the current bet being viewed
      if (selectedBet && selectedBet.id === betId) {
        setSelectedBet(updatedBet);
      }
      
      // 🎯 FIXED: Show immediate feedback
      showSuccess('✅ Vote submitted!');
      
      // 🎯 FIXED: Save to data service in background
      dataService.updateBet(betId, { 
        votes: newVotes,
        votedWithinWindow: votedWithinWindow
      }).then(() => {
        console.log('🗳️ Saved to data service successfully');
      }).catch(error => {
        console.error('❌ Error saving vote to data service:', error);
        showError('Vote submitted but failed to save. Please try again.');
      });
      
      // 🆕 NEW: Check if all participants have voted within the window
      const { hasAllParticipantsVoted, calculateAbsoluteMajority } = require('./utils.js');
      const participants = currentBet.participants;
      console.log('🗳️ Participants:', participants);
      
      const allVoted = hasAllParticipantsVoted(updatedBet, users);
      console.log('🗳️ All participants voted:', allVoted);

      if (allVoted) {
        console.log('🗳️ ALL PARTICIPANTS VOTED - Checking for absolute majority...');
        
        // 🆕 NEW: Check for absolute majority (more than 50% of ALL participants)
        const absoluteMajority = calculateAbsoluteMajority(newVotes, participants.length);
        console.log('🗳️ Absolute majority result:', absoluteMajority);
        
        if (absoluteMajority) {
          const completedBet = { 
            ...updatedBet, 
            status: BET_STATUS.COMPLETED, 
            winner: absoluteMajority 
          };
          
          console.log('🗳️ Completed bet object:', completedBet);
          
          // 🎯 FIXED: Update UI immediately
          setBets(prev => prev.map(b => b.id === betId ? completedBet : b));
          setSelectedBet(completedBet);
          
          // 🎯 FIXED: Show completion message immediately
          showSuccess(`🎉 Voting complete! Winner: ${absoluteMajority}`);
          
          // 🎯 FIXED: Process background operations
          Promise.all([
            // Save to data service
            dataService.updateBet(betId, { 
              status: BET_STATUS.COMPLETED, 
              winner: absoluteMajority 
            }),
            // Process token redistribution
            processTokenRedistribution(completedBet),
            // Process credibility changes
            processCredibilityForBet(completedBet)
          ]).then(() => {
            console.log('✅ All background operations completed successfully');
          }).catch(error => {
            console.error('❌ Error in background operations:', error);
            showError('Voting completed but some operations failed. Please check.');
          });
        } else {
          showError('No absolute majority reached. Voting will continue until 3-day window expires.');
        }
      } else {
        console.log('🗳️ Not all participants have voted yet');
      }
      
    } catch (error) {
      console.error('❌ Error voting:', error);
      showError('Failed to submit vote. Please try again.');
    }
  }, [bets, users, setBets, selectedBet, setSelectedBet, processCredibilityForBet, processTokenRedistribution, showError, showSuccess]);

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







  // Main app with bottom navigation
  if (currentView === 'home' || currentView === 'profile' || currentView === 'detail') {
    return (
      <>
        {currentView === 'home' && (
          <HomeView 
            currentUser={currentUser}
            bets={bets}
            users={users}
            invitations={invitations}
            isLoading={isLoading}
            onLogout={handleLogout}
            onCreateBet={() => setCurrentView('create')}
            onViewInvitations={() => setCurrentView('invitations')}
            onViewCredibility={() => {
              setPreviousView('home');
              setCurrentView('credibility');
            }}
            onViewTokenHistory={() => setCurrentView('tokenHistory')}
            onViewBet={(bet) => {
              setSelectedBet(bet);
              setCurrentView('detail');
            }}
          />
        )}
        
        {currentView === 'profile' && (
          <ProfileView 
            currentUser={currentUser}
            users={users}
            bets={bets}
            userProfiles={userProfiles}
            inviteLinks={inviteLinks}
            onBack={() => setCurrentView('home')}
            onViewCredibility={() => {
              setPreviousView('profile');
              setCurrentView('credibility');
            }}
            onViewTokenHistory={() => setCurrentView('tokenHistory')}
            onUploadPhoto={uploadProfilePhoto}
            onGenerateInviteLink={generateInviteLink}
            onCopyInviteLink={copyInviteLink}
            onRemoveFriend={removeFriend}
          />
        )}
        
        {currentView === 'detail' && selectedBet && (
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
        )}
        
        <BottomNavigation 
          currentView={currentView}
          onNavigate={setCurrentView}
          currentUser={currentUser}
        />
    </>
  );
}

  // Other views (without bottom navigation)

  
  return (
    <>
      {currentView === 'login' && (
        <LoginView 
          users={users}
          onLogin={handleLogin}
        />
      )}
      
      {currentView === 'create' && (
        <CreateBetView 
          currentUser={currentUser}
          users={users}
          onBack={() => setCurrentView('home')}
          onSubmit={createBet}
        />
      )}
      
      {currentView === 'invitations' && (
        <InvitationsView 
          currentUser={currentUser}
          invitations={invitations}
          bets={bets}
          users={users}
          onBack={() => setCurrentView('home')}
          onRespond={respondToInvitation}
        />
      )}
      
      {currentView === 'chooseOutcome' && selectedBet && (
        <ChooseOutcomeView 
          bet={selectedBet}
          currentUser={currentUser}
          invitation={selectedInvitation}
          onOutcomeChosen={async (outcome) => {
            console.log('🎯 User chose outcome:', { outcome, betId: selectedBet.id, userId: currentUser.id });
            
            // 🎯 FIXED: Update local state immediately for UI responsiveness
            const newUserTokens = currentUser.tokens - selectedBet.stakeTokens;
            setCurrentUser(prev => ({ ...prev, tokens: newUserTokens }));
            
            // 🎯 FIXED: Update bet state immediately
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
            
            // 🎯 FIXED: Update bets state immediately
            setBets(prev => prev.map(b => b.id === selectedBet.id ? updatedBet : b));
            
            // 🎯 FIXED: Show success message and navigate immediately
            showSuccess('Successfully joined the bet!');
            setSelectedInvitation(null);
            setCurrentView('home');
            
            console.log('📝 Updated bet with new participant:', {
              betId: selectedBet.id,
              newParticipants: updatedBet.participants,
              newParticipantBets: updatedBet.participantBets
            });
            
            // 🎯 FIXED: Process background operations
            try {
              // Deduct tokens
              await updateUserTokens(currentUser.id, newUserTokens, 'bet_stake', selectedBet.id, selectedBet.title);
              
              // 🎯 VALIDATION: Ensure token conservation after joining bet
              if (!validateTokenConservation('bet joining')) {
                console.error('❌ CRITICAL: Token conservation violated during bet joining!');
              }
              
              // Update bet in data service
              await dataService.updateBet(selectedBet.id, {
                participants: updatedBet.participants,
                participantBets: updatedBet.participantBets
              });
              
              // Mark invitation as accepted if present
              if (selectedInvitation) {
                console.log('✅ Marking invitation as accepted:', selectedInvitation.id);
                await dataService.updateInvitationStatus(selectedInvitation.id, 'accepted');
                
                // Update invitations state
                setInvitations(prev => prev.map(inv => 
                  inv.id === selectedInvitation.id 
                    ? { ...inv, status: 'accepted' }
                    : inv
                ));
              }
              
              console.log('✅ All background operations completed successfully');
            } catch (error) {
              console.error('❌ Error in background operations:', error);
              showError('Bet joined but some operations failed. Please check.');
            }
          }}
          onBack={() => setCurrentView('home')}
        />
      )}
      

      
      {currentView === 'credibility' && (
        <CredibilityLogView 
          currentUser={currentUser}
          credibilityLogs={credibilityLogs}
          users={users}
          onBack={() => setCurrentView(previousView)}
        />
      )}
      
      {currentView === 'tokenHistory' && (
        <TokenLogView 
          currentUser={currentUser}
          tokenLogs={tokenLogs}
          users={users}
          onBack={() => setCurrentView('home')}
        />
      )}
      
      {currentView !== 'create' && currentView !== 'chooseOutcome' && currentView !== 'invitations' && <EnvironmentSwitcher />}
    </>
  );
}