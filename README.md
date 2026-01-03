# PitStop - Car Maintenance Management System

![PitStop Logo](src/app/Logo.png)

A full-stack car maintenance management application built with Nextjs.

## Features

- **Authentication**: User registration and login with NextAuth.js
- **Car Management**: Track vehicles and their service history
- **Mechanic Management**: Manage your service team
- **Service Scheduling**: Create and track maintenance services with mechanic assignments
- **Dashboard**: View statistics and recent activity
- **Responsive Design**: Design that works on all devices

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **UI Components**: Shadcn UI with custom Racing Blue theme
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL 17
- **Authentication**: NextAuth.js v5
- **Validation**: Zod
- **Package Manager and Runtime**: Bun
- **Testing**: Jest with pg-mem for in-memory database testing

## Prerequisites

Make sure you have the following installed:

- **Bun** (v1.0+): [Install Bun](https://bun.sh)
- **PostgreSQL** (v17+): Database server (local or remote)

## Local Setup Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/Marijn17s/PitStop
cd PitStop
```

### Step 2: Install Dependencies

```bash
bun install
```

### Step 3: Environment Variables Setup

Create a `.env.local` file in the root directory with the following required variables:

```env
# Database Connection
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://PitStop_direction:5fb625aebfe8224eb6a76851415a6ddcf86555a6@vtd917.h.filess.io:5434/PitStop_direction

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# Application URL
# Update this to your production URL when deploying
NEXTAUTH_URL=http://localhost:3000
```

**Important Notes:**
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- For production, use a secure `NEXTAUTH_SECRET`
- Update `NEXTAUTH_URL` to match your production domain when deploying

### Step 4: Database Setup

Run the database migrations to create all required tables:

```bash
bun run src/lib/db/migrate.ts
```

This will execute all SQL migration files in `src/lib/db/migrations/` in order.

**Alternative**: If you prefer to run migrations manually, execute the SQL files from `src/lib/db/migrations/` in sequential order.

### Step 5: Verify Setup

Ensure your database connection is working by checking that migrations completed successfully. You should see output indicating tables were created.

## How to Run

### Development Mode

Start the development server

```bash
bun dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

Build the application (make sure you have a .env.production file)

```bash
bun run build
```

Start the production server:

```bash
bun start
```

**Note**: Make sure to set production environment variables before building.

### Testing

Run all tests:

```bash
bun test
```

Run only unit tests:

```bash
bun test:unit
```

Run only integration tests:

```bash
bun test:integration
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── cars/             # Car-related components
│   ├── mechanics/        # Mechanic-related components
│   └── services/         # Service-related components
├── lib/                  # Utility functions
│   └── db/              # Database configuration and queries
│       ├── migrations/  # SQL migration files
│       └── queries/     # Database query functions
├── actions/             # Server actions
└── types/              # TypeScript type definitions
```

## Database Schema

- **users**: User accounts (used to log into the application)
- **car**: Car information
- **mechanic**: Mechanics
- **service**: Maintenance appointments
- **service_mechanics**: Many-to-many relationship between services and mechanics

## Features in Detail

### Cars Module
- Complete CRUD operations
- Search functionality
- Service history tracking
- Owner information

### Mechanics Module
- Team member management
- Experience tracking
- Service assignment history

### Services Module
- Multi-mechanic assignment
- Status tracking (scheduled, in progress, completed, cancelled)
- Date range management
- Notes and details

### Dashboard
- Real-time statistics
- Recent activity feed
- Quick action buttons

## Color Scheme

- **Primary**: Racing Blue (#2563eb)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f97316)
- **Danger**: Red (#ef4444)
- **Neutral**: Slate grays

## Available commands

```bash
# Development
bun dev                    # Start development server

# Production (make sure you have a .env.production file)
bun run build     # Build for production
bun start         # Start production server

# Testing
bun test                   # Run all tests
bun test:unit              # Run only unit tests
bun test:integration       # Run only integration tests

# Code Quality
bun run lint               # Run ESLint

# Database
bun run src/lib/db/migrate.ts  # Run database migrations
```

## Troubleshooting

### Database Connection Issues

**Error: "DATABASE_URL environment variable is not set"**
- Make sure `.env.local` exists in the root directory
- Make sure you set `DATABASE_URL` correctly

**Error: "Connection refused" or "Connection timeout"**
- Verify that your database is running and available
- Check your database credentials in `DATABASE_URL`

**Error: "schema 'PitStop_direction' does not exist"**
- Run migrations: `bun run src/lib/db/migrate.ts`
- Verify migrations completed successfully
- Check database connection string includes correct database name
- Create schema `PitStop_direction` manually if necessary

### Development Server Issues

**Port 3000 already in use**
- Stop other applications using port 3000
- Or use a custom port: `bun dev --port 3001`

**Module not found errors**
- Run `bun install` to ensure all dependencies are installed
- Delete `node_modules` and `.next` folders, then reinstall
- Check that you're using Bun, not npm/yarn

**Build errors**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && bun install`
- Check TypeScript errors: `bun run lint`

### Authentication Issues

**"Invalid credentials" on login**
- Verify user exists in database
- Check password was hashed correctly during registration
- Ensure `NEXTAUTH_SECRET` is set in `.env.local`

**Session not persisting**
- Check `NEXTAUTH_URL` matches your current URL
- Verify cookies are enabled in browser
- Check browser console for errors

## Security

- **Password Hashing**: bcrypt with 12 rounds
- **SQL Injection Protection**: Parameterized queries
- **CSRF Protection**: Built-in NextAuth.js protection
- **Input Validation**: Zod schemas on client and server
- **Route Protection**: Middleware protects authenticated routes

## Testing

The project has great test coverage:

- **Unit tests**: Database queries and utility functions
- **Integration tests**: Server actions
- **Test framework**: Jest with pg-mem (in-memory PostgreSQL)

## Deployment

### Environment Variables for Production

Before deploying, ensure you have:

1. **Strong NEXTAUTH_SECRET**
2. **Production DATABASE_URL**
3. **Correct NEXTAUTH_URL**: Set to your production domain ( `https://yourdomain.com`)