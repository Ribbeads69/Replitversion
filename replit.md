# Sniper App - Tactical Email Operation System

## Overview

Sniper App is a tactical email campaign management system built with a CIA/Navy SEAL aesthetic and modern full-stack architecture. The application enables operators to manage target databases, create communication templates, build automated operation sequences, and launch precision email campaigns. It features a dark military-themed interface with real-time operational intelligence and campaign monitoring.

## User Preferences

Preferred communication style: Simple, everyday language.
Design aesthetic: Military/CIA/Navy SEAL operator theme - "feel like a savage"
Font preference: Calibri size 11pt for text editing
Branding: "Sniper App" with tactical terminology throughout

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **File Uploads**: Multer for handling file uploads (CSV imports)
- **Session Management**: Express sessions with PostgreSQL store

### Key Components

#### Database Schema
- **Contacts**: Stores prospect information with engagement tracking
- **Templates**: Email template management with versioning
- **Sequences**: Multi-step email automation workflows
- **Campaigns**: Campaign execution and performance tracking
- **Campaign Contacts**: Junction table for campaign-contact relationships

#### API Structure
- RESTful API design with Express.js
- Organized route handlers in `/server/routes.ts`
- Centralized storage interface in `/server/storage.ts`
- Comprehensive error handling and request logging

#### Frontend Pages
- **Mission Control**: Real-time operational metrics and activity overview
- **Target Database**: Contact management with bulk import capabilities
- **Communication Arsenal**: Rich email template editor with preview and subject line variables
- **Operation Sequences**: Visual sequence builder with extended wait time options
- **Active Operations**: Campaign creation and monitoring with military terminology

## Data Flow

1. **Contact Management**: Users import contacts via CSV or manual entry
2. **Template Creation**: Rich text email templates with variable substitution
3. **Sequence Building**: Multi-step automated workflows with timing controls
4. **Campaign Launch**: Associate sequences with contact lists for execution
5. **Analytics**: Real-time tracking of opens, clicks, and responses

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connectivity
- **drizzle-orm**: Type-safe database queries and migrations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI component primitives
- **react-hook-form**: Form state management and validation
- **zod**: Runtime type validation and schema definition

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production builds
- **drizzle-kit**: Database migration management
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Deployment Strategy

### Development Environment
- Vite development server with HMR (Hot Module Replacement)
- Express.js API server with TypeScript compilation
- Database migrations managed through Drizzle Kit
- Environment variables for database connectivity

### Production Build
- Vite builds optimized frontend bundle to `/dist/public`
- esbuild compiles server code to `/dist`
- Single Node.js process serves both API and static files
- Database schema deployed via `drizzle-kit push`

### Database Configuration
- PostgreSQL database with UUID primary keys
- Drizzle ORM handles schema definition and migrations
- Connection managed through environment variable `DATABASE_URL`
- Support for both development and production database instances

The application follows a monorepo structure with clear separation between client, server, and shared code. The shared directory contains database schemas and TypeScript types used across both frontend and backend, ensuring type safety throughout the application.

## Recent Changes (January 2025)

✓ Rebranded from "OutreachPro" to "Sniper App" with military/CIA aesthetic
✓ Updated color scheme to dark theme with red accents (primary: hsl(0, 84%, 60%))
✓ Changed navigation terminology: Dashboard→Mission Control, Contacts→Targets, etc.
✓ Implemented Calibri 11pt font for text editing areas
✓ Fixed dashboard metrics sync with real-time contact count updates
✓ Enhanced contact actions with separate edit/delete buttons (military-themed messages)
✓ Improved CSV import to handle first/last names with better column mapping
✓ Added subject line variable insertion in template editor
✓ Extended sequence wait time options (1-30 days, weeks, months)
✓ Fixed sequence "Save Draft" functionality
✓ Created clickable email setup dialog for operator profile configuration
✓ Applied tactical terminology throughout UI (targets, operations, engagement rates)