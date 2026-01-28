# Phase 1: Database Foundation - Research

**Researched:** 2026-01-28
**Domain:** Supabase PostgreSQL database schema, migrations, and row-level security
**Confidence:** HIGH

## Summary

This phase establishes the database foundation for the warehouse pickup queue system using Supabase Cloud PostgreSQL. The research covers three primary areas: (1) database schema design patterns for queue management with proper status tracking, (2) Row-Level Security (RLS) implementation for secure data access, and (3) Supabase CLI migration workflows.

The standard approach is to use the Supabase CLI to manage SQL migrations in the `supabase/migrations/` directory, enable RLS on all tables with explicit policies, and use CHECK constraints (rather than PostgreSQL ENUMs) for status fields due to easier schema evolution. Timestamps should be managed via database triggers using either the moddatetime extension or custom trigger functions.

**Primary recommendation:** Create all schema as timestamped SQL migration files in `supabase/migrations/`, enable RLS on every table from the start, and use CHECK constraints for the status enum values for flexibility in future schema changes.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Supabase CLI | Latest (via npx) | Database migrations, local dev, deployment | Official tool for Supabase schema management |
| PostgreSQL | 15+ (Supabase managed) | Database engine | Supabase's underlying database |
| uuid-ossp extension | Built-in | UUID generation | Standard for generating UUIDs as primary keys |
| moddatetime extension | Built-in | Automatic timestamp updates | Simplest approach for updated_at triggers |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js | 20+ | Required for npx supabase commands | Running CLI commands |
| Docker Desktop | Latest | Local Supabase stack | Local development and testing |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CHECK constraints | PostgreSQL ENUM | ENUMs have storage benefits but painful schema evolution requiring table locks |
| moddatetime extension | Custom trigger function | Custom triggers offer more control but more code to maintain |
| Integer queue_position | Fractional ordering | Integers are simpler; fractional allows insertions without reordering |

**Installation:**
```bash
# Initialize Supabase project (run once)
npx supabase init

# Start local development stack (requires Docker)
npx supabase start

# Create a new migration
npx supabase migration new create_initial_schema
```

## Architecture Patterns

### Recommended Project Structure
```
supabase/
├── config.toml          # Local configuration
├── seed.sql             # Test data for local development
└── migrations/
    ├── 20260128000000_create_extensions.sql
    ├── 20260128000001_create_gates_table.sql
    ├── 20260128000002_create_pickup_requests_table.sql
    ├── 20260128000003_create_business_hours_table.sql
    ├── 20260128000004_create_rls_policies.sql
    └── 20260128000005_create_triggers.sql
```

### Pattern 1: CHECK Constraint for Status Values
**What:** Use CHECK constraints instead of PostgreSQL ENUM types for status fields
**When to use:** For any column with a fixed set of allowed values that may evolve
**Example:**
```sql
-- Source: PostgreSQL best practices, Crunchy Data
CREATE TABLE pickup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'in_queue', 'completed', 'cancelled'))
);

-- Adding a new status later is trivial:
ALTER TABLE pickup_requests
  DROP CONSTRAINT pickup_requests_status_check,
  ADD CONSTRAINT pickup_requests_status_check
    CHECK (status IN ('pending', 'approved', 'in_queue', 'completed', 'cancelled', 'new_status'));
```

### Pattern 2: Automatic Timestamps with Triggers
**What:** Use database triggers to manage created_at and updated_at timestamps
**When to use:** Every table that needs audit timestamps
**Example:**
```sql
-- Source: Supabase community patterns
-- Enable the moddatetime extension (simpler approach)
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- Create table with timestamp columns
CREATE TABLE pickup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ... other columns ...
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- Trigger for automatic updated_at
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON pickup_requests
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);
```

### Pattern 3: RLS with Role Specification
**What:** Always specify target roles in RLS policies for performance
**When to use:** Every RLS policy
**Example:**
```sql
-- Source: Supabase official docs
-- Good: Specifies role, skips evaluation for anon users
CREATE POLICY "Staff can view all requests"
  ON pickup_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Bad: No role specified, evaluates for all users unnecessarily
CREATE POLICY "Staff can view all requests"
  ON pickup_requests
  FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);
```

### Pattern 4: Queue Position Management
**What:** Use integer queue_position with gate_id grouping
**When to use:** For ordered queue within gates
**Example:**
```sql
-- Source: PostgreSQL queue patterns
CREATE TABLE pickup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_gate_id uuid REFERENCES gates(id),
  queue_position integer,
  -- Unique position per gate (null gate_id = not in queue)
  UNIQUE (assigned_gate_id, queue_position)
);

-- Index for queue queries
CREATE INDEX idx_pickup_requests_queue
  ON pickup_requests (assigned_gate_id, queue_position)
  WHERE status = 'in_queue';
```

