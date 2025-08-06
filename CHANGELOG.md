# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-01-XX

### Added
- **Dual-Environment Architecture**: Complete separation between demo and Supabase modes
- **Demo Data Service**: Full local storage implementation with auto-save functionality
- **Unified Data Service**: Facade pattern for environment-agnostic data operations
- **Environment Configuration**: Feature flags and environment detection system
- **Environment Switcher**: UI component for easy demo/Supabase mode switching
- **Toast Notifications**: Global error and success notification system
- **Loading States**: Improved loading indicators throughout the app
- **Comprehensive Documentation**: Complete architecture and setup guides

### Changed
- **BetMeApp Refactoring**: Migrated from direct Supabase calls to unified data service
- **Component Updates**: All components now work with both demo and Supabase data
- **Error Handling**: Improved error handling with user-friendly notifications
- **Data Persistence**: localStorage persistence with 5-second auto-save in demo mode
- **User Experience**: Better loading states and feedback throughout the app

### Fixed
- **Friends Display**: Fixed friends not showing in CreateBetView and ProfileView
- **Credibility Display**: Fixed credibility showing "/100" instead of actual values
- **Bet Creation**: Fixed create bet functionality not working
- **Active Bets Count**: Fixed incorrect active bets display in ProfileView
- **ESLint Warnings**: Removed unused imports and variables
- **Duplicate Functions**: Fixed duplicate `getCredibilityColor` function

### Technical Improvements
- **Service Layer**: Clean separation of concerns with dedicated service modules
- **Configuration Management**: Centralized environment and feature configuration
- **Code Organization**: Better file structure with services directory
- **Type Safety**: Improved data consistency across environments
- **Performance**: Optimized data loading and state management

### Documentation
- **README.md**: Complete rewrite with dual-environment architecture overview
- **DEMO_MODE_README.md**: Comprehensive documentation for demo mode features
- **SETUP.md**: Step-by-step environment setup instructions
- **.env.example**: Template for environment variable configuration
- **CHANGELOG.md**: This changelog file

### Environment Variables
- `REACT_APP_ENVIRONMENT`: Environment mode (`demo` or `supabase`)
- `REACT_APP_USE_SUPABASE`: Enable Supabase integration
- `REACT_APP_USE_DEMO_DATA`: Enable demo data fallback
- `REACT_APP_ENABLE_REALTIME`: Enable real-time subscriptions
- `REACT_APP_DEMO_AUTO_SAVE_INTERVAL`: Auto-save interval in milliseconds
- `REACT_APP_DEMO_PERSIST_TO_LOCALSTORAGE`: Enable localStorage persistence

## [0.1.0] - 2024-01-XX

### Added
- Initial Supabase integration
- Basic betting functionality
- User management system
- Real-time database features
- Basic UI components

---

## Migration Guide

### From v0.1.0 to v1.2.0

1. **Environment Setup**: The app now defaults to demo mode. No environment variables needed for development.
2. **Data Service**: All data operations now go through `dataService` instead of direct Supabase calls.
3. **Configuration**: Use `src/config.js` for environment-specific settings.
4. **Demo Mode**: Full functionality available without database setup.

### Breaking Changes
- None - all existing Supabase functionality is preserved and can be re-enabled via environment variables.

### New Features
- Demo mode with localStorage persistence
- Environment switching capability
- Improved error handling and user feedback
- Comprehensive documentation and setup guides 