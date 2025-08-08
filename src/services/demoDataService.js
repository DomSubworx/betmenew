import { config } from '../config.js';

// Demo data storage
let demoUsers = [
  { id: 1, username: 'Maxim', email: 'maxim@example.com', friends: [2, 3, 4, 5, 6, 7, 8, 9], tokens: 1000, credibility: 100 },
  { id: 2, username: 'Moritz', email: 'moritz@example.com', friends: [1, 3, 4, 5, 6, 7, 8, 9], tokens: 1000, credibility: 100 },
  { id: 3, username: 'Dominik', email: 'dominik@example.com', friends: [1, 2, 4, 5, 6, 7, 8, 9], tokens: 1000, credibility: 100 },
  { id: 4, username: 'Niko', email: 'niko@example.com', friends: [1, 2, 3, 5, 6, 7, 8, 9], tokens: 1000, credibility: 100 },
  { id: 5, username: 'Alex', email: 'alex@example.com', friends: [1, 2, 3, 4, 6, 7, 8, 9], tokens: 1000, credibility: 100 },
  { id: 6, username: 'Eddy', email: 'eddy@example.com', friends: [1, 2, 3, 4, 5, 7, 8, 9], tokens: 1000, credibility: 100 },
  { id: 7, username: 'Patrick', email: 'patrick@example.com', friends: [1, 2, 3, 4, 5, 6, 8, 9], tokens: 1000, credibility: 100 },
  { id: 8, username: 'Human', email: 'human@example.com', friends: [1, 2, 3, 4, 5, 6, 7, 9], tokens: 1000, credibility: 100 },
  { id: 9, username: 'Vess', email: 'vess@example.com', friends: [1, 2, 3, 4, 5, 6, 7, 8], tokens: 1000, credibility: 100 }
];

let demoBets = [
  {
    id: 1,
    title: "Bayern wins against Dortmund",
    description: "Classic German football match",
    creatorId: 1,
    participants: [1, 2, 3],
    participantBets: { 1: "Bayern wins", 2: "Dortmund wins", 3: "Draw" },
    stakeTokens: 50,
    status: "active",
    votes: {},
    winner: null,
    chatMessages: [],
    outcomes: ["Bayern wins", "Dortmund wins", "Draw"],
    createdAt: new Date().toISOString(),
    // 🆕 NEW: Voting tracking fields
    votingStartTime: null,
    votedWithinWindow: {},
    majorityPunishmentApplied: false
  },
  {
    id: 2,
    title: "Who can do 100 push-ups?",
    description: "Fitness challenge among friends",
    creatorId: 5,
    participants: [5, 6, 7],
    participantBets: { 5: "No one makes it", 6: "One person makes it", 7: "Multiple people make it" },
    stakeTokens: 30,
    status: "voting",
    votes: {},
    winner: null,
    chatMessages: [],
    outcomes: ["No one makes it", "One person makes it", "Multiple people make it"],
    createdAt: new Date().toISOString(),
    // 🆕 NEW: Voting tracking fields
    votingStartTime: new Date().toISOString(), // Set to now for testing
    votedWithinWindow: {},
    majorityPunishmentApplied: false
  },
  {
    id: 3,
    title: "Test Voting Bet",
    description: "A simple test bet for voting mechanism",
    creatorId: 1,
    participants: [1, 2],
    participantBets: { 1: "Option A", 2: "Option B" },
    stakeTokens: 20,
    status: "voting",
    votes: {},
    winner: null,
    chatMessages: [],
    outcomes: ["Option A", "Option B"],
    createdAt: new Date().toISOString(),
    // 🆕 NEW: Voting tracking fields
    votingStartTime: new Date().toISOString(), // Set to now for testing
    votedWithinWindow: {},
    majorityPunishmentApplied: false
  }
];

