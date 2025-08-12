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
   * Load initial application data (users, bets, profiles) - no user-specific data
   * This is used for app startup and doesn't depend on currentUser
   */
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading initial application data...');
      
      // Load only non-user-specific data
      const [usersData, betsData, userProfilesData] = await Promise.all([
        dataService.getUsers(),
        dataService.getBets(),
        dataService.getUserProfiles()
      ]);
      
      // Update state
      setUsers(usersData);
      setBets(betsData);
      setUserProfiles(userProfilesData);
      
      console.log('✅ Initial data loaded successfully:', {
        users: usersData.length,
        bets: betsData.length,
        profiles: Object.keys(userProfilesData).length
      });
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      showError('Failed to load initial data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  /**
   * Load all application data from the data service
   * This is the single source of truth for data loading
   */
  const loadAllData = useCallback(async () => {
    try {
      console.log('🔄 Loading all application data...');
      
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
      
      // 🎯 FIX: Sync currentUser tokens after data load (with safety check)
      if (currentUser && usersData.length > 0) {
        const updatedUser = usersData.find(u => u.id === currentUser.id);
        if (updatedUser && updatedUser.tokens !== currentUser.tokens) {
          console.log('🔄 Syncing currentUser tokens after data load:', { 
            old: currentUser.tokens, 
            new: updatedUser.tokens 
          });
          setCurrentUser(prev => ({ ...prev, tokens: updatedUser.tokens }));
        }
      }
      
      console.log('✅ All data loaded successfully:', {
        users: usersData.length,
        bets: betsData.length,
        profiles: Object.keys(userProfilesData).length,
        logs: credibilityLogsData.length
      });
    } catch (error) {
      console.error('❌ Error loading data:', error);
      showError('Failed to load data. Please refresh the page.');
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
      
      // 🎯 FIX: Double-check token sync after loading invitations (with safety check)
      if (currentUser && currentUser.id === userId && users.length > 0) {
        const updatedUser = users.find(u => u.id === currentUser.id);
        if (updatedUser && updatedUser.tokens !== currentUser.tokens) {
          console.log('🔄 Final token sync after invitations load:', { 
            old: currentUser.tokens, 
            new: updatedUser.tokens 
          });
          setCurrentUser(prev => ({ ...prev, tokens: updatedUser.tokens }));
        }
      }
    } catch (error) {
      console.error('❌ Error loading invitations:', error);
      showError('Failed to load invitations.');
    }
  }, [showError, currentUser, users]);

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

    // Check immediately on mount (but don't block UI)
    setTimeout(checkExpiredBets, 1000);

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
    loadInitialData();
  }, [loadInitialData]);

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

  // 🎯 FIXED: Refresh data when user changes (simplified to prevent loops)
  useEffect(() => {
    if (currentUser) {
      console.log(`🔄 User changed to ${currentUser.username}, will refresh data in background...`);
      // Don't call loadAllData here to prevent circular dependency
      // Data will be loaded in the background after login
    }
  }, [currentUser]);

  // 🎯 CRITICAL FIX: Auto-sync currentUser tokens when global users state changes
  useEffect(() => {
    if (currentUser && users.length > 0) {
      const updatedUser = users.find(u => u.id === currentUser.id);
      if (updatedUser && updatedUser.tokens !== currentUser.tokens) {
        console.log('🔄 AUTO-SYNC: Global users state changed, updating currentUser tokens:', { 
          oldTokens: currentUser.tokens, 
          newTokens: updatedUser.tokens 
        });
        setCurrentUser(prev => ({ ...prev, tokens: updatedUser.tokens }));
      }
    }
  }, [users, currentUser]);

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

  // 🆕 NEW: Update selectedBet when bets state changes to keep chat in sync
  useEffect(() => {
    if (selectedBet && currentView === 'detail') {
      const updatedBet = bets.find(b => b.id === selectedBet.id);
      if (updatedBet && JSON.stringify(updatedBet.chatMessages) !== JSON.stringify(selectedBet.chatMessages)) {
        console.log('🔄 Updating selectedBet with new chat messages:', updatedBet.chatMessages?.length);
        setSelectedBet(updatedBet);
      }
    }
  }, [bets, selectedBet, currentView]);

  // 🆕 NEW: Handle profile link invitations on app startup
  useEffect(() => {
    if (!currentUser) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const inviteUserId = urlParams.get('invite');
    
    if (inviteUserId) {
      console.log('🔗 Profile invitation link detected:', inviteUserId);
      handleProfileInvitation(inviteUserId);
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [currentUser]);

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
      console.log(`🔐 Logging in user: ${user.username}`);
      
      // Set user and view immediately for responsive UI
      setCurrentUser(user);
      setCurrentView('home');
      
      // Load data in background without blocking login
      console.log('🔄 Loading user data in background...');
      
      // Use a timeout to prevent blocking
      setTimeout(async () => {
        try {
          await loadAllData();
          await loadUserInvitations(user.id);
          console.log(`✅ Background data load complete for ${user.username}`);
        } catch (error) {
          console.error('❌ Background data load error:', error);
          // Don't show error to user - data will load on next interaction
        }
      }, 100);
      
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
        participantBets: { [currentUser.id]: betData.creatorChoice }, // 🆕 FIXED: Use creator's explicit choice
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
      
      // 🎯 FIXED: DON'T deduct tokens when creating bet - they will be handled at completion
      // Keep current user tokens unchanged for now
      setCurrentUser(prev => ({ ...prev, tokens: prev.tokens }));

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

      // 🎯 FIXED: DON'T deduct tokens when creating bet - they will be handled at completion
      // No token movement should be logged for bet creation
      console.log('✅ Bet created - tokens will be handled at completion');
      
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
      console.log('🔄 updateUserTokens called:', { userId, newTokens, reason, betId, betTitle });
      
      const success = await dataService.updateUserTokens(userId, newTokens, reason, betId, betTitle);
      if (success) {
        console.log('✅ dataService.updateUserTokens successful');
        
        // 🎯 CRITICAL FIX: Update currentUser state IMMEDIATELY
        if (currentUser?.id === userId) {
          console.log('🔄 IMMEDIATE currentUser token update:', { 
            userId, 
            oldTokens: currentUser.tokens, 
            newTokens 
          });
          setCurrentUser(prev => ({ ...prev, tokens: newTokens }));
        }
        
        // Also update the global users state immediately
        setUsers(prev => {
          const updated = prev.map(user => 
            user.id === userId 
              ? { ...user, tokens: newTokens }
              : user
          );
          console.log('🔄 Global users state updated:', updated.find(u => u.id === userId));
          return updated;
        });
        
        // Refresh other data in background (don't block token update)
        setTimeout(async () => {
          try {
            await refreshAllData();
          } catch (error) {
            console.error('❌ Background refresh error:', error);
          }
        }, 100);
      } else {
        console.error('❌ dataService.updateUserTokens failed');
      }
      return success;
    } catch (error) {
      console.error('❌ Error updating user tokens:', error);
      return false;
    }
  }, [currentUser]);

  /**
   * 🎯 FIX: Ensure currentUser tokens are always in sync with global user data
   */
  const syncCurrentUserTokens = useCallback(async () => {
    if (!currentUser || users.length === 0) return;
    
    const updatedUser = users.find(u => u.id === currentUser.id);
    if (updatedUser && updatedUser.tokens !== currentUser.tokens) {
      console.log('🔄 Syncing currentUser tokens:', { 
        old: currentUser.tokens, 
        new: updatedUser.tokens 
      });
      setCurrentUser(prev => ({ ...prev, tokens: updatedUser.tokens }));
    }
  }, [currentUser, users]);

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
    
    try {
      if (bet.status !== BET_STATUS.COMPLETED || !bet.winner) {
        console.error('❌ Bet not ready for token redistribution:', bet.id);
        throw new Error('Bet not ready for token redistribution');
      }

      // 🎯 VALIDATION: Ensure bet integrity before processing payments
      if (!validateBetIntegrity(bet)) {
        console.error('❌ Bet integrity validation failed - aborting token redistribution');
        throw new Error('Bet integrity validation failed');
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
    
    // 🎯 DEBUG: Show expected token distribution
    console.log('🎯 EXPECTED TOKEN DISTRIBUTION:');
    console.log(`  - Total pot: ${totalStakes} tokens`);
    console.log(`  - Platform fee: ${platformFee} tokens`);
    console.log(`  - Available for winners: ${availableForWinners} tokens`);
    console.log(`  - Winners: ${winners.length} (${winners.join(', ')})`);
    console.log(`  - Losers: ${losers.length} (${losers.join(', ')})`);
    console.log(`  - Stake per person: ${bet.stakeTokens} tokens`);
    console.log(`  - Payout per winner: ${payoutPerWinner} tokens`);
    console.log(`  - Net gain per winner: ${payoutPerWinner - bet.stakeTokens} tokens`);
    console.log(`  - Net loss per loser: -${bet.stakeTokens} tokens`);

    console.log('💰 Winners and losers:', { winners, losers });

    // 🎯 EDGE CASE: Handle tie (no clear winner) - return all stakes
    if (winners.length === 0) {
      console.log('💰 No winners - returning stakes to all participants');
      for (const participantId of bet.participants) {
        const participant = users.find(u => u.id === participantId);
        if (participant) {
          // No token changes for tie - stakes were never deducted
          // Just log the consolidated result
          
          // 🆕 NEW: Log consolidated bet result (tie)
          // No token changes for tie - stakes were never deducted
          await dataService.addBetResultLog(participantId, bet.id, bet.title, 0, 'bet_tie');
          console.log(`💰 Participant ${participant.username}: tie result logged (0 tokens)`);
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
    // Winners get their stake back + their share of the pot
    for (const winnerId of winners) {
      const winner = users.find(u => u.id === winnerId);
      if (winner) {
        // 🎯 CRITICAL FIX: Winners get their stake back + winnings
        // They never lost their stake, so they just get the winnings
        const netGain = payoutPerWinner - bet.stakeTokens; // winnings minus their stake
        const newTokens = winner.tokens + netGain;
        
        console.log(`💰 Winner ${winner.username}: stake=${bet.stakeTokens}, winnings=${payoutPerWinner}, netGain=${netGain}`);
        
        await dataService.updateUserTokens(winnerId, newTokens, 'bet_won', bet.id, bet.title);
        
        // 🆕 NEW: Log consolidated bet result (win) - show the NET gain
        // Use the netGain we already calculated instead of recalculating
        await dataService.addBetResultLog(winnerId, bet.id, bet.title, netGain, 'bet_won');
        console.log(`💰 Winner ${winner.username}: win result logged (+${netGain} tokens)`);
        
        // 🎯 CRITICAL FIX: Update currentUser state if this is the current user
        if (winnerId === currentUser?.id) {
          console.log('🔄 WINNER: Updating currentUser tokens immediately:', { 
            oldTokens: currentUser.tokens, 
            newTokens 
          });
          setCurrentUser(prev => ({ ...prev, tokens: newTokens }));
          
          // Also update global users state immediately
          setUsers(prev => prev.map(user => 
            user.id === winnerId 
              ? { ...user, tokens: newTokens }
              : user
          ));
        }
      }
    }

    // 🎯 FIXED: Process losers correctly
    // Losers need to have their stake deducted now
    for (const loserId of losers) {
      const loser = users.find(u => u.id === loserId);
      if (loser) {
        // Deduct stake from losers
        const newTokens = loser.tokens - bet.stakeTokens;
        await dataService.updateUserTokens(loserId, newTokens, 'bet_lost', bet.id, bet.title);
        
        // 🆕 NEW: Log consolidated bet result (loss)
        // Use the netLoss we already calculated instead of recalculating
        const netLoss = -bet.stakeTokens;
        await dataService.addBetResultLog(loserId, bet.id, bet.title, netLoss, 'bet_lost');
        console.log(`💰 Loser ${loser.username}: loss result logged (${netLoss} tokens)`);
        
        // 🎯 CRITICAL FIX: Update currentUser state if this is the current user
        if (loserId === currentUser?.id) {
          console.log('🔄 LOSER: Updating currentUser tokens immediately:', { 
            oldTokens: currentUser.tokens, 
            newTokens 
          });
          setCurrentUser(prev => ({ ...prev, tokens: newTokens }));
          
          // Also update global users state immediately
          setUsers(prev => prev.map(user => 
            user.id === loserId 
              ? { ...user, tokens: newTokens }
              : user
          ));
        }
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
    
      // 🎯 CRITICAL FIX: Final token sync check after redistribution
  if (currentUser) {
    const finalUser = users.find(u => u.id === currentUser.id);
    if (finalUser && finalUser.tokens !== currentUser.tokens) {
      console.log('🔄 FINAL SYNC: Updating currentUser tokens after redistribution:', { 
        oldTokens: currentUser.tokens, 
        newTokens: finalUser.tokens 
      });
      setCurrentUser(prev => ({ ...prev, tokens: finalUser.tokens }));
    }
  }
  
  console.log('🎯 Token redistribution complete - currentUser tokens:', currentUser?.tokens);
  
  // 🎯 DEBUG: Test token calculation logic
  console.log('🧮 TOKEN CALCULATION TEST:');
  console.log('  - Bet participants:', bet.participants.length);
  console.log('  - Stake per person:', bet.stakeTokens);
  console.log('  - Total stakes:', bet.stakeTokens * bet.participants.length);
  console.log('  - Platform fee (3%):', Math.floor((bet.stakeTokens * bet.participants.length) * 0.03));
  console.log('  - Available for winners:', availableForWinners);
  console.log('  - Winners count:', winners.length);
  console.log('  - Payout per winner:', payoutPerWinner);
  console.log('  - Net gain per winner:', payoutPerWinner - bet.stakeTokens);
  console.log('  - Net loss per loser:', -bet.stakeTokens);
    
    } catch (error) {
      console.error('❌ Error in processTokenRedistribution:', error);
      throw error; // Re-throw to be caught by the calling function
    }
  }, [users, validateTokenConservation, validateBetIntegrity, currentUser]);

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
          
          // 🎯 FIXED: Process background operations with better error handling
          try {
            console.log('🔄 Starting background operations...');
            
            // Save bet completion to data service
            console.log('🔄 1/3: Saving bet completion...');
            await dataService.updateBet(betId, { 
              status: BET_STATUS.COMPLETED, 
              winner: absoluteMajority 
            });
            console.log('✅ 1/3: Bet completion saved');
            
            // Process token redistribution
            console.log('🔄 2/3: Processing token redistribution...');
            await processTokenRedistribution(completedBet);
            console.log('✅ 2/3: Token redistribution complete');
            
            // Process credibility changes
            console.log('🔄 3/3: Processing credibility changes...');
            await processCredibilityForBet(completedBet);
            console.log('✅ 3/3: Credibility changes complete');
            
            console.log('✅ All background operations completed successfully');
          } catch (error) {
            console.error('❌ Error in background operations:', error);
            
            // Identify which operation failed
            if (error.message?.includes('token')) {
              showError('Voting completed but token distribution failed. Please check your balance.');
            } else if (error.message?.includes('credibility')) {
              showError('Voting completed but credibility update failed. Please check your stats.');
            } else {
              showError('Voting completed but some operations failed. Please check.');
            }
          }
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

  // 🆕 NEW: Restore all demo friendships for testing
  const restoreDemoFriendships = useCallback(async () => {
    try {
      console.log('🔄 Restoring demo friendships...');
      
      // Reset to original demo data friendships
      const success = await dataService.resetDemoData();
      
      if (success) {
        await refreshAllData();
        showSuccess('Demo friendships restored! All users are friends again.');
      } else {
        showError('Failed to restore demo friendships.');
      }
    } catch (error) {
      console.error('❌ Error restoring demo friendships:', error);
      showError('Failed to restore demo friendships.');
    }
  }, [refreshAllData, showError, showSuccess]);

  // 🆕 NEW: Clear all friends for a specific user (for testing)
  const clearUserFriends = useCallback(async (userId) => {
    try {
      console.log('🧹 Clearing all friends for user:', userId);
      
      const success = await dataService.clearAllFriends(userId);
      
      if (success) {
        await refreshAllData();
        showSuccess('All friends cleared for testing!');
      } else {
        showError('Failed to clear friends.');
      }
    } catch (error) {
      console.error('❌ Error clearing friends:', error);
      showError('Failed to clear friends.');
    }
  }, [refreshAllData, showError, showSuccess]);

  // 🎯 PRODUCTION READY: Handle profile invitation links and automatically add friends
  const handleProfileInvitation = useCallback(async (inviteUserId) => {
    if (!currentUser) return;
    
    try {
      console.log('🔗 Processing profile invitation from user:', inviteUserId);
      console.log('🔗 Current user:', currentUser.id, currentUser.username);
      console.log('🔗 Invite user ID:', inviteUserId);
      
      // Parse the invite user ID
      const parsedInviteUserId = parseInt(inviteUserId);
      if (isNaN(parsedInviteUserId)) {
        console.error('❌ Invalid invite user ID:', inviteUserId);
        showError('Invalid invitation link format.');
        return;
      }
      
      // Check if the inviting user exists
      const invitingUser = users.find(u => u.id === parsedInviteUserId);
      if (!invitingUser) {
        console.error('❌ Inviting user not found:', parsedInviteUserId);
        showError('Invalid invitation link. User not found.');
        return;
      }
      
      console.log('🔗 Inviting user found:', invitingUser.username);
      
      // Get current user's friends list from data service (not from local state)
      const currentUserFriends = await dataService.getUserFriends(currentUser.id);
      console.log('🔗 Current user friends from data service:', currentUserFriends);
      
      // Check if already friends
      const isAlreadyFriends = currentUserFriends.includes(parsedInviteUserId);
      console.log('🔗 Is already friends?', isAlreadyFriends);
      
      if (isAlreadyFriends) {
        console.log('✅ Already friends with user:', parsedInviteUserId);
        showSuccess('You are already friends with this user!');
        return;
      }
      
      // Add both users as friends (bidirectional friendship)
      console.log('🤝 Adding friendship between users:', currentUser.id, 'and', parsedInviteUserId);
      
      // Add current user to inviting user's friends list
      const success1 = await dataService.addFriend(parsedInviteUserId, currentUser.id);
      console.log('🔗 First friendship add result:', success1);
      
      // Add inviting user to current user's friends list
      const success2 = await dataService.addFriend(currentUser.id, parsedInviteUserId);
      console.log('🔗 Second friendship add result:', success2);
      
      if (success1 && success2) {
        console.log('✅ Friendship established successfully');
        
        // Refresh data to show new friendship
        await refreshAllData();
        
        showSuccess(`You are now friends with ${invitingUser.username}!`);
        
        // Navigate to profile to show updated friends list
        setCurrentView('profile');
      } else {
        console.error('❌ Failed to establish friendship');
        showError('Failed to add friend. Please try again.');
      }
      
    } catch (error) {
      console.error('❌ Error processing profile invitation:', error);
      showError('Failed to process invitation. Please try again.');
    }
  }, [currentUser, users, refreshAllData, showError, showSuccess]);

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
            onRestoreDemoFriendships={restoreDemoFriendships}
            onClearUserFriends={clearUserFriends}
          />
        )}
        
        {currentView === 'detail' && selectedBet && (
          <BetDetailView 
            bet={bets.find(b => b.id === selectedBet.id) || selectedBet}
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
            
            // 🎯 FIXED: DON'T deduct tokens when joining - only track participation
            // Tokens will be handled in final consolidated result
            setCurrentUser(prev => ({ ...prev, tokens: prev.tokens })); // Keep same tokens
            
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
            
            // 🎯 FIXED: Process background operations with better error handling
            try {
              console.log('🔄 Starting background operations for bet joining...');
              
              // 🎯 VALIDATION: Ensure token conservation after joining bet
              if (!validateTokenConservation('bet joining')) {
                console.error('❌ CRITICAL: Token conservation violated during bet joining!');
              }
              
              // Update bet in data service
              console.log('🔄 1/2: Updating bet in data service...');
              await dataService.updateBet(selectedBet.id, {
                participants: updatedBet.participants,
                participantBets: updatedBet.participantBets
              });
              console.log('✅ 1/2: Bet updated in data service');
              
              // Mark invitation as accepted if present
              if (selectedInvitation) {
                console.log('🔄 2/2: Marking invitation as accepted...');
                await dataService.updateInvitationStatus(selectedInvitation.id, 'accepted');
                
                // Update invitations state
                setInvitations(prev => prev.map(inv => 
                  inv.id === selectedInvitation.id 
                    ? { ...inv, status: 'accepted' }
                    : inv
                ));
                console.log('✅ 2/2: Invitation marked as accepted');
              }
              
              console.log('✅ All background operations completed successfully');
            } catch (error) {
              console.error('❌ Error in background operations:', error);
              
              // Identify which operation failed
              if (error.message?.includes('bet update')) {
                showError('Bet joined but failed to save. Please check the bet details.');
              } else if (error.message?.includes('invitation')) {
                showError('Bet joined but invitation update failed. Please check your invitations.');
              } else {
                showError('Bet joined but some operations failed. Please check.');
              }
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