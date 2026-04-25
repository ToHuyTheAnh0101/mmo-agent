# Technology Stack

**Last Updated:** 2026-04-25

## Overview

This document captures the technology stack used in the fb-insight-agent project.

## Runtime & Language

| Component | Technology | Version | Notes |
|-----------|------------|---------|-------|
| Runtime | Node.js | >= 18.0.0 | Required for modern JavaScript features |
| Language | JavaScript | ES Modules compatible | CommonJS syntax (require/exports) |
| Package Manager | npm | Comes with Node.js | Uses package-lock.json |

## Web Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | ^5.2.1 | RESTful API server framework |

## Core Dependencies

### HTTP & Networking
- `axios` (^1.15.2) - HTTP client for external API calls
- `cors` (^2.8.6) - Cross-origin resource sharing middleware

### Browser Automation
- `puppeteer` (^24.42.0) - Headless Chrome control for Facebook automation

### Utilities
- `dotenv` (^17.4.2) - Environment variable loading from `.env` files
- `otplib` (^13.4.0) - One-time password library for 2FA

## Development Dependencies

| Tool | Version | Purpose |
|------|---------|---------|
| eslint | ^10.2.1 | Code linting |
| eslint-config-prettier | ^10.1.8 | ESLint-Prettier compatibility |
| eslint-plugin-prettier | ^5.5.5 | ESLint integration for Prettier |
| nodemon | ^3.1.14 | Development auto-reload |
| prettier | ^3.8.3 | Code formatting |

## Configuration Files

| File | Purpose |
|------|---------|
| `.eslintrc.js` | ESLint configuration |
| `.prettierrc` | Prettier formatting rules |
| `package.json` | Dependencies and npm scripts |
| `package-lock.json` | Locked dependency versions |

## Environment Configuration

The application uses environment variables configured via `.env`:

```env
PORT=3000
AI_BASE_URL=https://proxy.simpleverse.io.vn/api/v1
AI_MODEL=gpt-5.3-codex
AI_API_KEY=your_api_key_here
FB_UID=your_uid
FB_PASS=your_password
FB_2FA=your_2fa_secret
```

## Node.js Version Requirement

The project requires Node.js >= 18.0.0 based on the README badge. This provides access to modern JavaScript features and improved performance.

## Key Observations

1. **Monolithic Architecture**: Single Express.js application with clear separation via directories
2. **No Database**: Currently uses in-memory storage for tokens (see `fbAutomationService.js`)
3. **Heavy Dependency**: Puppeteer adds significant overhead (~150MB download)
4. **API Integration**: Relies on external APIs (Facebook Graph API, AI proxy)
5. **Development Tools**: Well-configured linting and formatting setup