let demoInvitations = [
  {
    id: 1,
    betId: 1,
    fromUserId: 1,
    toUserId: 4,
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    betId: 1,
    fromUserId: 1,
    toUserId: 5,
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    betId: 2,
    fromUserId: 5,
    toUserId: 8,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];
let demoUserProfiles = {};
let demoCredibilityLogs = [];
let demoTokenLogs = [];
let demoInviteLinks = {};

// 🆕 NEW: Track last manual test to prevent background interference
let lastManualTestTime = null;

// LocalStorage helpers
const STORAGE_KEYS = {
  USERS: 'betme_demo_users',
  BETS: 'betme_demo_bets',
  INVITATIONS: 'betme_demo_invitations',
  USER_PROFILES: 'betme_demo_user_profiles',
  CREDIBILITY_LOGS: 'betme_demo_credibility_logs',
  TOKEN_LOGS: 'betme_demo_token_logs',
  INVITE_LINKS: 'betme_demo_invite_links'
};

const saveToLocalStorage = (key, data) => {
  if (config.DEMO.PERSIST_TO_LOCALSTORAGE) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }
};

const loadFromLocalStorage = (key, defaultValue = []) => {
  if (config.DEMO.PERSIST_TO_LOCALSTORAGE) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return defaultValue;
    }
  }
  return defaultValue;
};

