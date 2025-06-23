# Personal Finance Tracker

## Overview

This is a full-stack web application for personal finance management built with React, TypeScript, and Express.js. The application allows users to track expenses, manage categories, set budgets, and view financial insights through interactive charts and dashboards.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and production builds
- **Styling**: Tailwind CSS with custom theme support
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **State Management**: 
  - Zustand for client-side state (theme, expense filters)
  - TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API with proper HTTP status codes

### Database Schema
The application uses a PostgreSQL database with the following main entities:
- **Users**: Basic user authentication and identification
- **Categories**: Expense categories with icons and colors (supports custom categories)
- **Expenses**: Individual expense records with amount, description, category, payment mode, and date
- **Budgets**: Budget limits for categories or overall spending
- **Savings Goals**: Target amounts with progress tracking

## Key Components

### Authentication System
- Currently uses mock user ID (1) for development
- Prepared for future authentication implementation
- Session-based authentication ready with connect-pg-simple

### Expense Management
- Quick expense entry with form validation
- Expense categorization and filtering
- Support for recurring expenses
- Payment mode tracking (Credit Card, Cash, etc.)

### Budget Tracking
- Category-specific budgets
- Overall spending budgets
- Progress visualization with percentages
- Budget alerts and notifications

### Analytics & Reporting
- Monthly spending trends
- Category-wise expense breakdown
- Budget vs actual spending comparisons
- Interactive charts using Chart.js

### UI/UX Features
- Dark/Light theme support with system preference detection
- Responsive design with mobile-first approach
- Loading states and error handling
- Toast notifications for user feedback
- Accessible components following ARIA guidelines

## Data Flow

1. **User Interaction**: User interacts with React components
2. **Form Validation**: Client-side validation using Zod schemas
3. **API Requests**: TanStack Query manages HTTP requests to Express server
4. **Server Processing**: Express routes handle business logic and data validation
5. **Database Operations**: Drizzle ORM performs PostgreSQL operations
6. **Response Handling**: Data flows back through the same chain with proper error handling
7. **UI Updates**: React components re-render with new data

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **UI Components**: Radix UI primitives, Lucide React icons
- **State Management**: TanStack Query, Zustand
- **Styling**: Tailwind CSS, class-variance-authority
- **Utilities**: date-fns for date manipulation, clsx for conditional classes

### Backend Dependencies
- **Server**: Express.js with TypeScript support
- **Database**: Drizzle ORM, Neon Database serverless driver
- **Validation**: Zod for schema validation
- **Session**: connect-pg-simple for PostgreSQL session store
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build Tools**: Vite with React plugin
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESLint configuration (implicit)
- **Database Migrations**: Drizzle Kit for schema management

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with Replit environment
- **Database**: PostgreSQL 16 module in Replit
- **Hot Reload**: Vite dev server with HMR
- **Port Configuration**: Development server on port 5000

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: esbuild bundles server code for Node.js
- **Database**: Neon Database for production PostgreSQL
- **Deployment**: Configured for Replit's autoscale deployment

### Build Commands
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build frontend and backend for production
- `npm run start`: Start production server
- `npm run db:push`: Deploy database schema changes

## Changelog

Changelog:
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.