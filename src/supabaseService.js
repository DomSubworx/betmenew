import { supabase } from './supabaseClient.js';

// User management
export const supabaseService = {
  // Get all users
  async getUsers() {
    console.log('🔌 Supabase: getUsers() called');
    console.log('🔌 Supabase client:', supabase);
    console.log('🔌 Supabase URL:', supabase.supabaseUrl);
    
    try {
      console.log('🔌 Attempting to fetch users...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('username');
      
      console.log('🔌 Supabase response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase error fetching users:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return [];
      }
      
      console.log('✅ Supabase users fetched successfully:', data?.length || 0);
      
      return data.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        tokens: user.tokens,
        credibility: user.credibility,
        friends: user.friends || []
      }));
    } catch (err) {
      console.error('❌ Supabase exception in getUsers:', err);
      console.error('❌ Exception details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      return [];
    }
  },

  // Get user by username
  async getUserByUsername(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      tokens: data.tokens,
      credibility: data.credibility,
      friends: data.friends || []
    };
  },

  // Update user tokens
  async updateUserTokens(userId, newTokens) {
    const { error } = await supabase
      .rpc('update_user_tokens', {
        user_uuid: userId,
        new_tokens: newTokens
      });
    
    if (error) {
      console.error('Error updating user tokens:', error);
      return false;
    }
    
    return true;
  },

  // Update user credibility
  async updateUserCredibility(userId, change, reason, betId = null) {
    const { error } = await supabase
      .rpc('update_user_credibility', {
        user_uuid: userId,
        change_amount: change,
        reason_text: reason,
        bet_uuid: betId
      });
    
    if (error) {
      console.error('Error updating user credibility:', error);
      return false;
    }
    
    return true;
  },

  // Get all bets
  async getBets() {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching bets:', error);
      return [];
    }
    
    return data.map(bet => ({
      id: bet.id,
      title: bet.title,
      description: bet.description,
      creatorId: bet.creator_id,
      participants: bet.participants || [],
      participantBets: bet.participant_bets || {},
      stakeTokens: bet.stake_tokens || 0,
      status: bet.status,
      votes: bet.votes || {},
      winner: bet.winner,
      chatMessages: bet.chat_messages || [],
      votingStartTime: bet.voting_start_time,
      votedWithinWindow: bet.voted_within_window || {},
      majorityPunishmentApplied: bet.majority_punishment_applied || false,
      createdAt: bet.created_at,
      updatedAt: bet.updated_at
    }));
  },

  // Create a new bet
  async createBet(betData) {
    const { data, error } = await supabase
      .from('bets')
      .insert({
        title: betData.title,
        description: betData.description,
        creator_id: betData.creatorId,
        participants: betData.participants,
        participant_bets: betData.participantBets,
        stake_tokens: betData.stakeTokens,
        status: betData.status
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating bet:', error);
      return null;
    }
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      creatorId: data.creator_id,
      participants: data.participants,
      participantBets: data.participant_bets,
      stakeTokens: data.stake_tokens,
      status: data.status,
      votes: data.votes,
      winner: data.winner,
      chatMessages: data.chat_messages,
      votingStartTime: data.voting_start_time,
      votedWithinWindow: data.voted_within_window,
      majorityPunishmentApplied: data.majority_punishment_applied,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Update a bet
  async updateBet(betId, updates) {
    const { data, error } = await supabase
      .from('bets')
      .update(updates)
      .eq('id', betId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating bet:', error);
      return null;
    }
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      creatorId: data.creator_id,
      participants: data.participants,
      participantBets: data.participant_bets,
      stakeTokens: data.stake_tokens,
      status: data.status,
      votes: data.votes,
      winner: data.winner,
      chatMessages: data.chat_messages,
      votingStartTime: data.voting_start_time,
      votedWithinWindow: data.voted_within_window,
      majorityPunishmentApplied: data.majority_punishment_applied,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Get invitations
  async getInvitations(userId = null) {
    let query = supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('to_user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching invitations:', error);
      return [];
    }
    
    return data.map(invitation => ({
      id: invitation.id,
      betId: invitation.bet_id,
      fromUserId: invitation.from_user_id,
      toUserId: invitation.to_user_id,
      status: invitation.status,
      createdAt: invitation.created_at,
      updatedAt: invitation.updated_at
    }));
  },

  // Create invitation
  async createInvitation(invitationData) {
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        bet_id: invitationData.betId,
        from_user_id: invitationData.fromUserId,
        to_user_id: invitationData.toUserId,
        status: invitationData.status
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating invitation:', error);
      return null;
    }
    
    return {
      id: data.id,
      betId: data.bet_id,
      fromUserId: data.from_user_id,
      toUserId: data.to_user_id,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Update invitation status
  async updateInvitationStatus(invitationId, status) {
    const { data, error } = await supabase
      .from('invitations')
      .update({ status })
      .eq('id', invitationId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating invitation status:', error);
      return null;
    }
    
    return {
      id: data.id,
      betId: data.bet_id,
      fromUserId: data.from_user_id,
      toUserId: data.to_user_id,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Get user profiles
  async getUserProfiles() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (error) {
      console.error('Error fetching user profiles:', error);
      return {};
    }
    
    const profiles = {};
    data.forEach(profile => {
      profiles[profile.user_id] = {
        id: profile.id,
        userId: profile.user_id,
        profilePhoto: profile.profile_photo,
        inviteLinks: profile.invite_links || {},
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      };
    });
    
    return profiles;
  },

  // Get credibility logs
  async getCredibilityLogs(userId) {
    const { data, error } = await supabase
      .from('credibility_logs')
      .select(`
        *,
        bets(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching credibility logs:', error);
      return [];
    }
    
    return data.map(log => ({
      id: log.id,
      userId: log.user_id,
      betId: log.bet_id,
      change: log.change_amount,
      reason: log.reason,
      oldCredibility: log.old_credibility,
      newCredibility: log.new_credibility,
      timestamp: log.created_at,
      betTitle: log.bets?.title
    }));
  },

  // Get token logs
  async getTokenLogs(userId) {
    const { data, error } = await supabase
      .from('token_logs')
      .select(`
        *,
        bets(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching token logs:', error);
      return [];
    }
    
    return data.map(log => ({
      id: log.id,
      userId: log.user_id,
      betId: log.bet_id,
      change: log.change_amount,
      reason: log.reason,
      oldTokens: log.old_tokens,
      newTokens: log.new_tokens,
      timestamp: log.created_at,
      betTitle: log.bets?.title
    }));
  },

  // Add chat message
  async addChatMessage(betId, userId, message) {
    const { error } = await supabase
      .rpc('add_chat_message', {
        bet_uuid: betId,
        user_uuid: userId,
        message_text: message
      });
    
    if (error) {
      console.error('Error adding chat message:', error);
      return false;
    }
    
    return true;
  },

  // Add friend
  async addFriend(userId, friendId) {
    const { error } = await supabase
      .rpc('add_friend', {
        user_uuid: userId,
        friend_uuid: friendId
      });
    
    if (error) {
      console.error('Error adding friend:', error);
      return false;
    }
    
    return true;
  },

  // Remove friend
  async removeFriend(userId, friendId) {
    const { error } = await supabase
      .rpc('remove_friend', {
        user_uuid: userId,
        friend_uuid: friendId
      });
    
    if (error) {
      console.error('Error removing friend:', error);
      return false;
    }
    
    return true;
  },

  // Process bet annulment
  async processBetAnnulment(betId) {
    console.log('🔌 Supabase: processBetAnnulment() called for bet:', betId);
    
    try {
      const { data, error } = await supabase
        .rpc('process_bet_annulment', {
          bet_uuid: betId
        });
      
      console.log('🔌 Supabase processBetAnnulment response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase error processing bet annulment:', error);
        return false;
      }
      
      console.log('✅ Supabase bet annulment processed successfully');
      return true;
    } catch (err) {
      console.error('❌ Supabase exception in processBetAnnulment:', err);
      return false;
    }
  },

  // Check expired voting bets
  async checkExpiredVotingBets() {
    console.log('🔌 Supabase: checkExpiredVotingBets() called');
    
    try {
      const { data, error } = await supabase
        .rpc('check_expired_voting_bets');
      
      console.log('🔌 Supabase checkExpiredVotingBets response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase error checking expired voting bets:', error);
        return 0;
      }
      
      console.log('✅ Supabase expired voting bets checked successfully:', data);
      return data || 0;
    } catch (err) {
      console.error('❌ Supabase exception in checkExpiredVotingBets:', err);
      return 0;
    }
  },

  // Add credibility log
  async addCredibilityLog(userId, change, reason, betId = null) {
    console.log('🔌 Supabase: addCredibilityLog() called');
    
    try {
      const { data, error } = await supabase
        .from('credibility_logs')
        .insert({
          user_id: userId,
          bet_id: betId,
          change_amount: change,
          reason: reason,
          old_credibility: 0, // Will be updated by the function
          new_credibility: 0  // Will be updated by the function
        })
        .select()
        .single();
      
      console.log('🔌 Supabase addCredibilityLog response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase error adding credibility log:', error);
        return false;
      }
      
      console.log('✅ Supabase credibility log added successfully');
      return true;
    } catch (err) {
      console.error('❌ Supabase exception in addCredibilityLog:', err);
      return false;
    }
  },

  // Clear all friends for testing
  async clearAllFriends(userId) {
    console.log('🔌 Supabase: clearAllFriends() called for user:', userId);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ friends: [] })
        .eq('id', userId);
      
      if (error) {
        console.error('❌ Supabase error clearing friends:', error);
        return false;
      }
      
      console.log('✅ Supabase friends cleared successfully');
      return true;
    } catch (err) {
      console.error('❌ Supabase exception in clearAllFriends:', err);
      return false;
    }
  },

  // Get user friends
  async getUserFriends(userId) {
    console.log('🔌 Supabase: getUserFriends() called for user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('friends')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('❌ Supabase error getting user friends:', error);
        return [];
      }
      
      console.log('✅ Supabase user friends retrieved successfully:', data?.friends || []);
      return data?.friends || [];
    } catch (err) {
      console.error('❌ Supabase exception in getUserFriends:', err);
      return [];
    }
  },

  // Add bet result log
  async addBetResultLog(userId, change, reason, betId = null) {
    console.log('🔌 Supabase: addBetResultLog() called');
    
    try {
      const { data, error } = await supabase
        .from('token_logs')
        .insert({
          user_id: userId,
          bet_id: betId,
          change_amount: change,
          reason: reason,
          old_tokens: 0, // Will be updated by the function
          new_tokens: 0  // Will be updated by the function
        })
        .select()
        .single();
      
      console.log('🔌 Supabase addBetResultLog response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase error adding bet result log:', error);
        return false;
      }
      
      console.log('✅ Supabase bet result log added successfully');
      return true;
    } catch (err) {
      console.error('❌ Supabase exception in addBetResultLog:', err);
      return false;
    }
  },

  // Subscribe to real-time updates
  subscribeToBets(callback) {
    return supabase
      .channel('bets_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bets' 
      }, callback)
      .subscribe();
  },

  subscribeToInvitations(userId, callback) {
    return supabase
      .channel('invitations_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'invitations',
        filter: `to_user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  subscribeToChat(betId, callback) {
    return supabase
      .channel(`chat_${betId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'bets',
        filter: `id=eq.${betId}`
      }, callback)
      .subscribe();
  }
};
