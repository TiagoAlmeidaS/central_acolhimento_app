# TaskNote AI

## Overview

TaskNote AI is a productivity micro-SaaS mobile application where AI acts as the primary agent for task entry and organization. Users can create tasks via voice or text input, which are then processed by AI to extract structured task information including title, description, category, priority, and more. The app uses a credit-based system where users have a monthly allocation of AI processing credits.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54 (new architecture enabled)
- **Navigation**: React Navigation v7 with native stack navigators and bottom tab navigation
- **State Management**: TanStack React Query for server state, React Context for auth state
- **UI Components**: Custom themed components with Reanimated for animations
- **Platform Support**: iOS, Android, and Web (single output)

The app follows a tab-based navigation structure with three main tabs (Home, History, Profile) and a floating action button for voice input. Authentication screens are separate from the main flow.

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with tsx for development
- **API Style**: RESTful endpoints with JSON responses
- **Authentication**: Session-based auth with bearer tokens stored in-memory (sessions Map)
- **Password Hashing**: Node.js crypto module with scrypt

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Core Tables**: users, subscriptions, tasks, creditTransactions
- **Migrations**: Managed via drizzle-kit (`npm run db:push`)

### AI Integration
- **Provider**: OpenAI API
- **Purpose**: Parse natural language task input into structured task data
- **Model**: GPT-based (configured in routes.ts)
- **Credit Deduction**: Each AI parse costs credits from user's subscription

### Path Aliases
- `@/*` → `./client/*`
- `@shared/*` → `./shared/*`

Configured in both `tsconfig.json` and `babel.config.js` for runtime resolution.

## External Dependencies

### APIs & Services
- **OpenAI API**: For AI-powered task parsing (requires `OPENAI_API_KEY` environment variable)
- **PostgreSQL Database**: Primary data store (requires `DATABASE_URL` environment variable)

### Key npm Packages
- **expo**: Core framework for cross-platform React Native development
- **drizzle-orm/drizzle-kit**: Database ORM and migration tooling
- **@tanstack/react-query**: Async state management
- **react-native-reanimated**: Animation library
- **express**: Backend web framework

### Future Integrations (Designed but not implemented)
- **Stripe**: Payment processing for subscription management (schema has stripe fields)
- **Apple/Google Sign-In**: SSO authentication (design guidelines specify this)