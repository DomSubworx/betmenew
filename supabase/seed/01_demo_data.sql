-- Seed data for BetMe app
-- This file populates the database with initial demo data

-- Insert demo users (these would normally be created through auth.signup)
INSERT INTO public.users (id, username, email, tokens, credibility, friends, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'dominik', 'dominik@example.com', 1000, 100, ARRAY[2,3,4,5,6,7,8,9], NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'alex', 'alex@example.com', 1000, 100, ARRAY[1,3,4,5,6,7,8,9], NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'sarah', 'sarah@example.com', 1000, 100, ARRAY[1,2,4,5,6,7,8,9], NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'mike', 'mike@example.com', 1000, 100, ARRAY[1,2,3,5,6,7,8,9], NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'emma', 'emma@example.com', 1000, 100, ARRAY[1,2,3,4,6,7,8,9], NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666666', 'james', 'james@example.com', 1000, 100, ARRAY[1,2,3,4,5,7,8,9], NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777777', 'lisa', 'lisa@example.com', 1000, 100, ARRAY[1,2,3,4,5,6,8,9], NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888888', 'david', 'david@example.com', 1000, 100, ARRAY[1,2,3,4,5,6,7,9], NOW(), NOW()),
  ('99999999-9999-9999-9999-999999999999', 'anna', 'anna@example.com', 1000, 100, ARRAY[1,2,3,4,5,6,7,8], NOW(), NOW())
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
    ARRAY[1,2,3],
    '{"1": "Bayern wins", "2": "Dortmund wins", "3": "Draw"}',
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
    ARRAY[5,6,7],
    '{"5": "No one makes it", "6": "One person makes it", "7": "Multiple people make it"}',
    30,
    'voting',
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
