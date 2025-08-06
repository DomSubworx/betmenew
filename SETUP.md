# BetMe App Setup Guide

## Configuration

The application uses a configuration file (`src/config.js`) for Supabase credentials. For production, you should use environment variables.

### Option 1: Using config file (current setup)
The application is configured to use `src/config.js` with the Supabase credentials.

### Option 2: Using environment variables (recommended for production)
Create a `.env` file in the root directory with the following variables:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Example:
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Start the development server:
```bash
npm start
```

## Security Notes

- Never commit your actual Supabase credentials to version control
- The app will throw an error if environment variables are missing
- Use environment variables for all sensitive configuration

## Features

- Real-time betting application
- User credibility system
- Token-based economy
- Real-time chat
- Friend invitations
- Profile management 