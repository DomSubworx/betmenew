# BetMe App - Schema Inventory

## Overview
This document captures the current data models, relationships, and constraints found in the BetMe app codebase to ensure accurate Supabase migration generation.

## Current Data Models

### 1. Users Table
**Purpose**: Core user entity with authentication and profile data

**Fields Identified**:
- `id` (UUID) - Primary key, references `auth.users.id`
- `username` (TEXT) - Unique username for display
- `email` (TEXT) - User's email address
- `tokens` (INTEGER) - Current token balance (default: 1000)
- `credibility` (INTEGER) - User credibility score (default: 100)
- `friends` (INTEGER[]) - Array of friend user IDs
- `created_at` (TIMESTAMPTZ) - Account creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Constraints**:
- Username must be unique
- Email must be unique
- Tokens and credibility have default values
- Friends array defaults to empty

**Relationships**:
- One-to-one with `user_profiles`
- One-to-many with `bets` (as creator)
- Many-to-many with other users (via friends array)

### 2. User Profiles Table
**Purpose**: Extended user profile information

**Fields Identified**:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users.id
- `profile_photo` (TEXT) - URL to profile photo
- `invite_links` (JSONB) - Stored invite link data
- `created_at` (TIMESTAMPTZ) - Profile creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Constraints**:
- `user_id` must reference valid user
- `invite_links` defaults to empty JSON object

**Relationships**:
- Many-to-one with `users`

### 3. Bets Table
**Purpose**: Core betting entity with voting and outcome tracking

**Fields Identified**:
- `id` (UUID) - Primary key
- `title` (TEXT) - Bet title/description
- `description` (TEXT) - Detailed bet description
- `creator_id` (UUID) - Foreign key to users.id
- `participants` (INTEGER[]) - Array of participant user IDs
- `participant_bets` (JSONB) - Each participant's chosen outcome
- `stake_tokens` (INTEGER) - Token amount per participant (default: 0)
- `status` (TEXT) - Bet status: 'active', 'voting', 'completed'
- `votes` (JSONB) - Voting data from participants
- `winner` (TEXT) - Winning outcome (nullable)
- `chat_messages` (JSONB) - Array of chat messages
- `created_at` (TIMESTAMPTZ) - Bet creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Constraints**:
- Status must be one of: 'active', 'voting', 'completed'
- `creator_id` must reference valid user
- `participants` array cannot be empty
- `stake_tokens` defaults to 0

**Relationships**:
- Many-to-one with `users` (creator)
- Many-to-many with `users` (participants)
- One-to-many with `invitations`
- One-to-many with `credibility_logs`

### 4. Invitations Table
**Purpose**: Friend invitation system for bets

**Fields Identified**:
- `id` (UUID) - Primary key
- `bet_id` (UUID) - Foreign key to bets.id
- `from_user_id` (UUID) - Foreign key to users.id (sender)
- `to_user_id` (UUID) - Foreign key to users.id (recipient)
- `status` (TEXT) - Invitation status: 'pending', 'accepted', 'declined'
- `created_at` (TIMESTAMPTZ) - Invitation creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Constraints**:
- Status must be one of: 'pending', 'accepted', 'declined'
- All foreign keys must reference valid records

**Relationships**:
- Many-to-one with `bets`
- Many-to-one with `users` (sender)
- Many-to-one with `users` (recipient)

### 5. Credibility Logs Table
**Purpose**: Audit trail for credibility changes

**Fields Identified**:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users.id
- `bet_id` (UUID) - Foreign key to bets.id (nullable)
- `change_amount` (INTEGER) - Credibility change amount
- `reason` (TEXT) - Reason for credibility change
- `old_credibility` (INTEGER) - Previous credibility value
- `new_credibility` (INTEGER) - New credibility value
- `created_at` (TIMESTAMPTZ) - Log entry timestamp

**Constraints**:
- `change_amount` cannot be null
- `reason` cannot be null
- `bet_id` can be null (for non-bet related changes)

**Relationships**:
- Many-to-one with `users`
- Many-to-one with `bets` (optional)

## Implicit Constraints & Business Rules

### 1. Token Management
- Users cannot have negative tokens
- Token changes are logged with reasons
- Bet stakes are deducted immediately upon joining

### 2. Credibility System
- Credibility ranges from 0-100
- Changes are logged with detailed reasons
- Punishments apply for rule violations

### 3. Bet Lifecycle
- Bets start as 'active'
- Move to 'voting' when participants join
- Move to 'completed' after voting or expiration
- 3-day voting window enforcement

### 4. Friend System
- Users can be friends with multiple other users
- Friend relationships are bidirectional
- Invitations can be sent to friends

### 5. Voting System
- Only participants can vote
- Majority determines outcome
- Ties result in refunds
- Late voting incurs penalties

## Data Types & Validation

### Text Fields
- Use `TEXT` for variable-length strings (usernames, emails, descriptions)
- Avoid `VARCHAR` limits to prevent truncation issues

### Numeric Fields
- Use `INTEGER` for tokens, credibility, and counts
- Use `INTEGER[]` for arrays of user IDs

### JSON Fields
- Use `JSONB` for flexible data structures (participant bets, votes, chat messages)
- Provides better performance and indexing than regular JSON

### Timestamps
- Use `TIMESTAMPTZ` for all timestamp fields
- Store in UTC, convert in UI as needed
- Default to `NOW()` for creation timestamps

## Security Considerations

### Row Level Security (RLS)
- Enable RLS on all user-facing tables
- Users can only access their own data or public data
- Friends can view each other's basic information
- Bet participants can view and update bet details

### Authentication
- Integrate with Supabase Auth
- Use JWT tokens for API access
- Validate user permissions on all operations

## Migration Strategy

### Phase 1: Schema Creation
- Create all tables with proper constraints
- Add indexes for performance
- Enable RLS on all tables

### Phase 2: Data Migration
- Seed with demo data
- Test all CRUD operations
- Verify RLS policies

### Phase 3: App Integration
- Update app to use Supabase
- Test real-time features
- Performance optimization

## Assumptions & Notes

1. **User IDs**: Currently using integer arrays for friends, but should migrate to UUIDs for consistency
2. **Status Enums**: Using text with CHECK constraints for flexibility
3. **JSONB Fields**: Flexible structure allows for future enhancements
4. **Timestamps**: All stored in UTC for consistency
5. **RLS Policies**: Conservative approach - explicit allow policies only

## Next Steps

1. Generate clean migration files
2. Create RLS policies
3. Set up local Supabase development
4. Test all functionality
5. Deploy to production
