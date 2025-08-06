# Bet Me If You Can - Deployment Guide

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy with Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a React app
   - Deploy!

## 🗄️ Supabase Setup

### 1. Database Schema Setup

1. **Go to your Supabase Dashboard:**
   - Visit [supabase.com](https://supabase.com)
   - Open your project

2. **Run the SQL Schema:**
   - Go to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Execute the script

3. **Verify Tables:**
   - Check that all tables are created:
     - `users`
     - `user_profiles`
     - `bets`
     - `invitations`
     - `credibility_logs`

### 2. Environment Variables

The app will automatically use the Supabase credentials from `vercel.json`, but you can also set them as environment variables:

```bash
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔧 Local Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup
1. **Clone and install:**
   ```bash
   git clone <your-repo>
   cd betmenew
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 🌐 Alternative Deployment Options

### Netlify
1. Connect your GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `build`
4. Add environment variables in Netlify dashboard

### GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json:
   ```json
   "homepage": "https://yourusername.github.io/yourrepo",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```
3. Deploy: `npm run deploy`

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize: `firebase init hosting`
3. Build: `npm run build`
4. Deploy: `firebase deploy`

## 🔒 Security Notes

- The app uses Row Level Security (RLS) in Supabase
- All database operations are properly secured
- Environment variables are used for sensitive data
- No hardcoded credentials in production

## 📱 Features After Deployment

✅ **Real-time chat** in bets  
✅ **Credibility system** with proper penalties  
✅ **User profiles** with photo upload  
✅ **Friend system** with invite links  
✅ **Token-based betting**  
✅ **Real-time updates** via Supabase subscriptions  
✅ **Persistent data** across sessions  
✅ **Mobile-responsive** design  

## 🐛 Troubleshooting

### Common Issues:

1. **Build fails:**
   - Check Node.js version (16+ required)
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

2. **Supabase connection fails:**
   - Verify environment variables
   - Check Supabase project status
   - Ensure RLS policies are set up

3. **Real-time not working:**
   - Check Supabase real-time is enabled
   - Verify subscription channels

### Support:
- Check browser console for errors
- Verify Supabase dashboard for database issues
- Review Vercel deployment logs

## 🎉 Success!

Once deployed, your app will be available at:
- **Vercel:** `https://your-app.vercel.app`
- **Netlify:** `https://your-app.netlify.app`
- **GitHub Pages:** `https://yourusername.github.io/yourrepo`

The app is now fully functional with:
- ✅ **Online database** (Supabase)
- ✅ **Real-time features**
- ✅ **User authentication**
- ✅ **Persistent data**
- ✅ **Mobile optimization** 