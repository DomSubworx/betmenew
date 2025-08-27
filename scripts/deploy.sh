#!/bin/bash

# BetMe App Deployment Script
# This script provides multiple deployment options for the BetMe app

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Please create one from env.example"
        print_status "Run: cp env.example .env"
        exit 1
    fi
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to build the application
build_app() {
    print_status "Building application..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci
    
    # Run tests
    print_status "Running tests..."
    npm test -- --passWithNoTests --watchAll=false
    
    # Build the application
    print_status "Building for production..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Application built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Function to deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Check if user is logged in
    if ! vercel whoami &> /dev/null; then
        print_status "Please log in to Vercel..."
        vercel login
    fi
    
    # Deploy to production
    print_status "Deploying to production..."
    vercel --prod
    
    print_success "Deployment to Vercel completed"
}

# Function to deploy to Netlify
deploy_netlify() {
    print_status "Deploying to Netlify..."
    
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        print_status "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Check if user is logged in
    if ! netlify status &> /dev/null; then
        print_status "Please log in to Netlify..."
        netlify login
    fi
    
    # Deploy to production
    print_status "Deploying to production..."
    netlify deploy --prod --dir=build
    
    print_success "Deployment to Netlify completed"
}

# Function to deploy to GitHub Pages
deploy_github_pages() {
    print_status "Deploying to GitHub Pages..."
    
    # Check if gh-pages is installed
    if ! npm list gh-pages &> /dev/null; then
        print_status "Installing gh-pages..."
        npm install --save-dev gh-pages
    fi
    
    # Add homepage to package.json if not present
    if ! grep -q '"homepage"' package.json; then
        print_warning "Please add homepage to package.json:"
        print_status '  "homepage": "https://yourusername.github.io/yourrepo"'
        exit 1
    fi
    
    # Deploy to GitHub Pages
    print_status "Deploying to GitHub Pages..."
    npx gh-pages -d build
    
    print_success "Deployment to GitHub Pages completed"
}

# Function to deploy to custom server
deploy_custom() {
    print_status "Preparing for custom server deployment..."
    
    print_status "Build files are ready in the 'build' directory"
    print_status "Upload the contents of 'build' to your web server"
    
    # Show build directory contents
    print_status "Build directory contents:"
    ls -la build/
    
    print_success "Custom deployment preparation completed"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        print_warning "Supabase CLI not found. Skipping migrations."
        return
    fi
    
    # Check if linked to remote project
    if ! supabase status &> /dev/null; then
        print_warning "Not linked to Supabase project. Skipping migrations."
        return
    fi
    
    # Run migrations
    print_status "Pushing migrations to remote database..."
    supabase db push
    
    print_success "Database migrations completed"
}

# Function to run smoke tests
run_smoke_tests() {
    print_status "Running smoke tests..."
    
    if [ -f "scripts/smoke-test.js" ]; then
        node scripts/smoke-test.js
        if [ $? -eq 0 ]; then
            print_success "Smoke tests passed"
        else
            print_warning "Smoke tests failed - check your configuration"
        fi
    else
        print_warning "Smoke test script not found"
    fi
}

# Function to show deployment options
show_help() {
    echo "BetMe App Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  vercel          Deploy to Vercel"
    echo "  netlify         Deploy to Netlify"
    echo "  github-pages    Deploy to GitHub Pages"
    echo "  custom          Prepare for custom server deployment"
    echo "  build-only      Only build the application"
    echo "  migrate         Run database migrations"
    echo "  test            Run smoke tests"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 vercel       # Deploy to Vercel"
    echo "  $0 netlify      # Deploy to Netlify"
    echo "  $0 build-only   # Only build, don't deploy"
    echo ""
}

# Main script logic
main() {
    case "${1:-help}" in
        "vercel")
            check_prerequisites
            build_app
            run_migrations
            deploy_vercel
            run_smoke_tests
            ;;
        "netlify")
            check_prerequisites
            build_app
            run_migrations
            deploy_netlify
            run_smoke_tests
            ;;
        "github-pages")
            check_prerequisites
            build_app
            run_migrations
            deploy_github_pages
            run_smoke_tests
            ;;
        "custom")
            check_prerequisites
            build_app
            run_migrations
            deploy_custom
            run_smoke_tests
            ;;
        "build-only")
            check_prerequisites
            build_app
            print_success "Build completed. Run deployment manually."
            ;;
        "migrate")
            run_migrations
            ;;
        "test")
            run_smoke_tests
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"
