# Overview

This is a comprehensive hotel management system built with a modern full-stack architecture. The application provides complete hotel operations management including room management, booking system, guest services, staff management, maintenance tracking, payment processing, and reporting capabilities. It features a React-based frontend with a professional dashboard interface and an Express.js backend with PostgreSQL database integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS
- **Routing**: Wouter for client-side routing with dedicated pages for each hotel management function
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Styling**: Tailwind CSS with custom hotel-themed color variables and responsive design

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with structured route organization
- **Validation**: Zod schemas shared between frontend and backend
- **Development**: Hot reload with Vite integration in development mode

## Database Design
- **Database**: PostgreSQL with Neon Database serverless hosting
- **Schema**: Comprehensive hotel management schema including:
  - Users and authentication
  - Rooms with status tracking and amenities
  - Guests with preferences and VIP status
  - Bookings with check-in/out dates and pricing
  - Staff management with departments and shifts
  - Maintenance requests with priority levels
  - Payment processing with Stripe integration
  - Guest communications tracking
  - Hotel settings and configuration

## Authentication & Authorization
- **Session Management**: Express sessions with PostgreSQL session store
- **User Roles**: Role-based access control with staff and admin levels
- **Security**: Secure session handling with configurable session storage

## Payment Processing
- **Provider**: Stripe integration for payment processing
- **Features**: Payment intents, subscription management, and customer management
- **Frontend**: React Stripe.js components for secure payment forms

# External Dependencies

## Database Services
- **Neon Database**: PostgreSQL serverless database hosting
- **Connection**: Direct PostgreSQL connection using environment variables

## Payment Processing
- **Stripe**: Complete payment processing platform
  - Customer management and billing
  - Payment intents for secure transactions
  - Subscription handling for recurring payments
  - Frontend payment components integration

## Development & Build Tools
- **Vite**: Frontend build tool and development server
- **Replit Integration**: Development environment with Cartographer and runtime error overlay
- **esbuild**: Backend bundling for production builds

## UI Component Libraries
- **Radix UI**: Headless UI primitives for accessibility and functionality
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form handling with validation
- **TanStack Query**: Server state management and caching
- **Tailwind CSS**: Utility-first CSS framework

## Third-party Service Integrations
- **Cloudbeds**: Property management system integration (referenced in UI)
- **Email Services**: Communication system for guest messaging
- **SMS/Communication**: Guest communication platform integration ready

## Development Dependencies
- **TypeScript**: Type safety across the entire stack
- **Drizzle Kit**: Database migrations and schema management
- **Zod**: Runtime type validation and schema definition
- **ESLint & Prettier**: Code quality and formatting (implied by project structure)