-- Functions and Enhanced RLS Policies Migration
-- This migration adds custom functions and improves security policies
-- Run this after the initial schema migration

-- Function to update user tokens with logging
CREATE OR REPLACE FUNCTION update_user_tokens(
    user_uuid UUID,
    new_tokens INTEGER,
    reason_text TEXT DEFAULT 'manual_update',
    bet_uuid UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    old_tokens INTEGER;
BEGIN
    -- Get current tokens
    SELECT tokens INTO old_tokens FROM public.users WHERE id = user_uuid;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update user tokens
    UPDATE public.users SET tokens = new_tokens WHERE id = user_uuid;
    
    -- Log the token change
    INSERT INTO public.token_logs (user_id, bet_id, change_amount, reason, old_tokens, new_tokens)
    VALUES (user_uuid, bet_uuid, new_tokens - old_tokens, reason_text, old_tokens, new_tokens);
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user credibility with logging
CREATE OR REPLACE FUNCTION update_user_credibility(
    user_uuid UUID,
    change_amount INTEGER,
    reason_text TEXT,
    bet_uuid UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    old_credibility INTEGER;
    new_credibility INTEGER;
BEGIN
    -- Get current credibility
    SELECT credibility INTO old_credibility FROM public.users WHERE id = user_uuid;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate new credibility (clamp between 0 and 100)
    new_credibility := GREATEST(0, LEAST(100, old_credibility + change_amount));
    
    -- Update user credibility
    UPDATE public.users SET credibility = new_credibility WHERE id = user_uuid;
    
    -- Log the credibility change
    INSERT INTO public.credibility_logs (user_id, bet_id, change_amount, reason, old_credibility, new_credibility)
    VALUES (user_uuid, bet_uuid, change_amount, reason_text, old_credibility, new_credibility);
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a friend
CREATE OR REPLACE FUNCTION add_friend(
    user_uuid UUID,
    friend_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Add friend to user's friends list
    UPDATE public.users 
    SET friends = array_append(friends, friend_uuid)
    WHERE id = user_uuid AND NOT (friend_uuid = ANY(friends));
    
    -- Add user to friend's friends list
    UPDATE public.users 
    SET friends = array_append(friends, user_uuid)
    WHERE id = friend_uuid AND NOT (user_uuid = ANY(friends));
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove a friend
CREATE OR REPLACE FUNCTION remove_friend(
    user_uuid UUID,
    friend_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Remove friend from user's friends list
    UPDATE public.users 
    SET friends = array_remove(friends, friend_uuid)
    WHERE id = user_uuid;
    
    -- Remove user from friend's friends list
    UPDATE public.users 
    SET friends = array_remove(friends, user_uuid)
    WHERE id = friend_uuid;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a chat message to a bet
CREATE OR REPLACE FUNCTION add_chat_message(
    bet_uuid UUID,
    user_uuid UUID,
    message_text TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    message_data JSONB;
BEGIN
    -- Create message object
    message_data := jsonb_build_object(
        'id', gen_random_uuid(),
        'userId', user_uuid,
        'username', (SELECT username FROM public.users WHERE id = user_uuid),
        'message', message_text,
        'timestamp', NOW()
    );
    
    -- Add message to bet's chat
    UPDATE public.bets 
    SET chat_messages = chat_messages || message_data
    WHERE id = bet_uuid;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process bet annulment
CREATE OR REPLACE FUNCTION process_bet_annulment(
    bet_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    bet_record RECORD;
    participant_uuid UUID;
    refund_amount INTEGER;
    cancellation_fee INTEGER;
    final_refund INTEGER;
BEGIN
    -- Get bet information
    SELECT * INTO bet_record FROM public.bets WHERE id = bet_uuid;
    
    IF NOT FOUND OR bet_record.status != 'voting' THEN
        RETURN FALSE;
    END IF;
    
    -- Process each participant
    FOREACH participant_uuid IN ARRAY bet_record.participants
    LOOP
        -- Calculate refund (stake minus 20% cancellation fee)
        refund_amount := bet_record.stake_tokens;
        cancellation_fee := (refund_amount * 20) / 100;
        final_refund := refund_amount - cancellation_fee;
        
        -- Refund tokens to participant
        PERFORM update_user_tokens(
            participant_uuid, 
            (SELECT tokens FROM public.users WHERE id = participant_uuid) + final_refund,
            'bet_annulment_refund',
            bet_uuid
        );
        
        -- Apply credibility punishment for not voting
        IF NOT (participant_uuid::text = ANY(bet_record.voted_within_window::text[])) THEN
            PERFORM update_user_credibility(
                participant_uuid,
                -10,
                'Did not vote within voting window',
                bet_uuid
            );
        END IF;
    END LOOP;
    
    -- Update bet status to annulled
    UPDATE public.bets SET status = 'annulled' WHERE id = bet_uuid;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and process expired voting bets
CREATE OR REPLACE FUNCTION check_expired_voting_bets()
RETURNS INTEGER AS $$
DECLARE
    expired_bet RECORD;
    processed_count INTEGER := 0;
BEGIN
    -- Find bets that have been in voting status for more than 3 days
    FOR expired_bet IN 
        SELECT id FROM public.bets 
        WHERE status = 'voting' 
        AND voting_start_time < NOW() - INTERVAL '3 days'
    LOOP
        -- Process the expired bet
        IF process_bet_annulment(expired_bet.id) THEN
            processed_count := processed_count + 1;
        END IF;
    END LOOP;
    
    RETURN processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced RLS policies for better security

-- Drop existing basic policies
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Enhanced user policies
CREATE POLICY "Users can view all users" ON public.users 
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.users 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Enhanced bet policies
DROP POLICY IF EXISTS "Users can view all bets" ON public.bets;
DROP POLICY IF EXISTS "Users can create bets" ON public.bets;
DROP POLICY IF EXISTS "Users can update bets they created or participate in" ON public.bets;

CREATE POLICY "Users can view all bets" ON public.bets 
    FOR SELECT USING (true);

CREATE POLICY "Users can create bets" ON public.bets 
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update bets they created or participate in" ON public.bets 
    FOR UPDATE USING (
        auth.uid() = creator_id OR 
        auth.uid()::text = ANY(participants::text[])
    );

-- Enhanced invitation policies
DROP POLICY IF EXISTS "Users can view invitations they sent or received" ON public.invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can update invitations they received" ON public.invitations;

CREATE POLICY "Users can view invitations they sent or received" ON public.invitations 
    FOR SELECT USING (
        auth.uid() = from_user_id OR 
        auth.uid() = to_user_id
    );

CREATE POLICY "Users can create invitations" ON public.invitations 
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update invitations they received" ON public.invitations 
    FOR UPDATE USING (auth.uid() = to_user_id);

-- Enhanced credibility logs policies
DROP POLICY IF EXISTS "Users can view all credibility logs" ON public.credibility_logs;
DROP POLICY IF EXISTS "System can insert credibility logs" ON public.credibility_logs;

CREATE POLICY "Users can view all credibility logs" ON public.credibility_logs 
    FOR SELECT USING (true);

CREATE POLICY "System can insert credibility logs" ON public.credibility_logs 
    FOR INSERT WITH CHECK (true);

-- Enhanced token logs policies
DROP POLICY IF EXISTS "Users can view their own token logs" ON public.token_logs;
DROP POLICY IF EXISTS "System can insert token logs" ON public.token_logs;

CREATE POLICY "Users can view their own token logs" ON public.token_logs 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert token logs" ON public.token_logs 
    FOR INSERT WITH CHECK (true);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION update_user_tokens(UUID, INTEGER, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_credibility(UUID, INTEGER, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION add_friend(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_friend(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION add_chat_message(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION process_bet_annulment(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_expired_voting_bets() TO authenticated;

-- Add function comments
COMMENT ON FUNCTION update_user_tokens(UUID, INTEGER, TEXT, UUID) IS 'Updates user tokens and logs the change';
COMMENT ON FUNCTION update_user_credibility(UUID, INTEGER, TEXT, UUID) IS 'Updates user credibility and logs the change';
COMMENT ON FUNCTION add_friend(UUID, UUID) IS 'Adds a bidirectional friendship between two users';
COMMENT ON FUNCTION remove_friend(UUID, UUID) IS 'Removes a bidirectional friendship between two users';
COMMENT ON FUNCTION add_chat_message(UUID, UUID, TEXT) IS 'Adds a chat message to a bet';
COMMENT ON FUNCTION process_bet_annulment(UUID) IS 'Processes bet annulment with refunds and penalties';
COMMENT ON FUNCTION check_expired_voting_bets() IS 'Checks for and processes expired voting bets';