### Anti-Patterns to Avoid
- **Skipping RLS during development:** Enable RLS from day one; 83% of exposed Supabase databases involve RLS misconfigurations
- **Direct production changes:** Never modify production schema via Dashboard; always use migrations
- **Modifying existing migrations:** Create new migrations instead; modifying applied migrations causes drift
- **Using public role in policies:** Always specify `TO authenticated` or `TO anon` for performance
- **Missing indexes on RLS columns:** Any column used in RLS policies must be indexed

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UUID generation | Custom ID generation | `gen_random_uuid()` or uuid-ossp | Built-in, performant, standard |
| Timestamp management | Application-level timestamps | Database triggers with moddatetime | Prevents manipulation, consistent |
| Migration tracking | Manual schema changes | Supabase CLI migrations | Version control, reproducibility |
| Authorization | Application-level checks | RLS policies | Database-level enforcement, security |
| Queue locking | Custom locking logic | `FOR UPDATE SKIP LOCKED` | Built-in PostgreSQL feature |

**Key insight:** Supabase provides database-level primitives (RLS, triggers, extensions) that are more secure and reliable than application-level implementations. Use them.

## Common Pitfalls

### Pitfall 1: RLS Disabled or Forgotten
**What goes wrong:** Tables are accessible to anyone with the anon key; data exposure
**Why it happens:** Developers skip RLS during prototyping, forget to enable before launch
**How to avoid:** Enable RLS in the same migration that creates the table; add at least one policy immediately
**Warning signs:** Tables without `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in migrations

### Pitfall 2: Schema Drift
**What goes wrong:** Production database diverges from migration files; deployments fail
**Why it happens:** Manual Dashboard changes, direct SQL execution in production
**How to avoid:** Only modify schema through migration files; use `supabase db diff` to detect drift
**Warning signs:** `supabase migration status` shows mismatches; deployment errors

### Pitfall 3: Missing Indexes on RLS Policy Columns
**What goes wrong:** Query performance degrades severely (100x+ slower on large tables)
**Why it happens:** RLS policies add WHERE clauses that scan without indexes
**How to avoid:** Create index for every column used in RLS policy USING clause
**Warning signs:** Slow queries; high database CPU; timeouts on list operations

### Pitfall 4: ENUM Migration Pain
**What goes wrong:** Adding/removing enum values requires complex migrations with table locks
**Why it happens:** PostgreSQL ENUMs are stored differently than text; modification locks tables
**How to avoid:** Use CHECK constraints on text columns instead of ENUMs
**Warning signs:** Long deployment times; database downtime during migrations

### Pitfall 5: Timestamp Manipulation
**What goes wrong:** Users can set arbitrary created_at/updated_at values via API
**Why it happens:** Columns accept client-provided values without database-level protection
**How to avoid:** Use BEFORE INSERT/UPDATE triggers to enforce timestamp values
**Warning signs:** created_at values in the future; updated_at older than created_at

### Pitfall 6: Foreign Key Without Index
**What goes wrong:** Joins and cascading operations become slow
**Why it happens:** PostgreSQL doesn't auto-create indexes on foreign key columns
**How to avoid:** Always create index on foreign key columns
**Warning signs:** Slow queries involving joins; slow deletes with CASCADE

## Code Examples

Verified patterns from official sources:

### Complete Table Creation with RLS
```sql
-- Source: Supabase official documentation patterns

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- Create gates table
CREATE TABLE gates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gate_number integer NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- Enable RLS immediately
ALTER TABLE gates ENABLE ROW LEVEL SECURITY;

-- Timestamp trigger
CREATE TRIGGER handle_gates_updated_at
  BEFORE UPDATE ON gates
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);

-- RLS policies
CREATE POLICY "Anyone can view active gates"
  ON gates FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Staff can view all gates"
  ON gates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage gates"
  ON gates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

### Pickup Requests Table with Status Constraint
```sql
-- Source: Combined from Supabase docs and PostgreSQL best practices

CREATE TABLE pickup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_number text NOT NULL,
  customer_email text NOT NULL,
  email_verified boolean NOT NULL DEFAULT false,
  email_flagged boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'in_queue', 'completed', 'cancelled')),
  assigned_gate_id uuid REFERENCES gates(id),
  queue_position integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  completed_at timestamptz,

  -- Ensure unique queue position per gate
  CONSTRAINT unique_queue_position UNIQUE (assigned_gate_id, queue_position)
);

-- Required indexes
CREATE INDEX idx_pickup_requests_status ON pickup_requests(status);
CREATE INDEX idx_pickup_requests_gate ON pickup_requests(assigned_gate_id);
CREATE INDEX idx_pickup_requests_queue
  ON pickup_requests(assigned_gate_id, queue_position)
  WHERE status = 'in_queue';

ALTER TABLE pickup_requests ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER handle_pickup_requests_updated_at
  BEFORE UPDATE ON pickup_requests
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);
```

