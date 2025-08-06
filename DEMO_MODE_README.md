# BetMe App - Dual Environment Architecture

## Overview

The BetMe app now operates in a **dual-environment system**:
- **Demo Mode**: Fully functional local environment with demo users and localStorage persistence
- **Supabase Mode**: Production environment with real database integration

## Architecture

### Environment Configuration

The app automatically detects and switches between environments based on configuration:

```javascript
// src/config.js
export const config = {
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'demo', // 'demo' | 'supabase'
  FEATURES: {
    USE_SUPABASE: process.env.REACT_APP_USE_SUPABASE === 'true',
    USE_DEMO_DATA: process.env.REACT_APP_USE_DEMO_DATA !== 'false',
    ENABLE_REALTIME: process.env.REACT_APP_ENABLE_REALTIME === 'true',
  }
};
```

### Service Layer Architecture

```
src/
├── services/
│   ├── dataService.js          # Unified facade - routes to appropriate backend
│   └── demoDataService.js      # Demo environment - localStorage + in-memory
├── supabaseService.js          # Supabase environment (preserved)
└── config.js                   # Environment configuration
```

## Demo Mode Features

### ✅ Fully Functional
- **User Management**: 9 demo users with full friend relationships
- **Bet Creation**: Complete bet creation workflow
- **Voting System**: Real-time voting and outcome determination
- **Token System**: Full token economy with rewards
- **Credibility System**: User credibility tracking
- **Invitations**: Friend invitation system
- **Profile Management**: Photo uploads and user profiles
- **Chat System**: In-bet messaging

### ✅ Data Persistence
- **localStorage**: Automatic saving every 5 seconds
- **Auto-recovery**: Data persists across browser sessions
- **Reset Function**: Reset to initial demo state

### ✅ Demo Users
All users start with 1000 tokens and 100 credibility:

1. **Maxim** - Friends with everyone except self
2. **Moritz** - Friends with everyone except self
3. **Dominik** - Friends with everyone except self
4. **Niko** - Friends with everyone except self
5. **Alex** - Friends with everyone except self
6. **Eddy** - Friends with everyone except self
7. **Patrick** - Friends with everyone except self
8. **Human** - Friends with everyone except self
9. **Vess** - Friends with everyone except self

### ✅ Demo Bets
Two pre-configured bets:
1. **"Bayern wins against Dortmund"** - Active status
2. **"Who can do 100 push-ups?"** - Voting status

## Environment Variables

### Demo Mode (Default)
```bash
# No environment variables needed - demo mode is default
npm start
```

### Supabase Mode
```bash
REACT_APP_ENVIRONMENT=supabase
REACT_APP_USE_SUPABASE=true
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
npm start
```

### Mixed Mode (Demo with Supabase fallback)
```bash
REACT_APP_USE_DEMO_DATA=true
REACT_APP_USE_SUPABASE=true
npm start
```

## Usage

### Starting in Demo Mode
```bash
npm start
```
The app will automatically:
1. Initialize demo data service
2. Load demo users and bets
3. Enable localStorage persistence
4. Start auto-save every 5 seconds

### Testing Features
1. **Login**: Click any user to log in
2. **Create Bet**: Use "Create New Bet" button
3. **Invite Friends**: Select from 8 available friends
4. **Vote**: Participate in voting on existing bets
5. **Profile**: Upload photos and manage profile
6. **Credibility**: View credibility logs and changes

### Resetting Demo Data
```javascript
// In browser console
import { dataService } from './services/dataService.js';
dataService.resetDemoData();
```

## Development

### Adding New Features
1. **Update `demoDataService.js`** for demo functionality
2. **Update `supabaseService.js`** for production functionality
3. **Update `dataService.js`** facade to route appropriately
4. **Test in both environments**

### Data Service Interface
All data operations go through the unified `dataService`:

```javascript
// User operations
await dataService.getUsers()
await dataService.updateUserTokens(userId, newTokens)
await dataService.updateUserCredibility(userId, change, reason)

// Bet operations
await dataService.createBet(betData)
await dataService.updateBet(betId, updates)
await dataService.getBets()

// Invitation operations
await dataService.createInvitation(invitationData)
await dataService.updateInvitationStatus(invitationId, status)

// Profile operations
await dataService.updateUserProfile(userId, profileData)
await dataService.generateInviteLink(userId)
```

### Real-time Features
- **Demo Mode**: No real-time subscriptions (polling could be added)
- **Supabase Mode**: Full real-time subscriptions for bets, invitations, and chat

## Benefits

### ✅ Stability
- Demo mode is completely isolated from Supabase
- No network dependencies for core functionality
- Consistent behavior across environments

### ✅ Development Speed
- Instant feedback with local data
- No database setup required
- Easy testing and debugging

### ✅ Future-Proof
- Supabase code is preserved and can be re-enabled
- Clean separation of concerns
- Easy to add new backends

### ✅ User Experience
- Full functionality in demo mode
- Data persistence across sessions
- Realistic demo data for testing

## Troubleshooting

### Demo Data Not Loading
```javascript
// Check if demo service is initialized
console.log('Demo mode:', isDemoMode());
console.log('Data service:', dataService);
```

### localStorage Issues
```javascript
// Clear all demo data
localStorage.clear();
// Reload page
```

### Switching Environments
```javascript
// Force demo mode
localStorage.setItem('REACT_APP_ENVIRONMENT', 'demo');
// Reload page
```

## Migration Path

### From Demo to Supabase
1. Set environment variables for Supabase
2. Restart the application
3. Data will automatically switch to Supabase backend

### From Supabase to Demo
1. Clear environment variables
2. Restart the application
3. Data will automatically switch to demo backend

## File Structure

```
src/
├── services/
│   ├── dataService.js          # Main facade
│   └── demoDataService.js      # Demo implementation
├── supabaseService.js          # Supabase implementation (preserved)
├── config.js                   # Environment config
├── BetMeApp.js                 # Main app (environment-agnostic)
└── components/                 # UI components (unchanged)
```

The architecture ensures that the app is **stable, testable, and future-proof** while maintaining full functionality in both environments. 