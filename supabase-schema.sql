-- Supabase Database Schema for Bet Me If You Can App

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    tokens INTEGER DEFAULT 1000,
    credibility INTEGER DEFAULT 100,
    friends INTEGER[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    profile_photo TEXT,
    invite_links JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bets table
CREATE TABLE IF NOT EXISTS public.bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    participants INTEGER[] NOT NULL,
    participant_bets JSONB DEFAULT '{}',
    stake_tokens INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'voting', 'completed')),
    votes JSONB DEFAULT '{}',
    winner TEXT,
    chat_messages JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bet_id UUID REFERENCES public.bets(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credibility logs table
CREATE TABLE IF NOT EXISTS public.credibility_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    bet_id UUID REFERENCES public.bets(id) ON DELETE SET NULL,
    change_amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    old_credibility INTEGER NOT NULL,
    new_credibility INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_bets_creator_id ON public.bets(creator_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON public.bets(status);
CREATE INDEX IF NOT EXISTS idx_invitations_to_user_id ON public.invitations(to_user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
CREATE INDEX IF NOT EXISTS idx_credibility_logs_user_id ON public.credibility_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_credibility_logs_bet_id ON public.credibility_logs(bet_id);

-- Row Level Security Policies

-- Users table policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User profiles table policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bets table policies
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all bets" ON public.bets
    FOR SELECT USING (true);

CREATE POLICY "Users can create bets" ON public.bets
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update bets they created or participate in" ON public.bets
    FOR UPDATE USING (
        auth.uid() = creator_id OR 
        auth.uid()::text = ANY(participants::text[])
    );

-- Invitations table policies
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invitations they sent or received" ON public.invitations
    FOR SELECT USING (
        auth.uid() = from_user_id OR 
        auth.uid() = to_user_id
    );

CREATE POLICY "Users can create invitations" ON public.invitations
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update invitations they received" ON public.invitations
    FOR UPDATE USING (auth.uid() = to_user_id);

-- Credibility logs table policies
ALTER TABLE public.credibility_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all credibility logs" ON public.credibility_logs
    FOR SELECT USING (true);

CREATE POLICY "System can insert credibility logs" ON public.credibility_logs
    FOR INSERT WITH CHECK (true);

-- Functions for common operations

-- Function to update user tokens
CREATE OR REPLACE FUNCTION update_user_tokens(user_uuid UUID, new_tokens INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE public.users 
    SET tokens = new_tokens, updated_at = NOW()
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user credibility
CREATE OR REPLACE FUNCTION update_user_credibility(
    user_uuid UUID, 
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
CREATE OR REPLACE FUNCTION add_friend(user_uuid UUID, friend_uuid UUID)
RETURNS void AS $$
BEGIN
    -- Add friend to user's friends list
    UPDATE public.users 
    SET friends = array_append(friends, friend_uuid::integer), updated_at = NOW()
    WHERE id = user_uuid AND NOT (friend_uuid::integer = ANY(friends));
    
    -- Add user to friend's friends list
    UPDATE public.users 
    SET friends = array_append(friends, user_uuid::integer), updated_at = NOW()
    WHERE id = friend_uuid AND NOT (user_uuid::integer = ANY(friends));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove friend
CREATE OR REPLACE FUNCTION remove_friend(user_uuid UUID, friend_uuid UUID)
RETURNS void AS $$
BEGIN
    -- Remove friend from user's friends list
    UPDATE public.users 
    SET friends = array_remove(friends, friend_uuid::integer), updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Remove user from friend's friends list
    UPDATE public.users 
    SET friends = array_remove(friends, user_uuid::integer), updated_at = NOW()
    WHERE id = friend_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add chat message
CREATE OR REPLACE FUNCTION add_chat_message(
    bet_uuid UUID,
    user_uuid UUID,
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

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bets_updated_at BEFORE UPDATE ON public.bets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON public.invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo data
INSERT INTO public.users (id, username, email, tokens, credibility, friends) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Maxim', 'maxim@example.com', 1000, 100, '{2,3,4,5,6,7,8,9}'),
    ('22222222-2222-2222-2222-222222222222', 'Moritz', 'moritz@example.com', 1000, 100, '{1,3,4,5,6,7,8,9}'),
    ('33333333-3333-3333-3333-333333333333', 'Dominik', 'dominik@example.com', 1000, 100, '{1,2,4,5,6,7,8,9}'),
    ('44444444-4444-4444-4444-444444444444', 'Niko', 'niko@example.com', 1000, 100, '{1,2,3,5,6,7,8,9}'),
    ('55555555-5555-5555-5555-555555555555', 'Alex', 'alex@example.com', 1000, 100, '{1,2,3,4,6,7,8,9}'),
    ('66666666-6666-6666-6666-666666666666', 'Eddy', 'eddy@example.com', 1000, 100, '{1,2,3,4,5,7,8,9}'),
    ('77777777-7777-7777-7777-777777777777', 'Patrick', 'patrick@example.com', 1000, 100, '{1,2,3,4,5,6,8,9}'),
    ('88888888-8888-8888-8888-888888888888', 'Human', 'human@example.com', 1000, 100, '{1,2,3,4,5,6,7,9}'),
    ('99999999-9999-9999-9999-999999999999', 'Vess', 'vess@example.com', 1000, 100, '{1,2,3,4,5,6,7,8}')
ON CONFLICT (id) DO NOTHING; 