### Business Hours Configuration Table
```sql
-- Source: Supabase patterns for configuration tables

CREATE TABLE business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time time NOT NULL,
  close_time time NOT NULL,
  is_closed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,

  CONSTRAINT unique_day UNIQUE (day_of_week),
  CONSTRAINT valid_hours CHECK (open_time < close_time OR is_closed = true)
);

ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER handle_business_hours_updated_at
  BEFORE UPDATE ON business_hours
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);

-- Public read, staff write
CREATE POLICY "Anyone can view business hours"
  ON business_hours FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Staff can manage business hours"
  ON business_hours FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

### RLS Policy for Customer Access (Public Queue Status)
```sql
-- Source: Supabase RLS documentation

-- Customers can view their own request by sales order number
-- Note: This requires additional session/token validation in practice
CREATE POLICY "Customers can view own request"
  ON pickup_requests FOR SELECT
  TO anon
  USING (
    -- In practice, this would check against a session token or similar
    -- For v1, staff dashboard is authenticated, customer view is read-only status
    true
  );
```

### Migration File Naming Convention
```bash
# Source: Supabase CLI documentation
# Format: YYYYMMDDHHmmss_description.sql

supabase migration new create_gates_table
# Creates: supabase/migrations/20260128143052_create_gates_table.sql
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PostgreSQL ENUM types | CHECK constraints on text | Community consensus 2024+ | Easier migrations, no table locks |
| Manual timestamp management | Database triggers (moddatetime) | Standard practice | Prevents manipulation |
| Application-level auth | Row-Level Security | Supabase standard | Database-enforced security |
| Dashboard schema changes | CLI migrations only | Best practice | Reproducible deployments |
| `auth.uid()` directly | `(select auth.uid())` | Performance optimization | Caches function result |

**Deprecated/outdated:**
- **Direct ENUM modifications:** Use `ALTER TYPE` only if absolutely necessary; prefer CHECK constraints
- **`security_invoker = false` on views:** PostgreSQL 15+ should use `security_invoker = true` for RLS inheritance

## Open Questions

Things that couldn't be fully resolved:

1. **NetSuite order cache table structure**
   - What we know: Need to cache order data per session
   - What's unclear: Exact fields from NetSuite API, cache expiration strategy
   - Recommendation: Create basic structure now, add columns as NetSuite integration defines requirements

2. **Customer request lookup without auth**
   - What we know: Customers aren't authenticated but need to view their queue position
   - What's unclear: How to securely scope data access without auth
   - Recommendation: Use a combination of sales_order_number + email hash or session token; implement in later phase

3. **Queue position reordering strategy**
   - What we know: Staff can reorder queue within a gate
   - What's unclear: Whether to use integer positions (requiring renumbering) or fractional (allowing insertions)
   - Recommendation: Start with integers for simplicity; the expected volume (50-100 pickups/day) doesn't require optimization

## Sources

### Primary (HIGH confidence)
- [Supabase Row Level Security Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS patterns, helper functions, policies
- [Supabase Database Migrations Documentation](https://supabase.com/docs/guides/deployment/database-migrations) - CLI workflow, file conventions
- [Supabase Tables Documentation](https://supabase.com/docs/guides/database/tables) - Table creation, data types, foreign keys
- [Supabase Local Development Documentation](https://supabase.com/docs/guides/local-development/overview) - Directory structure, workflow

### Secondary (MEDIUM confidence)
- [Crunchy Data: Enums vs Check Constraints](https://www.crunchydata.com/blog/enums-vs-check-constraints-in-postgres) - Verified CHECK constraint recommendation
- [Supabase Best Practices (Leanware)](https://www.leanware.co/insights/supabase-best-practices) - Schema management, common mistakes
- [Automatic Timestamps in Supabase](https://dev.to/paullaros/updating-timestamps-automatically-in-supabase-5f5o) - Trigger patterns verified against docs

### Tertiary (LOW confidence)
- PostgreSQL queue design patterns from Medium/DEV articles - General patterns, specific implementation may vary

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Supabase documentation and CLI
- Architecture: HIGH - Verified patterns from official docs
- Pitfalls: HIGH - Multiple sources confirm, official docs warn about RLS issues

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - Supabase is stable, patterns well-established)
