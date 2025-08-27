# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive Supabase integration setup
- Database migrations with versioned schema
- Row Level Security (RLS) policies
- Custom database functions for token and credibility management
- Real-time subscriptions for live updates
- GitHub Actions CI/CD pipeline
- Local Supabase development environment
- Smoke test scripts for database validation
- Comprehensive documentation and setup guides

### Changed
- Updated environment variable naming to use `NEXT_PUBLIC_` prefix
- Enhanced package.json with database management scripts
- Improved error handling and validation
- Refactored service layer for better separation of concerns

### Fixed
- Token distribution logic in bet completion
- Credibility system double-punishment bug
- User state synchronization issues
- Chat message immediate display
- Friend invitation system reliability

## [1.2.0] - 2024-12-27

### Added
- 3-day voting window with automatic bet expiration
- Bet annulment system with token refunds and penalties
- Majority credibility punishment for voting against consensus
- Comprehensive credibility logging system
- Token transaction history with detailed logging
- Friend invitation system with shareable links
- User profile management with photo uploads
- Real-time chat system within bets
- Mobile-responsive design improvements

### Changed
- Enhanced bet lifecycle management
- Improved token economy with immediate deductions
- Better state management and synchronization
- Updated UI components for new features
- Enhanced error handling and user feedback

### Fixed
- Multiple token calculation bugs
- State update inconsistencies
- User interface responsiveness issues
- Data persistence reliability

## [1.1.0] - 2024-12-20

### Added
- Basic betting functionality
- User authentication system
- Friend management
- Token-based economy
- Basic credibility system

### Changed
- Initial app structure
- Core betting logic
- User interface components

### Fixed
- Basic functionality issues
- User experience improvements

## [1.0.0] - 2024-12-15

### Added
- Initial BetMe app release
- Basic React application structure
- Core betting concepts
- User management system
- Basic UI components

---

## Version History

- **1.0.0**: Initial release with basic functionality
- **1.1.0**: Enhanced betting system and user management
- **1.2.0**: Advanced features including voting windows and credibility system
- **Unreleased**: Complete Supabase integration and production deployment setup

## Migration Notes

### From 1.2.0 to Unreleased
- New environment variables required (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Database schema changes require running migrations
- Service layer refactoring may affect custom integrations

### From 1.1.0 to 1.2.0
- New database fields added for voting system
- Token calculation logic updated
- Credibility system enhanced with logging

### From 1.0.0 to 1.1.0
- Major architectural changes
- New service layer implementation
- Enhanced state management

## Support

For questions about specific versions or migration assistance:
- Check the [README.md](README.md) for detailed setup instructions
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Open an issue for specific problems or questions

---

**Note**: This changelog follows the [Keep a Changelog](https://keepachangelog.com/) format and [Semantic Versioning](https://semver.org/) principles. 