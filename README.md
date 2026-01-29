# Warehouse Pickup Queue

A queue management system for warehouse pickups. Customers submit pickup requests, staff manage the queue, and everyone sees real-time status updates.

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (for local Supabase)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Setup

1. **Start local Supabase:**
   ```bash
   supabase start
   ```
   This runs PostgreSQL, Auth, Storage, and other Supabase services locally.

2. **Install staff app dependencies:**
   ```bash
   cd staff && pnpm install
   ```

3. **Configure environment:**
   ```bash
   # Get the anon key
   supabase status -o json | jq -r '.ANON_KEY'

   # Create staff/.env
   cat > staff/.env << EOF
   SUPABASE_URL=http://127.0.0.1:54321
   SUPABASE_KEY=<paste anon key here>
   EOF
   ```

4. **Start the staff app:**
   ```bash
   cd staff && pnpm dev
   ```
   Staff dashboard runs at http://localhost:3000

### Local Services

| Service | URL | Description |
|---------|-----|-------------|
| Staff App | http://localhost:3000 | Staff dashboard (Nuxt) |
| Supabase Studio | http://127.0.0.1:54323 | Database UI |
| Supabase API | http://127.0.0.1:54321 | REST/Auth API |
| Mailpit | http://127.0.0.1:54324 | Email testing (view sent emails) |
| PostgreSQL | localhost:54322 | Direct database access |

### Test Credentials

Create a test staff user for local development:

```bash
make db-create-test-user
```

| Field | Value |
|-------|-------|
| Email | `staff@example.com` |
| Password | `password123` |

To create additional users, use Supabase Studio (http://127.0.0.1:54323) → Authentication → Users → Add user.

### Useful Commands

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# View Supabase status and credentials
supabase status

# Reset database (re-run migrations and seed)
supabase db reset

# View logs
supabase logs

# Start staff app dev server
cd staff && pnpm dev
```

## Project Structure

```
├── staff/               # Staff dashboard (Nuxt 4) - queue management UI
├── customer/            # Customer app (future) - pickup request submission
├── infra/               # OpenTofu infrastructure (Lambda, API Gateway)
├── lambda/              # AWS Lambda functions (NetSuite integration)
├── supabase/            # Supabase configuration and migrations
│   ├── migrations/      # Database migrations
│   ├── seed.sql         # Seed data for development
│   └── config.toml      # Local Supabase configuration
└── .planning/           # Project planning documents
```
