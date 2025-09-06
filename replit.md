# Discord Server Application System

## Overview

This is a full-stack web application that manages applications for a Discord server. The system handles three types of applications: admin positions, script submissions, and hack tools. Users must verify their Discord membership before accessing the application system. The platform includes an admin panel for managing applications and controlling application availability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with in-memory storage
- **API Design**: RESTful endpoints with JSON responses
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Temporary Storage**: In-memory storage class for development/testing

### Authentication and Authorization
- **Discord Integration**: Discord.js bot for user verification and guild membership checks
- **Session-based Auth**: Express sessions for maintaining user state
- **Admin Authentication**: Hardcoded admin credentials for admin panel access
- **User Verification**: Discord username verification against guild membership

### Database Schema Design
- **Applications Table**: Stores application data with type, Discord info, form data, and status
- **Application Settings Table**: Controls whether each application type is open/closed
- **Admin Sessions Table**: Manages admin authentication sessions with expiration

### External Service Integrations
- **Discord Bot**: Verifies user membership, sends application notifications, handles application approval/rejection workflows
- **Automated Notifications**: Discord embeds with action buttons for admin responses
- **Role Management**: Automatic Discord role assignment based on application approval

### Development and Build Process
- **Development**: Hot module replacement with Vite dev server
- **Production Build**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Code Organization**: Monorepo structure with shared schema definitions

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database client
- **discord.js**: Discord API library for bot functionality
- **drizzle-orm**: Type-safe SQL ORM with PostgreSQL support
- **express**: Web application framework
- **express-session**: Session middleware for Express

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx**: Conditional CSS class utility

### Form and Validation
- **react-hook-form**: Performant forms with easy validation
- **@hookform/resolvers**: Validation resolvers for React Hook Form
- **zod**: TypeScript-first schema validation
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### Development Tools
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution environment
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development tooling for Replit environment