// Initialize data from localStorage
const initializeData = () => {
  console.log('📥 Loading data from localStorage...');
  demoUsers = loadFromLocalStorage(STORAGE_KEYS.USERS, demoUsers);
  demoBets = loadFromLocalStorage(STORAGE_KEYS.BETS, demoBets);
  demoInvitations = loadFromLocalStorage(STORAGE_KEYS.INVITATIONS, demoInvitations);
  demoUserProfiles = loadFromLocalStorage(STORAGE_KEYS.USER_PROFILES, demoUserProfiles);
  demoCredibilityLogs = loadFromLocalStorage(STORAGE_KEYS.CREDIBILITY_LOGS, demoCredibilityLogs);
  demoTokenLogs = loadFromLocalStorage(STORAGE_KEYS.TOKEN_LOGS, demoTokenLogs);
  demoInviteLinks = loadFromLocalStorage(STORAGE_KEYS.INVITE_LINKS, demoInviteLinks);
  
  console.log('📊 Loaded bets from localStorage:', demoBets);
  
  // 🎯 FIXED: Only reset if no bets exist at all, not for specific test bet
  if (demoBets.length === 0) {
    console.log('⚠️ No bets found, initializing with demo data...');
    // Only reset if there are no bets at all
    demoUsers = [
      { id: 1, username: 'Maxim', email: 'maxim@example.com', friends: [2, 3, 4, 5, 6, 7, 8, 9], tokens: 1000, credibility: 100 },
      { id: 2, username: 'Moritz', email: 'moritz@example.com', friends: [1, 3, 4, 5, 6, 7, 8, 9], tokens: 1000, credibility: 100 },
      { id: 3, username: 'Dominik', email: 'dominik@example.com', friends: [1, 2, 4, 5, 6, 7, 8, 9], tokens: 1000, credibility: 100 },
      { id: 4, username: 'Niko', email: 'niko@example.com', friends: [1, 2, 3, 5, 6, 7, 8, 9], tokens: 1000, credibility: 100 },
      { id: 5, username: 'Alex', email: 'alex@example.com', friends: [1, 2, 3, 4, 6, 7, 8, 9], tokens: 1000, credibility: 100 },
      { id: 6, username: 'Eddy', email: 'eddy@example.com', friends: [1, 2, 3, 4, 5, 7, 8, 9], tokens: 1000, credibility: 100 },
      { id: 7, username: 'Patrick', email: 'patrick@example.com', friends: [1, 2, 3, 4, 5, 6, 8, 9], tokens: 1000, credibility: 100 },
      { id: 8, username: 'Human', email: 'human@example.com', friends: [1, 2, 3, 4, 5, 6, 7, 9], tokens: 1000, credibility: 100 },
      { id: 9, username: 'Vess', email: 'vess@example.com', friends: [1, 2, 3, 4, 5, 6, 7, 8], tokens: 1000, credibility: 100 }
    ];
    
    demoBets = [
      {
        id: 1,
        title: "Bayern wins against Dortmund",
        description: "Classic German football match",
        creatorId: 1,
        participants: [1, 2, 3],
        participantBets: { 1: "Bayern wins", 2: "Dortmund wins", 3: "Draw" },
        stakeTokens: 50,
        status: "active",
        votes: {},
        winner: null,
        chatMessages: [],
        outcomes: ["Bayern wins", "Dortmund wins", "Draw"],
        createdAt: new Date().toISOString(),
        // 🆕 NEW: Voting tracking fields
        votingStartTime: null,
        votedWithinWindow: {},
        majorityPunishmentApplied: false
      },
      {
        id: 2,
        title: "Who can do 100 push-ups?",
        description: "Fitness challenge among friends",
        creatorId: 5,
        participants: [5, 6, 7],
        participantBets: { 5: "No one makes it", 6: "One person makes it", 7: "Multiple people make it" },
        stakeTokens: 30,
        status: "voting",
        votes: {},
        winner: null,
        chatMessages: [],
        outcomes: ["No one makes it", "One person makes it", "Multiple people make it"],
        createdAt: new Date().toISOString(),
        // 🆕 NEW: Voting tracking fields
        votingStartTime: new Date().toISOString(), // Set to now for testing
        votedWithinWindow: {},
        majorityPunishmentApplied: false
      },
      {
        id: 3,
        title: "Test Voting Bet",
        description: "A simple test bet for voting mechanism",
        creatorId: 1,
        participants: [1, 2],
        participantBets: { 1: "Option A", 2: "Option B" },
        stakeTokens: 20,
        status: "voting",
        votes: {},
        winner: null,
        chatMessages: [],
        outcomes: ["Option A", "Option B"],
        createdAt: new Date().toISOString(),
        // 🆕 NEW: Voting tracking fields
        votingStartTime: new Date().toISOString(), // Set to now for testing
        votedWithinWindow: {},
        majorityPunishmentApplied: false
      }
    ];
    
    demoInvitations = [
      {
        id: 1,
        betId: 1,
        fromUserId: 1,
        toUserId: 4,
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        betId: 1,
        fromUserId: 1,
        toUserId: 5,
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        betId: 2,
        fromUserId: 5,
        toUserId: 8,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ];
    demoUserProfiles = {};
    demoCredibilityLogs = [];
    demoInviteLinks = {};
    
    console.log('✅ Demo data reset with test bet included');
  }
  
  console.log('📊 Final bets after initialization:', demoBets);
};

// Auto-save functionality
let autoSaveInterval = null;

const startAutoSave = () => {
  if (autoSaveInterval) clearInterval(autoSaveInterval);
  
  autoSaveInterval = setInterval(() => {
    saveToLocalStorage(STORAGE_KEYS.USERS, demoUsers);
    saveToLocalStorage(STORAGE_KEYS.BETS, demoBets);
    saveToLocalStorage(STORAGE_KEYS.INVITATIONS, demoInvitations);
    saveToLocalStorage(STORAGE_KEYS.USER_PROFILES, demoUserProfiles);
    saveToLocalStorage(STORAGE_KEYS.CREDIBILITY_LOGS, demoCredibilityLogs);
    saveToLocalStorage(STORAGE_KEYS.INVITE_LINKS, demoInviteLinks);
  }, config.DEMO.AUTO_SAVE_INTERVAL);
};

const stopAutoSave = () => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
};

