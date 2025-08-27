-- Initial Schema Migration for BetMe App
-- This migration creates the complete database structure
-- Run this first in your Supabase project

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for better data validation
CREATE TYPE bet_status AS ENUM ('active', 'voting', 'completed', 'annulled');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    tokens INTEGER DEFAULT 1000 CHECK (tokens >= 0),
    credibility INTEGER DEFAULT 100 CHECK (credibility >= 0 AND credibility <= 100),
    friends UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    profile_photo TEXT,
    invite_links JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bets table
CREATE TABLE IF NOT EXISTS public.bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    participants UUID[] NOT NULL CHECK (array_length(participants, 1) > 0),
    participant_bets JSONB DEFAULT '{}',
    stake_tokens INTEGER DEFAULT 0 CHECK (stake_tokens >= 0),
    status bet_status DEFAULT 'active',
    votes JSONB DEFAULT '{}',
    winner TEXT,
    chat_messages JSONB DEFAULT '[]',
    voting_start_time TIMESTAMPTZ,
    voted_within_window JSONB DEFAULT '{}',
    majority_punishment_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bet_id UUID REFERENCES public.bets(id) ON DELETE CASCADE NOT NULL,
    from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status invitation_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credibility logs table
CREATE TABLE IF NOT EXISTS public.credibility_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    bet_id UUID REFERENCES public.bets(id) ON DELETE SET NULL,
    change_amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    old_credibility INTEGER NOT NULL CHECK (old_credibility >= 0 AND old_credibility <= 100),
    new_credibility INTEGER NOT NULL CHECK (new_credibility >= 0 AND new_credibility <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token logs table (for audit trail)
CREATE TABLE IF NOT EXISTS public.token_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    bet_id UUID REFERENCES public.bets(id) ON DELETE SET NULL,
    change_amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    old_tokens INTEGER NOT NULL CHECK (old_tokens >= 0),
    new_tokens INTEGER NOT NULL CHECK (new_tokens >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_friends ON public.users USING GIN(friends);
CREATE INDEX IF NOT EXISTS idx_bets_creator_id ON public.bets(creator_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON public.bets(status);
CREATE INDEX IF NOT EXISTS idx_bets_participants ON public.bets USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_bets_voting_start_time ON public.bets(voting_start_time);
CREATE INDEX IF NOT EXISTS idx_invitations_bet_id ON public.invitations(bet_id);
CREATE INDEX IF NOT EXISTS idx_invitations_to_user_id ON public.invitations(to_user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
CREATE INDEX IF NOT EXISTS idx_credibility_logs_user_id ON public.credibility_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_credibility_logs_bet_id ON public.credibility_logs(bet_id);
CREATE INDEX IF NOT EXISTS idx_credibility_logs_created_at ON public.credibility_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_token_logs_user_id ON public.token_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_token_logs_bet_id ON public.token_logs(bet_id);
CREATE INDEX IF NOT EXISTS idx_token_logs_created_at ON public.token_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bets_updated_at BEFORE UPDATE ON public.bets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON public.invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credibility_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - will be enhanced in next migration)
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all bets" ON public.bets FOR SELECT USING (true);
CREATE POLICY "Users can create bets" ON public.bets FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update bets they created or participate in" ON public.bets FOR UPDATE USING (
    auth.uid() = creator_id OR 
    auth.uid()::text = ANY(participants::text[])
);

CREATE POLICY "Users can view invitations they sent or received" ON public.invitations FOR SELECT USING (
    auth.uid() = from_user_id OR 
    auth.uid() = to_user_id
);
CREATE POLICY "Users can create invitations" ON public.invitations FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can update invitations they received" ON public.invitations FOR UPDATE USING (auth.uid() = to_user_id);

CREATE POLICY "Users can view all credibility logs" ON public.credibility_logs FOR SELECT USING (true);
CREATE POLICY "System can insert credibility logs" ON public.credibility_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own token logs" ON public.token_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert token logs" ON public.token_logs FOR INSERT WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE public.users IS 'Core user entity with authentication and profile data';
COMMENT ON TABLE public.user_profiles IS 'Extended user profile information';
COMMENT ON TABLE public.bets IS 'Core betting entity with voting and outcome tracking';
COMMENT ON TABLE public.invitations IS 'Friend invitation system for bets';
COMMENT ON TABLE public.credibility_logs IS 'Audit trail for credibility changes';
COMMENT ON TABLE public.token_logs IS 'Audit trail for token changes';
