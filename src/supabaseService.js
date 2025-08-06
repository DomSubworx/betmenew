import { supabase } from './supabaseClient.js';

// User management
export const supabaseService = {
  // Get all users
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('username');
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return data.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      tokens: user.tokens,
      credibility: user.credibility,
      friends: user.friends || []
    }));
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
      stakeTokens: bet.stake_tokens,
      status: bet.status,
      votes: bet.votes || {},
      winner: bet.winner,
      chatMessages: bet.chat_messages || [],
      createdAt: bet.created_at
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
        stake_tokens: betData.stakeTokens
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
      participants: data.participants || [],
      participantBets: data.participant_bets || {},
      stakeTokens: data.stake_tokens,
      status: data.status,
      votes: data.votes || {},
      winner: data.winner,
      chatMessages: data.chat_messages || [],
      createdAt: data.created_at
    };
  },

  // Update bet
  async updateBet(betId, updates) {
    const { data, error } = await supabase
      .from('bets')
      .update({
        title: updates.title,
        description: updates.description,
        participants: updates.participants,
        participant_bets: updates.participantBets,
        status: updates.status,
        votes: updates.votes,
        winner: updates.winner,
        chat_messages: updates.chatMessages
      })
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
      participants: data.participants || [],
      participantBets: data.participant_bets || {},
      stakeTokens: data.stake_tokens,
      status: data.status,
      votes: data.votes || {},
      winner: data.winner,
      chatMessages: data.chat_messages || [],
      createdAt: data.created_at
    };
  },

  // Get invitations for a user
  async getInvitations(userId) {
    const { data, error } = await supabase
      .from('invitations')
      .select(`
        *,
        bets!inner(*),
        from_user:users!invitations_from_user_id_fkey(username),
        to_user:users!invitations_to_user_id_fkey(username)
      `)
      .eq('to_user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching invitations:', error);
      return [];
    }
    
    return data.map(inv => ({
      id: inv.id,
      betId: inv.bet_id,
      fromUserId: inv.from_user_id,
      toUserId: inv.to_user_id,
      status: inv.status,
      createdAt: inv.created_at,
      bet: {
        id: inv.bets.id,
        title: inv.bets.title,
        description: inv.bets.description,
        creatorId: inv.bets.creator_id,
        participants: inv.bets.participants || [],
        participantBets: inv.bets.participant_bets || {},
        stakeTokens: inv.bets.stake_tokens,
        status: inv.bets.status,
        votes: inv.bets.votes || {},
        winner: inv.bets.winner,
        chatMessages: inv.bets.chat_messages || [],
        createdAt: inv.bets.created_at
      },
      fromUsername: inv.from_user?.username,
      toUsername: inv.to_user?.username
    }));
  },

  // Create invitation
  async createInvitation(invitationData) {
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        bet_id: invitationData.betId,
        from_user_id: invitationData.fromUserId,
        to_user_id: invitationData.toUserId
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
      createdAt: data.created_at
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
      console.error('Error updating invitation:', error);
      return null;
    }
    
    return {
      id: data.id,
      betId: data.bet_id,
      fromUserId: data.from_user_id,
      toUserId: data.to_user_id,
      status: data.status,
      createdAt: data.created_at
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
        profilePhoto: profile.profile_photo,
        inviteLinks: profile.invite_links || {}
      };
    });
    
    return profiles;
  },

  // Update user profile
  async updateUserProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        profile_photo: profileData.profilePhoto,
        invite_links: profileData.inviteLinks
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    return {
      profilePhoto: data.profile_photo,
      inviteLinks: data.invite_links || {}
    };
  },

  // Get credibility logs for a user
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