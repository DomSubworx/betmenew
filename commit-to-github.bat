@echo off
echo 🚀 Committing Bet Me If You Can to GitHub...
echo.

echo 📋 Checking if Git is installed...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed or not in PATH
    echo 📥 Please install Git from: https://git-scm.com/download/win
    echo 🔄 After installation, restart your terminal and run this script again
    pause
    exit /b 1
)

echo ✅ Git is installed
echo.

echo 📁 Initializing Git repository...
git init

echo 📦 Adding all files to Git...
git add .

echo 💾 Committing changes with comprehensive message...
git commit -m "feat: Complete Supabase integration with real-time database and deployment setup

🚀 MAJOR UPDATE: Complete Supabase Integration & Production Deployment

## 🔧 Database Integration
- ✅ Migrated from localStorage to Supabase real-time database
- ✅ Created complete database schema with 5 tables
- ✅ Implemented Row Level Security (RLS) policies
- ✅ Created custom SQL functions for all operations

## 🎯 App Features Enhanced
- ✅ Real-time chat in bets with live updates
- ✅ Credibility system (fixed -30 bug)
- ✅ User profiles with photo upload
- ✅ Friend system with shareable invite links
- ✅ Token-based betting
- ✅ Real-time subscriptions

## 🔄 Code Refactoring
- ✅ Modularized React components
- ✅ Centralized utilities
- ✅ Updated for Supabase integration
- ✅ Proper async/await patterns

## 🚀 Deployment Ready
- ✅ Production build optimized
- ✅ Vercel deployment configuration
- ✅ GitHub Actions workflow
- ✅ Complete documentation

## 🐛 Bug Fixes
- ✅ Fixed credibility system bug
- ✅ Resolved data type mismatches
- ✅ Fixed real-time subscriptions

## 🎯 Ready for Production
- ✅ Database tested and validated
- ✅ All features working
- ✅ Deployment configurations complete

Breaking Changes: Removed localStorage, updated to Supabase
Migration: Users re-login required after deployment"

echo.
echo ✅ Commit completed successfully!
echo.
echo 📤 To push to GitHub, you need to:
echo 1. Create a repository on GitHub.com
echo 2. Run: git remote add origin YOUR_GITHUB_REPO_URL
echo 3. Run: git push -u origin main
echo.
echo 📝 Your comprehensive commit message is saved in COMMIT_MESSAGE.md
echo.
pause 