// Demo data service
export const demoDataService = {
  // Initialize the service
  initialize() {
    console.log('🚀 Initializing demo data service...');
    initializeData();
    startAutoSave();
    console.log('✅ Demo data service initialized');
  },

  // Cleanup
  cleanup() {
    stopAutoSave();
  },

  // User operations
  getUsers() {
    return Promise.resolve([...demoUsers]);
  },

  getUserByUsername(username) {
    const user = demoUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    return Promise.resolve(user || null);
  },

  updateUserTokens(userId, newTokens, reason = 'manual_update', betId = null, betTitle = null) {
    const userIndex = demoUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      const oldTokens = demoUsers[userIndex].tokens;
      const change = newTokens - oldTokens;
      
      demoUsers[userIndex] = { ...demoUsers[userIndex], tokens: newTokens };
      
      // Save to localStorage immediately
      saveToLocalStorage(STORAGE_KEYS.USERS, demoUsers);
      
      // Log the token change if there was a change
      if (change !== 0) {
        this.addTokenLog(userId, change, reason, betId, betTitle);
      }
      
      console.log('✅ User tokens updated and saved:', { userId, oldTokens, newTokens, change, reason });
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },

  updateUserCredibility(userId, change, reason, betId = null) {
    const userIndex = demoUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      const newCredibility = Math.max(0, Math.min(100, demoUsers[userIndex].credibility + change));
      demoUsers[userIndex] = { ...demoUsers[userIndex], credibility: newCredibility };
      
      // Add to credibility logs
      demoCredibilityLogs.push({
        id: Date.now(),
        userId,
        change,
        reason,
        betId,
        timestamp: new Date().toISOString(),
        newCredibility
      });
      
      // Save to localStorage immediately
      saveToLocalStorage(STORAGE_KEYS.USERS, demoUsers);
      saveToLocalStorage(STORAGE_KEYS.CREDIBILITY_LOGS, demoCredibilityLogs);
      
      console.log('✅ User credibility updated and saved:', { userId, change, newCredibility });
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },

  // Bet operations
  getBets() {
    // 🆕 NEW: Ensure backward compatibility for existing bets
    const bets = loadFromLocalStorage(STORAGE_KEYS.BETS, demoBets);
    
    // Add missing voting fields for backward compatibility
    const updatedBets = bets.map(bet => ({
      ...bet,
      votingStartTime: bet.votingStartTime || null,
      votedWithinWindow: bet.votedWithinWindow || {},
      majorityPunishmentApplied: bet.majorityPunishmentApplied || false
    }));
    
    return Promise.resolve(updatedBets);
  },

  createBet(betData) {
    const newBet = {
      id: Date.now(),
      title: betData.title,
      description: betData.description,
      creatorId: betData.creatorId,
      participants: betData.participants || [betData.creatorId], // Only creator initially
      participantBets: betData.participantBets || {}, // Only creator's bet initially
      stakeTokens: betData.stakeTokens,
      status: betData.status || 'active',
      votes: betData.votes || {},
      winner: betData.winner || null,
      chatMessages: betData.chatMessages || [],
      outcomes: betData.outcomes || [],
      createdAt: new Date().toISOString(),
      // 🆕 NEW: Voting tracking fields
      votingStartTime: null,
      votedWithinWindow: {},
      majorityPunishmentApplied: false
    };
    
    demoBets.unshift(newBet);
    
    // Save to localStorage immediately
    saveToLocalStorage(STORAGE_KEYS.BETS, demoBets);
    
    console.log('✅ Bet created and saved:', newBet);
    return Promise.resolve(newBet);
  },

  updateBet(betId, updates) {
    const betIndex = demoBets.findIndex(b => b.id === betId);
    if (betIndex !== -1) {
      demoBets[betIndex] = { ...demoBets[betIndex], ...updates };
      
      // Save to localStorage immediately
      saveToLocalStorage(STORAGE_KEYS.BETS, demoBets);
      
      console.log('✅ Bet updated and saved:', { betId, updates, result: demoBets[betIndex] });
      return Promise.resolve(demoBets[betIndex]);
    }
    return Promise.resolve(null);
  },

  // Invitation operations
  getInvitations(userId = null) {
    console.log('🎯 getInvitations called with userId:', userId);
    console.log('🎯 Current demoInvitations:', demoInvitations);
    
    let invitations = [...demoInvitations];
    if (userId) {
      invitations = invitations.filter(inv => inv.toUserId === userId && inv.status === 'pending');
      console.log('🎯 Filtered invitations for userId:', userId, invitations);
    }
    
    console.log('🎯 Returning invitations:', invitations);
    return Promise.resolve(invitations);
  },

  createInvitation(invitationData) {
    const newInvitation = {
      id: Date.now() + Math.random(),
      betId: invitationData.bet_id || invitationData.betId,
      fromUserId: invitationData.from_user_id || invitationData.fromUserId,
      toUserId: invitationData.to_user_id || invitationData.toUserId,
      status: invitationData.status || 'pending',
      createdAt: new Date().toISOString()
    };
    
    demoInvitations.push(newInvitation);
    
    // Save to localStorage immediately
    saveToLocalStorage(STORAGE_KEYS.INVITATIONS, demoInvitations);
    
    console.log('✅ Invitation created and saved:', newInvitation);
    return Promise.resolve(newInvitation);
  },

  updateInvitationStatus(invitationId, status) {
    const invitationIndex = demoInvitations.findIndex(inv => inv.id === invitationId);
    if (invitationIndex !== -1) {
      demoInvitations[invitationIndex] = { ...demoInvitations[invitationIndex], status };
      
      // Save to localStorage immediately
      saveToLocalStorage(STORAGE_KEYS.INVITATIONS, demoInvitations);
      
      console.log('✅ Invitation status updated and saved:', { invitationId, status, result: demoInvitations[invitationIndex] });
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },

  // User profile operations
  getUserProfiles() {
    return Promise.resolve({ ...demoUserProfiles });
  },

  updateUserProfile(userId, profileData) {
    demoUserProfiles[userId] = { ...demoUserProfiles[userId], ...profileData };
    
    // Save to localStorage immediately
    saveToLocalStorage(STORAGE_KEYS.USER_PROFILES, demoUserProfiles);
    
    console.log('✅ User profile updated and saved:', { userId, profileData });
    return Promise.resolve(true);
  },

  // Credibility logs
  getCredibilityLogs(userId) {
    const logs = userId 
      ? demoCredibilityLogs.filter(log => log.userId === userId)
      : demoCredibilityLogs;
    return Promise.resolve([...logs]);
  },

  // Token logs
  getTokenLogs(userId) {
    const logs = userId 
      ? demoTokenLogs.filter(log => log.userId === userId)
      : demoTokenLogs;
    return Promise.resolve([...logs]);
  },

  addTokenLog(userId, change, reason, betId = null, betTitle = null) {
    const log = {
      id: Date.now(),
      userId,
      change, // positive for gains, negative for losses
      reason, // 'bet_stake', 'bet_win', 'bet_loss', 'platform_fee', etc.
      betId,
      betTitle,
      timestamp: new Date().toISOString(),
      balanceAfter: null // Will be calculated when user tokens are updated
    };
    
    demoTokenLogs.unshift(log); // Add to beginning for newest first
    
    // Save to localStorage immediately
    saveToLocalStorage(STORAGE_KEYS.TOKEN_LOGS, demoTokenLogs);
    
    console.log('✅ Token log added and saved:', log);
    return Promise.resolve(log);
  },

  // Chat operations
  addChatMessage(betId, userId, message) {
    const betIndex = demoBets.findIndex(b => b.id === betId);
    if (betIndex !== -1) {
      const user = demoUsers.find(u => u.id === userId);
      const chatMessage = {
        id: Date.now(),
        userId,
        username: user?.username || 'Unknown',
        message,
        timestamp: new Date().toISOString()
      };
      
      demoBets[betIndex].chatMessages.push(chatMessage);
      
      // Save to localStorage immediately
      saveToLocalStorage(STORAGE_KEYS.BETS, demoBets);
      
      console.log('✅ Chat message added and saved:', chatMessage);
      return Promise.resolve(chatMessage);
    }
    return Promise.resolve(null);
  },

  // Friend operations
  addFriend(userId, friendId) {
    const userIndex = demoUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1 && !demoUsers[userIndex].friends.includes(friendId)) {
      demoUsers[userIndex].friends.push(friendId);
      
      // Save to localStorage immediately
      saveToLocalStorage(STORAGE_KEYS.USERS, demoUsers);
      
      console.log('✅ Friend added and saved:', { userId, friendId });
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },

  removeFriend(userId, friendId) {
    const userIndex = demoUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      demoUsers[userIndex].friends = demoUsers[userIndex].friends.filter(id => id !== friendId);
      
      // Save to localStorage immediately
      saveToLocalStorage(STORAGE_KEYS.USERS, demoUsers);
      
      console.log('✅ Friend removed and saved:', { userId, friendId });
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },

  // Invite link operations
  generateInviteLink(userId) {
    const inviteLink = `betme://invite/${userId}/${Date.now()}`;
    demoInviteLinks[userId] = inviteLink;
    return Promise.resolve(inviteLink);
  },

  // Reset demo data
  resetDemoData() {
    console.log('🔄 Resetting demo data...');
    demoUsers = [
      { id: 1, username: 'Maxim', email: 'maxim@example.com', friends: [2, 3, 4, 5, 6, 7, 8, 9], tokens: 1000, credibility: 100 },
      { id: 2, username: 'Moritz', email: 'moritz@example.com', friends: [1, 3, 4, 5, 6, 7, 8, 9], tokens: 1000, credibility: 100 },
      { id: 3, username: 'Dominik', email: 'dominik@example.com', friends: [1, 2, 4, 5, 6, 7, 8, 9], tokens: 1000, credibility: 100 },
      { id: 4, username: 'Niko', email: 'niko@example.com', friends: [1, 2, 3, 5, 6, 7, 8, 9], tokens: 1000, credibility: 100 },
      { id: 5, username: 'Alex', email: 'alex@example.com', friends: [1, 2, 3, 4, 6, 7, 8, 9], tokens: 1000, credibility: 100 },
      { id: 6, username: 'Eddy', email: 'eddy@example.com', friends: [1, 2, 3, 4, 5, 7, 8, 9], tokens: 1000, credibility: 100 },
      { id: 7, username: 'Patrick', email: 'patrick@example.com', friends: [1, 2, 3, 4, 5, 6, 8, 9], tokens: 1000, credibility: 100 },
      { id: 8, username: 'Human', email: 'human@example.com', friends: [1, 2, 3, 4, 5, 6, 7, 9], tokens: 1000, credibility: 100 },
      { id: 9, username: 'Vess', email: 'vess@example.com', friends: [1, 2, 3, 4, 5, 6, 7, 8], tokens: 1000, credibility: 100 }
    ];
    
    demoBets = [
      {
        id: 1,
        title: "Bayern wins against Dortmund",
        description: "Classic German football match",
        creatorId: 1,
        participants: [1, 2, 3],
        participantBets: { 1: "Bayern wins", 2: "Dortmund wins", 3: "Draw" },
        stakeTokens: 50,
        status: "active",
        votes: {},
        winner: null,
        chatMessages: [],
        outcomes: ["Bayern wins", "Dortmund wins", "Draw"],
        createdAt: new Date().toISOString(),
        // 🆕 NEW: Voting tracking fields
        votingStartTime: null,
        votedWithinWindow: {},
        majorityPunishmentApplied: false
      },
      {
        id: 2,
        title: "Who can do 100 push-ups?",
        description: "Fitness challenge among friends",
        creatorId: 5,
        participants: [5, 6, 7],
        participantBets: { 5: "No one makes it", 6: "One person makes it", 7: "Multiple people make it" },
        stakeTokens: 30,
        status: "voting",
        votes: {},
        winner: null,
        chatMessages: [],
        outcomes: ["No one makes it", "One person makes it", "Multiple people make it"],
        createdAt: new Date().toISOString(),
        // 🆕 NEW: Voting tracking fields
        votingStartTime: new Date().toISOString(), // Set to now for testing
        votedWithinWindow: {},
        majorityPunishmentApplied: false
      },
      {
        id: 3,
        title: "Test Voting Bet",
        description: "A simple test bet for voting mechanism",
        creatorId: 1,
        participants: [1, 2],
        participantBets: { 1: "Option A", 2: "Option B" },
        stakeTokens: 20,
        status: "voting",
        votes: {},
        winner: null,
        chatMessages: [],
        outcomes: ["Option A", "Option B"],
        createdAt: new Date().toISOString(),
        // 🆕 NEW: Voting tracking fields
        votingStartTime: new Date().toISOString(), // Set to now for testing
        votedWithinWindow: {},
        majorityPunishmentApplied: false
      }
    ];
    
    demoInvitations = [];
    demoUserProfiles = {};
    demoCredibilityLogs = [];
    demoTokenLogs = [];
    demoInviteLinks = {};
    
    saveToLocalStorage(STORAGE_KEYS.USERS, demoUsers);
    saveToLocalStorage(STORAGE_KEYS.BETS, demoBets);
    saveToLocalStorage(STORAGE_KEYS.INVITATIONS, demoInvitations);
    saveToLocalStorage(STORAGE_KEYS.USER_PROFILES, demoUserProfiles);
    saveToLocalStorage(STORAGE_KEYS.CREDIBILITY_LOGS, demoCredibilityLogs);
    saveToLocalStorage(STORAGE_KEYS.TOKEN_LOGS, demoTokenLogs);
    saveToLocalStorage(STORAGE_KEYS.INVITE_LINKS, demoInviteLinks);
    
    console.log('✅ Demo data reset complete');
    return Promise.resolve();
  },

  // 🆕 NEW: Process annulment for expired voting bets
  processBetAnnulment(betId) {
    console.log('🔄 Processing annulment for bet:', betId);
    
    const bet = demoBets.find(b => b.id === betId);
    if (!bet || bet.status !== 'voting') {
      console.log('❌ Bet not found or not in voting status:', betId);
      return Promise.resolve();
    }

    // 🆕 NEW: Prevent duplicate processing - check if already processed
    if (bet.status === 'annulled' || bet.majorityPunishmentApplied) {
      console.log('⚠️ Bet already processed for annulment:', betId);
      return Promise.resolve();
    }

    // 🆕 NEW: Mark as processing to prevent concurrent calls
    const processingBet = { ...bet, majorityPunishmentApplied: true };
    demoBets = demoBets.map(b => b.id === betId ? processingBet : b);
    saveToLocalStorage(STORAGE_KEYS.BETS, demoBets);
    
    console.log('🔒 Bet marked as processing, preventing duplicate calls');

    // Calculate token refunds with cancellation fee
    const cancellationFee = Math.floor(bet.stakeTokens * 0.20); // 20% cancellation fee
    const refundAmount = bet.stakeTokens - cancellationFee;
    
    console.log('💰 Annulment calculations:', {
      stakeTokens: bet.stakeTokens,
      cancellationFee,
      refundAmount
    });

    // Process refunds for all participants
    const refundPromises = bet.participants.map(participantId => {
      const user = demoUsers.find(u => u.id === participantId);
      if (!user) return Promise.resolve();

      const newTokens = user.tokens + refundAmount;
      demoUsers = demoUsers.map(u => 
        u.id === participantId ? { ...u, tokens: newTokens } : u
      );

      // Log token refund
      this.addTokenLog(participantId, refundAmount, 'bet_annulled_refund', betId, bet.title);
      
      console.log(`💰 Refunded ${refundAmount} tokens to ${user.username} (${cancellationFee} fee deducted)`);
      
      return this.updateUserTokens(participantId, newTokens, 'bet_annulled_refund', betId, bet.title);
    });

    // Apply credibility punishments for non-voting participants
    const nonVotingParticipants = bet.participants.filter(participantId => {
      const user = demoUsers.find(u => u.id === participantId);
      return user && !bet.votedWithinWindow[user.username];
    });

    console.log('🎯 Non-voting participants to punish:', nonVotingParticipants);

    const credibilityPromises = nonVotingParticipants.map(participantId => {
      const user = demoUsers.find(u => u.id === participantId);
      if (!user) return Promise.resolve();

      console.log(`🎯 Processing credibility punishment for ${user.username} (ID: ${participantId})`);
      
      // 🆕 FIXED: Remove duplicate log - updateUserCredibility already adds the log
      console.log(`🎯 Applied credibility punishment to ${user.username}: -10 points (no vote)`);
      
      return this.updateUserCredibility(participantId, -10, 'bet_annulled_no_vote', betId, bet.title);
    });

    // Check for absolute majority and apply majority credibility punishment
    const { calculateAbsoluteMajority, getParticipantsVotingAgainstMajority } = require('../utils.js');
    const absoluteMajority = calculateAbsoluteMajority(bet.votes, bet.participants.length);
    
    let majorityPunishmentPromises = [];
    if (absoluteMajority && !bet.majorityPunishmentApplied) {
      const dissenters = getParticipantsVotingAgainstMajority(bet, demoUsers, absoluteMajority);
      
      console.log('🎯 Dissenters to punish:', dissenters);
      
      majorityPunishmentPromises = dissenters.map(participantId => {
        const user = demoUsers.find(u => u.id === participantId);
        if (!user) return Promise.resolve();

        console.log(`🎯 Processing majority punishment for ${user.username} (ID: ${participantId})`);
        
        // 🆕 FIXED: Remove duplicate log - updateUserCredibility already adds the log
        console.log(`🎯 Applied majority credibility punishment to ${user.username}: -15 points (voted against majority)`);
        
        return this.updateUserCredibility(participantId, -15, 'bet_annulled_majority_dissent', betId, bet.title);
      });
    }

    // Update bet status to annulled
    const updatedBet = {
      ...bet,
      status: 'annulled',
      majorityPunishmentApplied: true
    };
    
    demoBets = demoBets.map(b => b.id === betId ? updatedBet : b);
    
    // Save all changes
    saveToLocalStorage(STORAGE_KEYS.USERS, demoUsers);
    saveToLocalStorage(STORAGE_KEYS.BETS, demoBets);
    
    console.log('✅ Bet annulment processed successfully');
    
    return Promise.all([...refundPromises, ...credibilityPromises, ...majorityPunishmentPromises]);
  },

  // 🆕 NEW: Check and process expired voting bets
  checkExpiredVotingBets() {
    console.log('🔄 Checking for expired voting bets...');
    
    // 🆕 NEW: Prevent background interference with manual tests
    if (lastManualTestTime && (Date.now() - lastManualTestTime) < 30000) { // 30 seconds
      console.log('⏰ Skipping background check - manual test was recent');
      return Promise.resolve();
    }
    
    const { isVotingWindowExpired } = require('../utils.js');
    const expiredBets = demoBets.filter(bet => 
      bet.status === 'voting' && 
      bet.votingStartTime && 
      isVotingWindowExpired(bet.votingStartTime)
    );
    
    console.log(`📅 Found ${expiredBets.length} expired voting bets`);
    
    const annulmentPromises = expiredBets.map(bet => this.processBetAnnulment(bet.id));
    
    return Promise.all(annulmentPromises);
  },

  // 🆕 NEW: Add credibility log entry
  addCredibilityLog(userId, change, reason, betId = null, betTitle = null) {
    const user = demoUsers.find(u => u.id === userId);
    if (!user) return;

    const logEntry = {
      id: Date.now() + Math.random(),
      userId,
      username: user.username,
      change,
      reason,
      betId,
      betTitle,
      timestamp: new Date().toISOString(),
      previousCredibility: user.credibility,
      newCredibility: user.credibility + change
    };

    demoCredibilityLogs.push(logEntry);
    saveToLocalStorage(STORAGE_KEYS.CREDIBILITY_LOGS, demoCredibilityLogs);
    
    console.log('📝 Added credibility log:', logEntry);
  },

  // 🆕 NEW: Test function to manually trigger annulment (for testing)
  testAnnulment(betId) {
    console.log('🧪 Testing annulment for bet:', betId);
    
    // 🆕 NEW: Set timestamp to prevent background interference
    lastManualTestTime = Date.now();
    console.log('⏰ Manual test timestamp set:', lastManualTestTime);
    
    const bet = demoBets.find(b => b.id === betId);
    if (!bet) {
      console.log('❌ Bet not found for testing:', betId);
      return Promise.resolve();
    }

    // 🆕 NEW: Prevent testing if already annulled
    if (bet.status === 'annulled') {
      console.log('⚠️ Bet already annulled, cannot test again:', betId);
      return Promise.resolve();
    }

    // Set voting start time to 4 days ago to simulate expiration
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    
    const updatedBet = {
      ...bet,
      votingStartTime: fourDaysAgo.toISOString()
    };
    
    demoBets = demoBets.map(b => b.id === betId ? updatedBet : b);
    saveToLocalStorage(STORAGE_KEYS.BETS, demoBets);
    
    console.log('✅ Test bet updated with expired voting time');
    
    return this.processBetAnnulment(betId);
  }
}; 