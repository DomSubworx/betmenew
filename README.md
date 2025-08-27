# BetMe App 🎯

A social betting application built with React that allows users to create bets, invite friends, and vote on outcomes. Features a dual-environment system with both demo mode and Supabase production mode.

## 🚀 Quick Start

### Demo Mode (Recommended for Development & Testing)
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
# Copy environment template
cp env.example .env

# Edit .env with your Supabase credentials
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
- **3-Day Voting Window**: Automatic bet expiration and annulment

### Data Persistence
- **Demo Mode**: localStorage with auto-save every 5 seconds
- **Supabase Mode**: Real-time database with subscriptions

## 🚀 Deployment Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Git repository

### Step 1: Supabase Project Setup

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com and create a new project
   # Note down your project URL and anon key
   ```

2. **Install Supabase CLI** (optional, for local development)
   ```bash
   npm install -g supabase
   ```

3. **Initialize Supabase** (if using CLI)
   ```bash
   supabase init
   supabase start
   ```

### Step 2: Environment Configuration

1. **Copy environment template**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file**
   ```bash
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   REACT_APP_ENVIRONMENT=supabase
   REACT_APP_USE_SUPABASE=true
   ```

### Step 3: Database Setup

1. **Run migrations** (using Supabase dashboard or CLI)
   ```bash
   # Option 1: Supabase Dashboard
   # Go to SQL Editor and run the files in supabase/migrations/

   # Option 2: Supabase CLI
   supabase db push
   ```

2. **Seed initial data** (optional)
   ```bash
   # Run the seed file in Supabase SQL Editor
   # File: supabase/seed/01_demo_data.sql
   ```

### Step 4: Build and Deploy

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   ```bash
   # Vercel (recommended)
   npm install -g vercel
   vercel --prod

   # Netlify
   npm install -g netlify-cli
   netlify deploy --prod

   # Or upload build/ folder to any static hosting
   ```

## 🔧 Development

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_ENVIRONMENT` | `demo` | Environment mode (`demo` or `supabase`) |
| `REACT_APP_USE_SUPABASE` | `false` | Enable Supabase integration |
| `REACT_APP_USE_DEMO_DATA` | `true` | Enable demo data fallback |
| `REACT_APP_SUPABASE_URL` | - | Your Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | - | Your Supabase anonymous key |

### Adding New Features

1. **Update `demoDataService.js`** for demo functionality
2. **Update `supabaseService.js`** for production functionality  
3. **Update `dataService.js`** facade to route appropriately
4. **Test in both environments**

### Data Service Interface

All data operations go through the unified `dataService`:

```javascript
// Example usage
import { dataService } from './services/dataService';

// This automatically routes to the correct backend
const users = await dataService.getUsers();
const bets = await dataService.getBets();
```

## 📁 Project Structure

```
betmenew/
├── src/                          # React source code
│   ├── components/               # UI components
│   ├── services/                 # Data services
│   ├── config.js                 # Configuration
│   └── supabaseClient.js         # Supabase client
├── supabase/                     # Supabase configuration
│   ├── migrations/               # Database migrations
│   ├── seed/                     # Seed data
│   ├── functions/                # Edge functions (future)
│   └── config.toml              # Supabase config
├── public/                       # Static assets
├── env.example                   # Environment template
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Both Environments
1. **Demo Mode**: `REACT_APP_ENVIRONMENT=demo npm start`
2. **Supabase Mode**: `REACT_APP_ENVIRONMENT=supabase npm start`

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env` file is in the root directory
   - Restart the development server after changes
   - Check variable names start with `REACT_APP_`

2. **Supabase Connection Issues**
   - Verify your project URL and anon key
   - Check if your Supabase project is active
   - Ensure Row Level Security policies are configured

3. **Build Errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check for syntax errors in your code
   - Verify all imports are correct

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [React documentation](https://react.dev)
- Open an issue in this repository

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [React](https://react.dev)
- Backend powered by [Supabase](https://supabase.com)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Icons from [Lucide React](https://lucide.dev)

---

**Happy Betting! 🎯💰**
