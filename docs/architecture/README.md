# Architecture Documentation

## 🏗️ Overview

This directory contains high-level architectural decisions and strategies that apply across multiple features in the Cocktail Compass app.

## 📄 Documentation Index

### Core Architecture Documents
- **[Technical Decisions](./technical-decisions.md)** - Global technology stack and architectural choices
- **[Authentication Strategy](./authentication-strategy.md)** - Authentication and authorization across all features
- **[Database Schema](./database-schema.md)** - Complete database structure and relationships
- **[Performance Guidelines](./performance-guidelines.md)** - Performance standards and optimization strategies

## 🎯 Architectural Principles

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Database**: PostgreSQL with PostGIS for spatial data
- **Caching**: SWR for client-side data management
- **Styling**: Tailwind CSS with custom component system
- **Deployment**: Static site deployment with PWA capabilities

### Design Principles
- **Mobile-First**: All features designed for mobile, enhanced for desktop
- **Performance**: <2s load time for core features
- **Accessibility**: WCAG 2.1 AA compliance
- **Internationalization**: Support for English and Chinese
- **Progressive Enhancement**: Core functionality works without advanced features

### Authentication Strategy
- **Single Sign-On**: Unified auth across all features
- **Protected Routes**: Feature-based access control
- **Progressive Onboarding**: Optional username setup
- **Social Login**: Google OAuth integration

### Data Architecture
- **Spatial Data**: PostGIS for location-based features
- **Real-time**: Supabase real-time subscriptions where needed
- **Caching**: Multi-layer caching (SWR + session storage + URL state)
- **Type Safety**: End-to-end TypeScript with generated Supabase types

## 🔗 Cross-Feature Integration

### Shared Components
- Authentication wrapper (`RequireUsername`)
- Navigation system (bottom nav, header)
- Place cards and place detail components
- Loading states and error handling
- UI component library (`/src/components/ui/`)

### Shared Services
- Auth service with user context
- Place service with bookmark integration
- Media service for image handling
- Analytics service for user tracking

### Shared Types
- User and authentication types
- Place and location types
- API response and error types
- UI component prop types

---

*Global architecture documentation for Cocktail Compass App*  
*Last Updated: January 13, 2025*
