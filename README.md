# BetMe App

A social betting application built with React that allows users to create bets, invite friends, and vote on outcomes.

## 🚀 Quick Start

### Demo Mode (Recommended for Development)
```bash
npm install
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

**Demo mode features:**
- ✅ 9 pre-configured users with full friend relationships
- ✅ Complete betting functionality without database setup
- ✅ Local storage persistence
- ✅ Environment switcher for easy testing

### Supabase Mode (Production)
```bash
# Set environment variables
REACT_APP_ENVIRONMENT=supabase
REACT_APP_USE_SUPABASE=true
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key

npm start
```

## 🏗️ Architecture

The app operates in a **dual-environment system**:

- **Demo Mode**: Fully functional local environment with localStorage persistence
- **Supabase Mode**: Production environment with real database integration

### Environment Detection

The app automatically switches between environments based on configuration:

```javascript
// src/config.js
export const config = {
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'demo',
  FEATURES: {
    USE_SUPABASE: process.env.REACT_APP_USE_SUPABASE === 'true',
    USE_DEMO_DATA: process.env.REACT_APP_USE_DEMO_DATA !== 'false',
  }
};
```

### Service Layer

```
src/
├── services/
│   ├── dataService.js          # Unified facade - routes to appropriate backend
│   └── demoDataService.js      # Demo environment - localStorage + in-memory
├── supabaseService.js          # Supabase environment (preserved)
└── config.js                   # Environment configuration
```

## 🎮 Features

### User Management
- **Demo Users**: 9 users with 1000 tokens and 100 credibility each
- **Friend System**: All users are friends with each other
- **Profile Management**: Photo uploads and user profiles

### Betting System
- **Create Bets**: Full bet creation workflow with friend invitations
- **Voting System**: Real-time voting and outcome determination
- **Token Economy**: Stake tokens and win rewards
- **Credibility System**: Track user credibility changes

### Data Persistence
- **Demo Mode**: localStorage with auto-save every 5 seconds
- **Supabase Mode**: Real-time database with subscriptions

## 🔧 Development

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_ENVIRONMENT` | `demo` | Environment mode (`demo` or `supabase`) |
| `REACT_APP_USE_SUPABASE` | `false` | Enable Supabase integration |
| `REACT_APP_USE_DEMO_DATA` | `true` | Enable demo data fallback |

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

// Bet operations
await dataService.createBet(betData)
await dataService.updateBet(betId, updates)

// Invitation operations
await dataService.createInvitation(invitationData)
await dataService.updateInvitationStatus(invitationId, status)
```

## 📚 Documentation

- **[DEMO_MODE_README.md](DEMO_MODE_README.md)** - Complete architecture documentation
- **[SETUP.md](SETUP.md)** - Environment setup instructions

## 🛠️ Available Scripts

### `npm start`
Runs the app in development mode with hot reload.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## 🚀 Deployment

### Demo Mode Deployment
The app can be deployed as-is for demo purposes. All data will be stored in the user's browser localStorage.

### Supabase Mode Deployment
1. Set up a Supabase project
2. Configure environment variables
3. Deploy to your preferred hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the [DEMO_MODE_README.md](DEMO_MODE_README.md) for detailed documentation
2. Review the [SETUP.md](SETUP.md) for environment configuration
3. Open an issue on GitHub

---

**Built with React, Supabase, and ❤️**
