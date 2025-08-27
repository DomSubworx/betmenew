# Contributing to BetMe App

Thank you for your interest in contributing to BetMe App! This document provides guidelines for contributing to the project.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/betmenew.git`
3. **Install** dependencies: `npm install`
4. **Create** a feature branch: `git checkout -b feature/amazing-feature`
5. **Make** your changes
6. **Test** your changes: `npm test && node scripts/smoke-test.js`
7. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
8. **Push** to your branch: `git push origin feature/amazing-feature`
9. **Open** a Pull Request

## 🌿 Branch Strategy

### Main Branches
- **`main`**: Production-ready code, always deployable
- **`develop`**: Integration branch for features and fixes

### Feature Branches
- **`feature/*`**: New features (e.g., `feature/user-authentication`)
- **`fix/*`**: Bug fixes (e.g., `fix/token-calculation-bug`)
- **`hotfix/*`**: Critical production fixes (e.g., `hotfix/security-vulnerability`)
- **`docs/*`**: Documentation updates (e.g., `docs/api-reference`)

### Branch Naming Convention
```
type/description-in-kebab-case

Examples:
- feature/user-profile-photos
- fix/bet-voting-logic
- hotfix/security-patch
- docs/deployment-guide
```

## 📝 Commit Style

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- **`feat`**: New feature
- **`fix`**: Bug fix
- **`docs`**: Documentation changes
- **`style`**: Code style changes (formatting, missing semicolons, etc.)
- **`refactor`**: Code refactoring
- **`test`**: Adding or updating tests
- **`chore`**: Build process or auxiliary tool changes

### Examples
```bash
feat(betting): add 3-day voting window with automatic expiration
fix(auth): resolve user session persistence issue
docs(readme): update deployment instructions
style(components): fix indentation in BetDetailView
refactor(services): extract common database logic
test(api): add integration tests for bet creation
chore(deps): update Supabase client to latest version
```

## 🔧 Development Workflow

### 1. Setup Development Environment
```bash
# Clone and setup
git clone https://github.com/YOUR_USERNAME/betmenew.git
cd betmenew
npm install

# Setup environment
cp env.example .env
# Edit .env with your Supabase credentials

# Start local development
npm run dev:supabase
```

### 2. Making Changes
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Test locally
npm test
node scripts/smoke-test.js

# Commit changes
git add .
git commit -m 'feat(scope): description of changes'

# Push to your fork
git push origin feature/your-feature-name
```

### 3. Testing Requirements
Before submitting a PR, ensure:
- ✅ All tests pass: `npm test`
- ✅ Smoke tests pass: `node scripts/smoke-test.js`
- ✅ Code builds successfully: `npm run build`
- ✅ No ESLint warnings: Check console output
- ✅ Both demo and Supabase modes work

### 4. Database Changes
If you're making database changes:

1. **Create a new migration**:
   ```bash
   # Add new migration file to supabase/migrations/
   # Use timestamp prefix: YYYYMMDDHHMMSS_description.sql
   ```

2. **Update schema documentation**:
   - Update `docs/schema-inventory.md`
   - Document any new tables, fields, or constraints

3. **Test migrations**:
   ```bash
   npm run db:migrate:local
   npm run db:seed:local
   ```

## 📋 Pull Request Checklist

Before submitting your PR, ensure:

### Code Quality
- [ ] Code follows project style guidelines
- [ ] No console.log statements in production code
- [ ] Proper error handling implemented
- [ ] TypeScript types are correct (if applicable)
- [ ] No hardcoded values or secrets

### Testing
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Smoke tests pass
- [ ] Both demo and Supabase modes tested
- [ ] Mobile responsiveness verified

### Documentation
- [ ] README updated if needed
- [ ] Code comments added for complex logic
- [ ] API changes documented
- [ ] Migration files include comments

### Security
- [ ] No sensitive data exposed
- [ ] RLS policies updated if needed
- [ ] Input validation implemented
- [ ] Authentication checks in place

### Performance
- [ ] No unnecessary database queries
- [ ] Efficient data structures used
- [ ] Real-time subscriptions optimized
- [ ] Bundle size impact considered

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**: OS, browser, Node.js version
2. **Steps to reproduce**: Clear, numbered steps
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Console errors**: Any error messages
7. **Additional context**: Any relevant information

## 💡 Feature Requests

When requesting features, please include:

1. **Problem description**: What problem does this solve?
2. **Proposed solution**: How should it work?
3. **Use cases**: Who would benefit and how?
4. **Mockups/wireframes**: If applicable
5. **Alternative solutions**: Other ways to solve the problem

## 🔒 Security

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security issues to: [security@betmeapp.com]
- Include detailed description and steps to reproduce
- Allow time for investigation and fix

### Security Guidelines
- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Implement proper authentication and authorization
- Follow OWASP security guidelines

## 📚 Resources

### Development
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Code Style
- [Conventional Commits](https://www.conventionalcommits.org/)
- [JavaScript Standard Style](https://standardjs.com/)
- [React Best Practices](https://react.dev/learn)

### Testing
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## 🤝 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Discord**: Join our community server (link in README)
- **Email**: For security issues or private matters

## 🙏 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor hall of fame
- Special mentions in documentation

---

**Thank you for contributing to BetMe App! 🎯💰**
