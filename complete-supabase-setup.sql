-- Complete Supabase Setup for Bet Me If You Can App
-- Run this in your Supabase Dashboard → SQL Editor

-- 1. Create missing tables

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    profile_photo TEXT,
    invite_links JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credibility logs table
CREATE TABLE IF NOT EXISTS public.credibility_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    bet_id UUID REFERENCES public.bets(id) ON DELETE SET NULL,
    change_amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    old_credibility INTEGER NOT NULL,
    new_credibility INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_credibility_logs_user_id ON public.credibility_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_credibility_logs_bet_id ON public.credibility_logs(bet_id);

-- 3. Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credibility_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create RLS policies for credibility_logs
CREATE POLICY "Users can view all credibility logs" ON public.credibility_logs
    FOR SELECT USING (true);

CREATE POLICY "System can insert credibility logs" ON public.credibility_logs
    FOR INSERT WITH CHECK (true);

-- 6. Create functions for common operations

-- Function to update user tokens
CREATE OR REPLACE FUNCTION update_user_tokens(user_uuid INTEGER, new_tokens INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE public.users 
    SET tokens = new_tokens, updated_at = NOW()
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user credibility
CREATE OR REPLACE FUNCTION update_user_credibility(
    user_uuid INTEGER, 
    change_amount INTEGER, 
    reason_text TEXT, 
    bet_uuid UUID DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    old_cred INTEGER;
    new_cred INTEGER;
BEGIN
    -- Get current credibility
    SELECT credibility INTO old_cred FROM public.users WHERE id = user_uuid;
    
    -- Calculate new credibility (clamped between 0 and 100)
    new_cred := GREATEST(0, LEAST(100, old_cred + change_amount));
    
    -- Update user credibility
    UPDATE public.users 
    SET credibility = new_cred, updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Log the change
    INSERT INTO public.credibility_logs (
        user_id, bet_id, change_amount, reason, old_credibility, new_credibility
    ) VALUES (
        user_uuid, bet_uuid, change_amount, reason_text, old_cred, new_cred
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add friend
CREATE OR REPLACE FUNCTION add_friend(user_uuid INTEGER, friend_uuid INTEGER)
RETURNS void AS $$
BEGIN
    -- Add friend to user's friends list
    UPDATE public.users 
    SET friends = array_append(friends, friend_uuid), updated_at = NOW()
    WHERE id = user_uuid AND NOT (friend_uuid = ANY(friends));
    
    -- Add user to friend's friends list
    UPDATE public.users 
    SET friends = array_append(friends, user_uuid), updated_at = NOW()
    WHERE id = friend_uuid AND NOT (user_uuid = ANY(friends));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove friend
CREATE OR REPLACE FUNCTION remove_friend(user_uuid INTEGER, friend_uuid INTEGER)
RETURNS void AS $$
BEGIN
    -- Remove friend from user's friends list
    UPDATE public.users 
    SET friends = array_remove(friends, friend_uuid), updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Remove user from friend's friends list
    UPDATE public.users 
    SET friends = array_remove(friends, user_uuid), updated_at = NOW()
    WHERE id = friend_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add chat message
CREATE OR REPLACE FUNCTION add_chat_message(
    bet_uuid UUID,
    user_uuid INTEGER,
    message_text TEXT
)
RETURNS void AS $$
DECLARE
    username_text TEXT;
    new_message JSONB;
BEGIN
    -- Get username
    SELECT username INTO username_text FROM public.users WHERE id = user_uuid;
    
    -- Create message object
    new_message := jsonb_build_object(
        'id', extract(epoch from now()) * 1000,
        'userId', user_uuid,
        'username', username_text,
        'message', message_text,
        'timestamp', now()
    );
    
    -- Add message to bet
    UPDATE public.bets 
    SET chat_messages = chat_messages || new_message, updated_at = NOW()
    WHERE id = bet_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Apply triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Insert demo user profiles
INSERT INTO public.user_profiles (user_id, profile_photo, invite_links) VALUES
    (1, null, '{}'),
    (2, null, '{}'),
    (3, null, '{}'),
    (4, null, '{}'),
    (5, null, '{}'),
    (6, null, '{}'),
    (7, null, '{}'),
    (8, null, '{}'),
    (9, null, '{}')
ON CONFLICT (user_id) DO NOTHING;

-- 10. Verify setup
SELECT 'Setup completed successfully!' as status; 