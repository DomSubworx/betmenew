-- Seed Data Migration for BetMe App
-- This migration populates the database with initial demo data
-- Run this after the functions and policies migration

-- Insert demo users (these would normally be created through auth.signup)
-- Note: These are test UUIDs - in production, users would be created via Supabase Auth
INSERT INTO public.users (id, username, email, tokens, credibility, friends, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'dominik', 'dominik@example.com', 1000, 100, ARRAY['22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999'], NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'alex', 'alex@example.com', 1000, 100, ARRAY['11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999'], NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'sarah', 'sarah@example.com', 1000, 100, ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999'], NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'mike', 'mike@example.com', 1000, 100, ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999'], NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'emma', 'emma@example.com', 1000, 100, ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999'], NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666666', 'james', 'james@example.com', 1000, 100, ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999'], NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777777', 'lisa', 'lisa@example.com', 1000, 100, ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999'], NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888888', 'david', 'david@example.com', 1000, 100, ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', '99999999-9999-9999-9999-999999999999'], NOW(), NOW()),
  ('99999999-9999-9999-9999-999999999999', 'anna', 'anna@example.com', 1000, 100, ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888'], NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert user profiles
INSERT INTO public.user_profiles (user_id, profile_photo, invite_links, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', '{}', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', '{}', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', '{}', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', '{}', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', '{}', NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', '{}', NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', '{}', NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888888', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', '{}', NOW(), NOW()),
  ('99999999-9999-9999-9999-999999999999', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', '{}', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample bets
INSERT INTO public.bets (id, title, description, creator_id, participants, participant_bets, stake_tokens, status, votes, winner, chat_messages, created_at, updated_at) VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'Bayern wins against Dortmund',
    'Classic German football match - who will win?',
    '11111111-1111-1111-1111-111111111111',
    ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'],
    '{"11111111-1111-1111-1111-111111111111": "Bayern wins", "22222222-2222-2222-2222-222222222222": "Dortmund wins", "33333333-3333-3333-3333-333333333333": "Draw"}',
    50,
    'active',
    '{}',
    NULL,
    '[]',
    NOW(),
    NOW()
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'Who can do 100 push-ups?',
    'Fitness challenge among friends',
    '55555555-5555-5555-5555-555555555555',
    ARRAY['55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777'],
    '{"55555555-5555-5555-5555-555555555555": "No one makes it", "66666666-6666-6666-6666-666666666666": "One person makes it", "77777777-7777-7777-7777-777777777777": "Multiple people make it"}',
    30,
    'voting',
    '{}',
    NULL,
    '[]',
    NOW(),
    NOW()
  ),
  (
    'b3333333-3333-3333-3333-333333333333',
    'Best pizza topping',
    'Vote for your favorite pizza topping',
    '33333333-3333-3333-3333-333333333333',
    ARRAY['33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888'],
    '{"33333333-3333-3333-3333-333333333333": "Pepperoni", "44444444-4444-4444-4444-444444444444": "Margherita", "88888888-8888-8888-8888-888888888888": "Hawaiian"}',
    25,
    'active',
    '{}',
    NULL,
    '[]',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample credibility logs
INSERT INTO public.credibility_logs (user_id, bet_id, change_amount, reason, old_credibility, new_credibility, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', NULL, 0, 'Account created', 0, 100, NOW()),
  ('22222222-2222-2222-2222-222222222222', NULL, 0, 'Account created', 0, 100, NOW()),
  ('33333333-3333-3333-3333-333333333333', NULL, 0, 'Account created', 0, 100, NOW()),
  ('44444444-4444-4444-4444-444444444444', NULL, 0, 'Account created', 0, 100, NOW()),
  ('55555555-5555-5555-5555-555555555555', NULL, 0, 'Account created', 0, 100, NOW()),
  ('66666666-6666-6666-6666-666666666666', NULL, 0, 'Account created', 0, 100, NOW()),
  ('77777777-7777-7777-7777-777777777777', NULL, 0, 'Account created', 0, 100, NOW()),
  ('88888888-8888-8888-8888-888888888888', NULL, 0, 'Account created', 0, 100, NOW()),
  ('99999999-9999-9999-9999-999999999999', NULL, 0, 'Account created', 0, 100, NOW())
ON CONFLICT DO NOTHING;

-- Insert sample token logs
INSERT INTO public.token_logs (user_id, bet_id, change_amount, reason, old_tokens, new_tokens, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', NULL, 0, 'Account created', 0, 1000, NOW()),
  ('22222222-2222-2222-2222-222222222222', NULL, 0, 'Account created', 0, 1000, NOW()),
  ('33333333-3333-3333-3333-333333333333', NULL, 0, 'Account created', 0, 1000, NOW()),
  ('44444444-4444-4444-4444-444444444444', NULL, 0, 'Account created', 0, 1000, NOW()),
  ('55555555-5555-5555-5555-555555555555', NULL, 0, 'Account created', 0, 1000, NOW()),
  ('66666666-6666-6666-6666-666666666666', NULL, 0, 'Account created', 0, 1000, NOW()),
  ('77777777-7777-7777-7777-777777777777', NULL, 0, 'Account created', 0, 1000, NOW()),
  ('88888888-8888-8888-8888-888888888888', NULL, 0, 'Account created', 0, 1000, NOW()),
  ('99999999-9999-9999-9999-999999999999', NULL, 0, 'Account created', 0, 1000, NOW())
ON CONFLICT DO NOTHING;

-- Insert sample invitations
INSERT INTO public.invitations (bet_id, from_user_id, to_user_id, status, created_at, updated_at) VALUES
  ('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'accepted', NOW(), NOW()),
  ('b2222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 'pending', NOW(), NOW()),
  ('b3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'pending', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Add some sample chat messages to the first bet
UPDATE public.bets 
SET chat_messages = jsonb_build_array(
  jsonb_build_object(
    'id', gen_random_uuid(),
    'userId', '11111111-1111-1111-1111-111111111111',
    'username', 'dominik',
    'message', 'This is going to be a great match!',
    'timestamp', NOW() - INTERVAL '1 hour'
  ),
  jsonb_build_object(
    'id', gen_random_uuid(),
    'userId', '22222222-2222-2222-2222-222222222222',
    'username', 'alex',
    'message', 'I think Dortmund has a chance this time',
    'timestamp', NOW() - INTERVAL '30 minutes'
  ),
  jsonb_build_object(
    'id', gen_random_uuid(),
    'userId', '33333333-3333-3333-3333-333333333333',
    'username', 'sarah',
    'message', 'Draw is always a possibility in derby matches',
    'timestamp', NOW() - INTERVAL '15 minutes'
  )
)
WHERE id = 'b1111111-1111-1111-1111-111111111111';

-- Set voting start time for the voting bet
UPDATE public.bets 
SET voting_start_time = NOW() - INTERVAL '1 day'
WHERE id = 'b2222222-2222-2222-2222-222222222222';

-- Add some votes to the voting bet
UPDATE public.bets 
SET votes = jsonb_build_object(
  '55555555-5555-5555-5555-555555555555', 'No one makes it',
  '66666666-6666-6666-6666-666666666666', 'One person makes it'
),
voted_within_window = jsonb_build_object(
  '55555555-5555-5555-5555-555555555555', true,
  '66666666-6666-6666-6666-666666666666', true
)
WHERE id = 'b2222222-2222-2222-2222-222222222222';

-- Verify the seed data was inserted correctly
DO $$
DECLARE
    user_count INTEGER;
    profile_count INTEGER;
    bet_count INTEGER;
    log_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users;
    SELECT COUNT(*) INTO profile_count FROM public.user_profiles;
    SELECT COUNT(*) INTO bet_count FROM public.bets;
    SELECT COUNT(*) INTO log_count FROM public.credibility_logs;
    
    RAISE NOTICE 'Seed data inserted: % users, % profiles, % bets, % credibility logs', 
        user_count, profile_count, bet_count, log_count;
END $$;
