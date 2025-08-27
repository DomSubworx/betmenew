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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
REACT_APP_ENVIRONMENT=supabase
REACT_APP_USE_SUPABASE=true

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

## 🚀 Local Development with Supabase

### Prerequisites
- Node.js 18+ and npm
- Supabase CLI (optional, for local development)
- Git repository

### Step 1: Install Supabase CLI (Optional)
```bash
npm install -g supabase
```

### Step 2: Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit .env with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
REACT_APP_ENVIRONMENT=supabase
REACT_APP_USE_SUPABASE=true
```

### Step 3: Local Supabase Development
```bash
# Start local Supabase instance
npm run db:local:start

# Apply migrations to local database
npm run db:migrate:local

# Seed local database with demo data
npm run db:seed:local

# Start development server with Supabase
npm run dev:supabase
```

### Step 4: Database Management Commands
```bash
# View local Supabase status
npm run db:local:status

# Stop local Supabase
npm run db:local:stop

# Open Supabase Studio
npm run db:studio

# View logs
npm run db:logs

# Generate database diff
npm run db:diff

# Apply new migrations locally
npm run db:migrate:local:new
```

## 🗄️ Database Schema

### Tables
- **`users`**: Core user entity with authentication and profile data
- **`user_profiles`**: Extended user profile information
- **`bets`**: Core betting entity with voting and outcome tracking
- **`invitations`**: Friend invitation system for bets
- **`credibility_logs`**: Audit trail for credibility changes
- **`token_logs`**: Audit trail for token changes

### Key Features
- **Row Level Security (RLS)**: Secure by default with explicit policies
- **Real-time subscriptions**: Live updates for chat and bet status
- **Custom functions**: Token management, credibility system, friend management
- **Automatic bet expiration**: 3-day voting window with annulment logic

### Migrations
All database changes are managed through versioned migrations:

```bash
supabase/migrations/
├── 001_initial_schema.sql      # Base schema and tables
├── 002_functions_and_policies.sql # Custom functions and RLS policies
└── 003_seed_data.sql          # Initial demo data
```

## 🚀 Deployment Setup

### Prerequisites
- Supabase account and project
- Vercel/Netlify account (for hosting)
- GitHub repository

### Step 1: Supabase Project Setup

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com and create a new project
   # Note down your project URL and anon key
   ```

2. **Link Local to Remote**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Apply Migrations to Remote**
   ```bash
   npm run db:migrate:remote
   ```

### Step 2: Environment Configuration

1. **Set Environment Variables**
   ```bash
   # In your hosting platform (Vercel/Netlify)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   REACT_APP_ENVIRONMENT=supabase
   REACT_APP_USE_SUPABASE=true
   ```

### Step 3: Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   npm run deploy:vercel
   ```

### Step 4: Deploy to Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   npm run deploy:netlify
   ```

## 🔧 Development

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_ENVIRONMENT` | `demo` | Environment mode (`demo` or `supabase`) |
| `REACT_APP_USE_SUPABASE` | `false` | Enable Supabase integration |
| `REACT_APP_USE_DEMO_DATA` | `true` | Enable demo data fallback |
| `NEXT_PUBLIC_SUPABASE_URL` | - | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | - | Your Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | - | Your Supabase service role key (server-only) |

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

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Smoke Tests
```bash
# Test Supabase connection and functionality
node scripts/smoke-test.js
```

### Test Both Environments
1. **Demo Mode**: `REACT_APP_ENVIRONMENT=demo npm start`
2. **Supabase Mode**: `REACT_APP_ENVIRONMENT=supabase npm start`

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
├── scripts/                      # Utility scripts
│   ├── deploy.sh                 # Deployment script
│   └── smoke-test.js             # Smoke test script
├── .github/                      # GitHub Actions
│   └── workflows/                # CI/CD workflows
├── public/                       # Static assets
├── env.example                   # Environment template
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🔒 Security & RLS

### Row Level Security Policies
- **Users**: Can view all users, update only their own profile
- **Bets**: Can view all bets, update only if creator or participant
- **Invitations**: Can view only sent/received invitations
- **Logs**: Can view all credibility logs, own token logs only

### Testing RLS
```bash
# Run smoke tests to verify RLS policies
node scripts/smoke-test.js

# Check specific table access
npm run db:studio
```

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env` file is in the root directory
   - Restart the development server after changes
   - Check variable names start with `NEXT_PUBLIC_` or `REACT_APP_`

2. **Supabase Connection Issues**
   - Verify your project URL and anon key
   - Check if your Supabase project is active
   - Ensure Row Level Security policies are configured

3. **Build Errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check for syntax errors in your code
   - Verify all imports are correct

4. **Database Migration Issues**
   - Check Supabase project status: `npm run db:local:status`
   - Reset local database: `npm run db:migrate:local`
   - Verify migration files are in correct order

### Getting Help

- **Supabase Issues**: Check [Supabase Docs](https://supabase.com/docs)
- **Vercel Issues**: Check [Vercel Docs](https://vercel.com/docs)
- **App Issues**: Check the main README.md in your repository
- **Smoke Tests**: Run `node scripts/smoke-test.js` for diagnostics

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test locally
npm run dev:supabase

# Run tests
npm test
node scripts/smoke-test.js

# Commit changes
git add .
git commit -m 'feat: add new feature'

# Push and create PR
git push origin feature/new-feature
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [React](https://react.dev)
- Backend powered by [Supabase](https://supabase.com)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Icons from [Lucide React](https://lucide.dev)

---

**Happy Betting! 🎯💰**
