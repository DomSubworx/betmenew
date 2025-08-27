# 🚀 BetMe App - Deployment Guide for Friends

This guide will help you deploy your BetMe app so your friends can test it! We'll use **Vercel** (free hosting) and **Supabase** (free database) to get your app online quickly.

## 📋 What You'll Need

- ✅ A GitHub account (free)
- ✅ A Supabase account (free tier available)
- ✅ A Vercel account (free tier available)
- ✅ Your BetMe app code

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Supabase Database

1. **Go to [Supabase.com](https://supabase.com)**
   - Sign up/login with your GitHub account
   - Click "New Project"

2. **Create Your Project**
   - Choose your organization
   - Give it a name (e.g., "betme-app")
   - Set a database password (save this!)
   - Choose a region close to you
   - Click "Create new project"

3. **Wait for Setup** (2-3 minutes)
   - Supabase will create your database
   - You'll see a success message

4. **Get Your Credentials**
   - Go to Settings → API
   - Copy your **Project URL** and **anon public key**
   - Save these somewhere safe!

### Step 2: Set Up Your Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Run the Initial Schema**:
   - Copy the content from `supabase/migrations/001_initial_schema.sql`
   - Paste it in the SQL Editor
   - Click "Run"

3. **Run the Complete Setup**:
   - Copy the content from `supabase/migrations/002_complete_setup.sql`
   - Paste it in the SQL Editor
   - Click "Run"

4. **Seed Your Database** (optional):
   - Copy the content from `supabase/seed/01_demo_data.sql`
   - Paste it in the SQL Editor
   - Click "Run"

### Step 3: Deploy to Vercel

1. **Go to [Vercel.com](https://vercel.com)**
   - Sign up/login with your GitHub account
   - Click "New Project"

2. **Import Your Repository**
   - Choose "Import Git Repository"
   - Select your BetMe app repository
   - Click "Import"

3. **Configure Your Project**
   - **Framework Preset**: Create React App
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Set Environment Variables**
   - Click "Environment Variables"
   - Add these variables:
     ```
     REACT_APP_SUPABASE_URL = your_supabase_project_url
     REACT_APP_SUPABASE_ANON_KEY = your_supabase_anon_key
     REACT_APP_ENVIRONMENT = supabase
     REACT_APP_USE_SUPABASE = true
     REACT_APP_USE_DEMO_DATA = false
     ```

5. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Step 4: Test Your Deployment

1. **Visit your live URL**
2. **Test the app functionality**:
   - Create a new user account
   - Create a bet
   - Invite friends
   - Test the voting system

3. **Share with friends**:
   - Send them your Vercel URL
   - They can create accounts and start betting!

## 🔧 Troubleshooting Common Issues

### Issue: "Supabase connection failed"
**Solution**: Check your environment variables in Vercel
- Go to Project Settings → Environment Variables
- Verify your Supabase URL and key are correct
- Redeploy after fixing

### Issue: "Database tables not found"
**Solution**: Run the migration files again
- Go to Supabase SQL Editor
- Run the migration files in order
- Check that tables exist in Table Editor

### Issue: "Build failed on Vercel"
**Solution**: Check your build logs
- Look for specific error messages
- Common issues: missing dependencies, syntax errors
- Fix locally first, then redeploy

### Issue: "App loads but doesn't work"
**Solution**: Check browser console
- Open Developer Tools (F12)
- Look for JavaScript errors
- Verify Supabase connection in Network tab

## 📱 Making Your App Mobile-Friendly

1. **Test on mobile devices**
2. **Check responsive design**
3. **Test touch interactions**
4. **Verify loading times**

## 🔒 Security Considerations

- ✅ Your Supabase anon key is safe to share (it's public)
- ✅ Row Level Security (RLS) protects your data
- ✅ Users can only access their own data
- ✅ No sensitive information is exposed

## 🎉 You're Done!

Your BetMe app is now live and ready for your friends to test! They can:
- Create accounts
- Make bets
- Invite each other
- Vote on outcomes
- Track their credibility

## 📞 Need Help?

- **Supabase Issues**: Check [Supabase Docs](https://supabase.com/docs)
- **Vercel Issues**: Check [Vercel Docs](https://vercel.com/docs)
- **App Issues**: Check the main README.md in your repository

---

**Happy Deploying! 🚀🎯**
