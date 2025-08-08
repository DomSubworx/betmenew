import { isDemoMode, shouldUseSupabase } from '../config.js';
import { demoDataService } from './demoDataService.js';
import { supabaseService } from '../supabaseService.js';

// Unified data service that routes to appropriate backend
export const dataService = {
  // Initialize the appropriate service
  initialize() {
    if (isDemoMode()) {
      demoDataService.initialize();
      console.log('Using demo data service');
    } else if (shouldUseSupabase()) {
      console.log('Using Supabase service');
    } else {
      demoDataService.initialize();
      console.log('Falling back to demo data service');
    }
  },

  // Cleanup
  cleanup() {
    if (isDemoMode()) {
      demoDataService.cleanup();
    }
  },

  // User operations
  async getUsers() {
    if (isDemoMode()) {
      return demoDataService.getUsers();
    }
    return supabaseService.getUsers();
  },

  async getUserByUsername(username) {
    if (isDemoMode()) {
      return demoDataService.getUserByUsername(username);
    }
    return supabaseService.getUserByUsername(username);
  },

  async updateUserTokens(userId, newTokens, reason = 'manual_update', betId = null, betTitle = null) {
    if (isDemoMode()) {
      return demoDataService.updateUserTokens(userId, newTokens, reason, betId, betTitle);
    }
    return supabaseService.updateUserTokens(userId, newTokens);
  },

  async updateUserCredibility(userId, change, reason, betId = null) {
    if (isDemoMode()) {
      return demoDataService.updateUserCredibility(userId, change, reason, betId);
    }
    return supabaseService.updateUserCredibility(userId, change, reason, betId);
  },

  // Bet operations
  async getBets() {
    if (isDemoMode()) {
      return demoDataService.getBets();
    }
    return supabaseService.getBets();
  },

  async createBet(betData) {
    if (isDemoMode()) {
      return demoDataService.createBet(betData);
    }
    return supabaseService.createBet(betData);
  },

  async updateBet(betId, updates) {
    if (isDemoMode()) {
      return demoDataService.updateBet(betId, updates);
    }
    return supabaseService.updateBet(betId, updates);
  },

  // Invitation operations
  async getInvitations(userId = null) {
    if (isDemoMode()) {
      return demoDataService.getInvitations(userId);
    }
    return supabaseService.getInvitations(userId);
  },

  async createInvitation(invitationData) {
    if (isDemoMode()) {
      return demoDataService.createInvitation(invitationData);
    }
    return supabaseService.createInvitation(invitationData);
  },

  async updateInvitationStatus(invitationId, status) {
    if (isDemoMode()) {
      return demoDataService.updateInvitationStatus(invitationId, status);
    }
    return supabaseService.updateInvitationStatus(invitationId, status);
  },

  // User profile operations
  async getUserProfiles() {
    if (isDemoMode()) {
      return demoDataService.getUserProfiles();
    }
    return supabaseService.getUserProfiles();
  },

  async updateUserProfile(userId, profileData) {
    if (isDemoMode()) {
      return demoDataService.updateUserProfile(userId, profileData);
    }
    return supabaseService.updateUserProfile(userId, profileData);
  },

  // Credibility logs
  async getCredibilityLogs(userId) {
    if (isDemoMode()) {
      return demoDataService.getCredibilityLogs(userId);
    }
    return supabaseService.getCredibilityLogs(userId);
  },

  // Token logs
  async getTokenLogs(userId) {
    if (isDemoMode()) {
      return demoDataService.getTokenLogs(userId);
    } else {
      return supabaseService.getTokenLogs(userId);
    }
  },

  addTokenLog(userId, change, reason, betId = null, betTitle = null) {
    if (isDemoMode()) {
      return demoDataService.addTokenLog(userId, change, reason, betId, betTitle);
    } else {
      return supabaseService.addTokenLog(userId, change, reason, betId, betTitle);
    }
  },

  // 🆕 NEW: Annulment and voting management functions
  processBetAnnulment(betId) {
    if (isDemoMode()) {
      return demoDataService.processBetAnnulment(betId);
    } else {
      return supabaseService.processBetAnnulment(betId);
    }
  },

  checkExpiredVotingBets() {
    if (isDemoMode()) {
      return demoDataService.checkExpiredVotingBets();
    } else {
      return supabaseService.checkExpiredVotingBets();
    }
  },

  addCredibilityLog(userId, change, reason, betId = null, betTitle = null) {
    if (isDemoMode()) {
      return demoDataService.addCredibilityLog(userId, change, reason, betId, betTitle);
    } else {
      return supabaseService.addCredibilityLog(userId, change, reason, betId, betTitle);
    }
  },

  // 🆕 NEW: Test function for manual annulment testing
  testAnnulment(betId) {
    if (isDemoMode()) {
      return demoDataService.testAnnulment(betId);
    } else {
      console.log('🧪 Test annulment only available in demo mode');
      return Promise.resolve();
    }
  },

  // Chat operations
  async addChatMessage(betId, userId, message) {
    if (isDemoMode()) {
      return demoDataService.addChatMessage(betId, userId, message);
    }
    return supabaseService.addChatMessage(betId, userId, message);
  },

  // Friend operations
  async addFriend(userId, friendId) {
    if (isDemoMode()) {
      return demoDataService.addFriend(userId, friendId);
    }
    return supabaseService.addFriend(userId, friendId);
  },

  async removeFriend(userId, friendId) {
    if (isDemoMode()) {
      return demoDataService.removeFriend(userId, friendId);
    }
    return supabaseService.removeFriend(userId, friendId);
  },

  // Invite link operations
  async generateInviteLink(userId) {
    if (isDemoMode()) {
      return demoDataService.generateInviteLink(userId);
    }
    // For Supabase, you might want to implement a different invite link system
    return Promise.resolve(`betme://invite/${userId}/${Date.now()}`);
  },

  // Real-time subscriptions (only for Supabase)
  subscribeToBets(callback) {
    if (isDemoMode()) {
      // For demo mode, we could implement a simple polling mechanism
      console.log('Real-time subscriptions not available in demo mode');
      return () => {};
    }
    return supabaseService.subscribeToBets(callback);
  },

  subscribeToInvitations(userId, callback) {
    if (isDemoMode()) {
      console.log('Real-time subscriptions not available in demo mode');
      return () => {};
    }
    return supabaseService.subscribeToInvitations(userId, callback);
  },

  subscribeToChat(betId, callback) {
    if (isDemoMode()) {
      console.log('Real-time subscriptions not available in demo mode');
      return () => {};
    }
    return supabaseService.subscribeToChat(betId, callback);
  },

  // Demo-specific operations
  resetDemoData() {
    if (isDemoMode()) {
      return demoDataService.resetDemoData();
          }
      console.warn('resetDemoData only available in demo mode');
    },

    // 🆕 NEW: Function to log consolidated bet results
    addBetResultLog(userId, betId, betTitle, finalDelta, reason) {
      if (isDemoMode()) {
        return demoDataService.addBetResultLog(userId, betId, betTitle, finalDelta, reason);
      } else {
        return supabaseService.addBetResultLog(userId, betId, betTitle, finalDelta, reason);
      }
    },

    logBetFinalResult(userId, betId, betTitle, bet) {
      if (isDemoMode()) {
        return demoDataService.logBetFinalResult(userId, betId, betTitle, bet);
      } else {
        return supabaseService.logBetFinalResult(userId, betId, betTitle, bet);
      }
    }
  };  