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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
  }
];

let demoInvitations = [];
let demoUserProfiles = {};
let demoCredibilityLogs = [];
let demoInviteLinks = {};

// LocalStorage helpers
const STORAGE_KEYS = {
  USERS: 'betme_demo_users',
  BETS: 'betme_demo_bets',
  INVITATIONS: 'betme_demo_invitations',
  USER_PROFILES: 'betme_demo_user_profiles',
  CREDIBILITY_LOGS: 'betme_demo_credibility_logs',
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
  demoUsers = loadFromLocalStorage(STORAGE_KEYS.USERS, demoUsers);
  demoBets = loadFromLocalStorage(STORAGE_KEYS.BETS, demoBets);
  demoInvitations = loadFromLocalStorage(STORAGE_KEYS.INVITATIONS, demoInvitations);
  demoUserProfiles = loadFromLocalStorage(STORAGE_KEYS.USER_PROFILES, demoUserProfiles);
  demoCredibilityLogs = loadFromLocalStorage(STORAGE_KEYS.CREDIBILITY_LOGS, demoCredibilityLogs);
  demoInviteLinks = loadFromLocalStorage(STORAGE_KEYS.INVITE_LINKS, demoInviteLinks);
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
    initializeData();
    startAutoSave();
    console.log('Demo data service initialized');
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

  updateUserTokens(userId, newTokens) {
    const userIndex = demoUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      demoUsers[userIndex] = { ...demoUsers[userIndex], tokens: newTokens };
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
      
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },

  // Bet operations
  getBets() {
    return Promise.resolve([...demoBets]);
  },

  createBet(betData) {
    const newBet = {
      id: Date.now(),
      title: betData.title,
      description: betData.description,
      creatorId: betData.creatorId,
      participants: betData.participants || [betData.creatorId],
      participantBets: betData.participantBets || {},
      stakeTokens: betData.stakeTokens,
      status: betData.status || 'active',
      votes: betData.votes || {},
      winner: betData.winner || null,
      chatMessages: betData.chatMessages || [],
      outcomes: betData.outcomes || [],
      createdAt: new Date().toISOString()
    };
    
    demoBets.unshift(newBet);
    return Promise.resolve(newBet);
  },

  updateBet(betId, updates) {
    const betIndex = demoBets.findIndex(b => b.id === betId);
    if (betIndex !== -1) {
      demoBets[betIndex] = { ...demoBets[betIndex], ...updates };
      return Promise.resolve(demoBets[betIndex]);
    }
    return Promise.resolve(null);
  },

  // Invitation operations
  getInvitations(userId = null) {
    let invitations = [...demoInvitations];
    if (userId) {
      invitations = invitations.filter(inv => inv.toUserId === userId && inv.status === 'pending');
    }
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
    return Promise.resolve(newInvitation);
  },

  updateInvitationStatus(invitationId, status) {
    const invitationIndex = demoInvitations.findIndex(inv => inv.id === invitationId);
    if (invitationIndex !== -1) {
      demoInvitations[invitationIndex] = { ...demoInvitations[invitationIndex], status };
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
    return Promise.resolve(true);
  },

  // Credibility logs
  getCredibilityLogs(userId) {
    const logs = userId 
      ? demoCredibilityLogs.filter(log => log.userId === userId)
      : demoCredibilityLogs;
    return Promise.resolve([...logs]);
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
      return Promise.resolve(chatMessage);
    }
    return Promise.resolve(null);
  },

  // Friend operations
  addFriend(userId, friendId) {
    const userIndex = demoUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1 && !demoUsers[userIndex].friends.includes(friendId)) {
      demoUsers[userIndex].friends.push(friendId);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },

  removeFriend(userId, friendId) {
    const userIndex = demoUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      demoUsers[userIndex].friends = demoUsers[userIndex].friends.filter(id => id !== friendId);
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
        createdAt: new Date().toISOString()
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
        createdAt: new Date().toISOString()
      }
    ];
    
    demoInvitations = [];
    demoUserProfiles = {};
    demoCredibilityLogs = [];
    demoInviteLinks = {};
    
    // Clear localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('Demo data reset to initial state');
  }
}; 