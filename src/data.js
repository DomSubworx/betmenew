// Demo data and data management for BetMe app
import { saveToLocalStorage, loadFromLocalStorage } from './utils.js';

// Demo users data
export const demoUsers = [
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

// Demo bets data
export const demoBets = [
  {
    id: 1,
    title: "Bayern gewinnt gegen Dortmund",
    description: "Klassiker im deutschen Fußball",
    creatorId: 1,
    participants: [1, 2, 3],
    outcomes: ["Bayern gewinnt", "Dortmund gewinnt", "Unentschieden"],
    stakeTokens: 50,
    status: "active",
    votes: {},
    winner: null,
    createdAt: new Date().toISOString(),
    chatMessages: [
      {
        id: 1,
        userId: 1,
        username: "Maxim",
        message: "Hey Leute! Wer ist dabei bei der Bayern-Dortmund Wette? 🏆",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        userId: 2,
        username: "Moritz",
        message: "Ich bin dabei! Bayern wird gewinnen 💪",
        timestamp: new Date(Date.now() - 3500000).toISOString()
      },
      {
        id: 3,
        userId: 3,
        username: "Dominik",
        message: "Dortmund hat auch eine Chance! 🟡⚫",
        timestamp: new Date(Date.now() - 3400000).toISOString()
      },
      {
        id: 4,
        userId: 1,
        username: "Maxim",
        message: "Spannend! Wer setzt auf was?",
        timestamp: new Date(Date.now() - 3300000).toISOString()
      }
    ]
  },
  {
    id: 2,
    title: "Wer schafft 100 Liegestütze?",
    description: "Fitness-Challenge unter Freunden",
    creatorId: 5,
    participants: [5, 6, 7],
    outcomes: ["Niemand schafft es", "Einer schafft es", "Mehrere schaffen es"],
    stakeTokens: 30,
    status: "voting",
    votes: {},
    winner: null,
    createdAt: new Date().toISOString(),
    chatMessages: [
      {
        id: 1,
        userId: 5,
        username: "Alex",
        message: "Fitness-Challenge! Wer schafft 100 Liegestütze? 💪",
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 2,
        userId: 6,
        username: "Eddy",
        message: "Das wird hart! Aber ich bin dabei 🏋️",
        timestamp: new Date(Date.now() - 7100000).toISOString()
      },
      {
        id: 3,
        userId: 7,
        username: "Patrick",
        message: "100? Das schafft keiner von uns 😅",
        timestamp: new Date(Date.now() - 7000000).toISOString()
      }
    ]
  }
];

// Data loading functions
export const loadInitialData = () => {
  // Load users with tokens and credibility
  const savedTokens = loadFromLocalStorage('betme-user-tokens');
  const savedCredibility = loadFromLocalStorage('betme-user-credibility');
  const users = demoUsers.map(user => ({
    ...user,
    tokens: savedTokens?.[user.id] || 1000,
    credibility: savedCredibility?.[user.id] || 100
  }));

  // Load other data
  const invitations = loadFromLocalStorage('betme-invitations', []);
  const bets = loadFromLocalStorage('betme-bets', demoBets);
  const userProfiles = loadFromLocalStorage('betme-user-profiles', {});
  const inviteLinks = loadFromLocalStorage('betme-invite-links', {});
  const credibilityLogs = loadFromLocalStorage('betme-credibility-logs', []);

  return { users, invitations, bets, userProfiles, inviteLinks, credibilityLogs };
};

// Data saving functions
export const saveUsers = (users) => {
  const tokenData = {};
  users.forEach(user => {
    tokenData[user.id] = user.tokens;
  });
  saveToLocalStorage('betme-user-tokens', tokenData);
};

export const saveInvitations = (invitations) => {
  saveToLocalStorage('betme-invitations', invitations);
};

export const saveBets = (bets) => {
  saveToLocalStorage('betme-bets', bets);
};

export const saveUserProfiles = (userProfiles) => {
  saveToLocalStorage('betme-user-profiles', userProfiles);
};

export const saveInviteLinks = (inviteLinks) => {
  saveToLocalStorage('betme-invite-links', inviteLinks);
};

export const saveCredibility = (users) => {
  const credibilityData = {};
  users.forEach(user => {
    credibilityData[user.id] = user.credibility;
  });
  saveToLocalStorage('betme-user-credibility', credibilityData);
};

export const saveCredibilityLogs = (credibilityLogs) => {
  saveToLocalStorage('betme-credibility-logs', credibilityLogs);
}; 