-- Enable required PostgreSQL extensions
-- moddatetime: Automatically update updated_at timestamps on row modification

-- Enable moddatetime extension (for automatic updated_at timestamps)
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- Enable uuid-ossp extension (fallback for UUID generation if gen_random_uuid not available)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
