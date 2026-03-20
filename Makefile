# Warehouse Pickup Queue - Project Makefile
# ==========================================

# Environment configuration (default: dev)
ENV ?= dev
VALID_ENVS := dev prod

# Validate environment
ifeq ($(filter $(ENV),$(VALID_ENVS)),)
$(error Invalid ENV='$(ENV)'. Must be one of: $(VALID_ENVS))
endif

# State file per environment
STATE_FILE := terraform.$(ENV).tfstate

.PHONY: help setup start stop dev build preview lint format test clean \
        db-start db-stop db-reset db-migrate db-status db-seed db-create-test-user db-push db-pull \
        layer plan apply deploy logs verify status \
        release rollback health-check \
        landing-dev landing-build landing-preview landing-test

# Ensure correct working directory for scripts
export PROJECT_ROOT := $(PWD)

# ============================================================================
# HELP
# ============================================================================

help:
	@echo "Warehouse Pickup Queue - Available Commands"
	@echo "============================================"
	@echo ""
	@echo "QUICK START"
	@echo "  make setup          - Install deps, start Supabase, seed DB, create test user"
	@echo "  make start          - Start Supabase + all dev servers (Ctrl+C to stop)"
	@echo "  make stop           - Stop all local services"
	@echo ""
	@echo "STAFF APP (Nuxt)"
	@echo "  make dev            - Start staff app dev server"
	@echo "  make build          - Build staff app for production"
	@echo "  make preview        - Preview staff app production build"
	@echo "  make lint           - Run ESLint on staff app"
	@echo "  make format         - Auto-fix formatting"
	@echo "  make test           - Run tests"
	@echo ""
	@echo "LANDING PAGE (Nuxt)"
	@echo "  make landing-dev     - Start landing page dev server"
	@echo "  make landing-build   - Build landing page for production"
	@echo "  make landing-preview - Preview production build"
	@echo "  make landing-test    - Run landing page tests"
	@echo ""
	@echo "DATABASE (Supabase)"
	@echo "  make db-start       - Start local Supabase (Docker)"
	@echo "  make db-stop        - Stop local Supabase"
	@echo "  make db-reset       - Reset local database (destructive)"
	@echo "  make db-migrate     - Run pending migrations"
	@echo "  make db-status      - Show migration status"
	@echo "  make db-seed        - Seed database with sample data"
	@echo "  make db-create-test-user - Create test staff user"
	@echo "  make db-push        - Push local schema to remote Supabase"
	@echo "  make db-pull        - Pull remote schema to local"
	@echo ""
	@echo "INFRASTRUCTURE (Lambda + API Gateway)"
	@echo "  make layer          - Build Lambda dependencies layer"
	@echo "  make plan           - Preview infrastructure changes"
	@echo "  make apply          - Deploy infrastructure"
	@echo "  make deploy         - Build layer + deploy (shortcut)"
	@echo "  make logs           - Tail Lambda logs"
	@echo "  make verify         - Verify deployed Lambda"
	@echo "  make status         - Show deployment status"
	@echo "  make health-check   - Test API endpoint health"
	@echo ""
	@echo "RELEASES"
	@echo "  make release        - Create tagged release (VERSION=v1.0.0)"
	@echo "  make rollback       - Rollback to previous version"
	@echo ""
	@echo "CLEANUP"
	@echo "  make clean          - Remove build artifacts"
	@echo ""
	@echo "Current Configuration:"
	@echo "  ENV=$(ENV)"
	@echo "  State: infra/$(STATE_FILE)"

# ============================================================================
# QUICK START
# ============================================================================

# Install dependencies, start Supabase, seed database, create test user
setup:
	@echo "Installing staff app dependencies..."
	@cd staff && pnpm install
	@echo ""
	@echo "Installing customer app dependencies..."
	@cd customer && pnpm install
	@echo ""
	@echo "Installing playground app dependencies..."
	@cd playground && pnpm install
	@echo ""
	@echo "Installing landing page dependencies..."
	@cd landing && pnpm install
	@echo ""
	@echo "Starting local Supabase..."
	@npx supabase start
	@echo ""
	@echo "Generating .env files from Supabase credentials..."
	@ANON_KEY=$$(npx supabase status -o json | jq -r '.ANON_KEY') && \
	echo "SUPABASE_URL=http://127.0.0.1:54321" > staff/.env && \
	echo "SUPABASE_KEY=$$ANON_KEY" >> staff/.env && \
	echo "SUPABASE_URL=http://127.0.0.1:54321" > customer/.env && \
	echo "SUPABASE_KEY=$$ANON_KEY" >> customer/.env && \
	echo "  staff/.env created" && \
	echo "  customer/.env created"
	@echo ""
	@echo "Resetting database (migrations + seed)..."
	@npx supabase db reset
	@echo ""
	@echo "Creating test user..."
	@$(MAKE) db-create-test-user
	@echo ""
	@echo "Setup complete! Run 'make start' to launch all services."

# Start Supabase + both dev servers (Ctrl+C to stop)
start:
	@npx supabase start
	@echo ""
	@echo "Starting dev servers..."
	@echo "  Staff app:       http://localhost:3000"
	@echo "  Customer app:    http://localhost:3001"
	@echo "  Playground app:  http://localhost:3002"
	@echo "  Landing page:    http://localhost:3003"
	@echo "  Supabase Studio: http://127.0.0.1:54323"
	@echo ""
	@trap 'kill 0' EXIT; \
	(cd staff && pnpm dev) & \
	(cd customer && pnpm dev --port 3001) & \
	(cd playground && pnpm dev) & \
	(cd landing && pnpm dev) & \
	wait

# Stop all local services
stop:
	@echo "Stopping dev servers..."
	@-pkill -f "nuxt dev" 2>/dev/null || true
	@echo "Stopping local Supabase..."
	@npx supabase stop
	@echo "All services stopped."

# ============================================================================
# STAFF APP (Nuxt)
# ============================================================================

# Start staff app development server
dev:
	@echo "🚀 Starting staff app dev server..."
	@cd staff && pnpm dev

# Build staff app for production
build:
	@echo "📦 Building staff app for production..."
	@cd staff && pnpm build

# Preview staff app production build
preview:
	@echo "👀 Previewing staff app production build..."
	@cd staff && pnpm preview

# Run ESLint on staff app
lint:
	@echo "🔍 Running ESLint..."
	@cd staff && pnpm lint

# Auto-fix formatting
format:
	@echo "🔧 Fixing formatting..."
	@cd staff && pnpm lint --fix
	@echo "✅ Formatting complete"

# Run tests
test:
	@echo "🧪 Running tests..."
	@cd staff && pnpm test

# ============================================================================
# LANDING PAGE (Nuxt)
# ============================================================================

landing-dev:
	@echo "Starting landing page dev server..."
	@cd landing && pnpm dev

landing-build:
	@echo "Building landing page for production..."
	@cd landing && pnpm build

landing-preview:
	@echo "Previewing landing page production build..."
	@cd landing && pnpm preview

landing-test:
	@echo "Running landing page tests..."
	@cd landing && pnpm test

# ============================================================================
# DATABASE (Supabase)
# ============================================================================

# Start local Supabase
db-start:
	@echo "🐳 Starting local Supabase..."
	@npx supabase start

# Stop local Supabase
db-stop:
	@echo "🛑 Stopping local Supabase..."
	@npx supabase stop

# Reset local database (destructive)
db-reset:
	@echo "⚠️  Resetting local database..."
	@npx supabase db reset

# Run pending migrations
db-migrate:
	@echo "📝 Running migrations..."
	@npx supabase migration up

# Show migration status
db-status:
	@echo "📊 Migration status:"
	@npx supabase migration list

# Seed database
db-seed:
	@echo "🌱 Seeding database..."
	@npx supabase db reset --db-only
	@echo "✅ Database seeded"

# Create test user for local development
db-create-test-user:
	@echo "👤 Creating test user..."
	@SERVICE_KEY=$$(supabase status -o json | jq -r '.SERVICE_ROLE_KEY') && \
	curl -s -X POST "http://127.0.0.1:54321/auth/v1/admin/users" \
		-H "Authorization: Bearer $$SERVICE_KEY" \
		-H "apikey: $$SERVICE_KEY" \
		-H "Content-Type: application/json" \
		-d '{"email":"staff@example.com","password":"password123","email_confirm":true}' | jq .
	@echo "✅ Test user created: staff@example.com / password123"

# Push local schema to remote
db-push:
	@echo "⬆️  Pushing schema to remote Supabase..."
	@npx supabase db push

# Pull remote schema to local
db-pull:
	@echo "⬇️  Pulling schema from remote Supabase..."
	@npx supabase db pull

# ============================================================================
# INFRASTRUCTURE (Lambda + API Gateway)
# ============================================================================

# Build Lambda dependencies layer
layer:
	@echo "📦 Building Lambda layer..."
	@cd lambda && ./build-layer.sh
	@echo "✅ Layer built: lambda/layer/python.zip"

# Preview infrastructure changes
plan:
	@echo "🔍 Planning infrastructure for ENV=$(ENV)..."
	@cd infra && tofu plan -var-file="$(ENV).tfvars" -state="$(STATE_FILE)"

# Deploy infrastructure
apply:
	@echo "🚀 Deploying infrastructure for ENV=$(ENV)..."
	@cd infra && tofu apply -var-file="$(ENV).tfvars" -state="$(STATE_FILE)"

# Build and deploy (shortcut)
deploy: layer apply
	@echo "✅ Deployment complete for ENV=$(ENV)"

# Tail Lambda logs
logs:
	@echo "📋 Tailing Lambda logs for ENV=$(ENV)..."
	@FUNCTION_NAME=$$(cd infra && tofu output -state="$(STATE_FILE)" -raw lambda_function_name 2>/dev/null) && \
	if [ -z "$$FUNCTION_NAME" ]; then \
		echo "❌ No Lambda deployed for ENV=$(ENV)"; \
		exit 1; \
	fi && \
	aws logs tail "/aws/lambda/$$FUNCTION_NAME" --follow --since 5m

# Verify deployed Lambda
verify:
	@echo "🔍 Verifying deployed Lambda for ENV=$(ENV)..."
	@FUNCTION_NAME=$$(cd infra && tofu output -state="$(STATE_FILE)" -raw lambda_function_name 2>/dev/null) && \
	if [ -z "$$FUNCTION_NAME" ]; then \
		echo "❌ No Lambda deployed for ENV=$(ENV)"; \
		exit 1; \
	fi && \
	echo "Function: $$FUNCTION_NAME" && \
	aws lambda get-function --function-name "$$FUNCTION_NAME" --query 'Configuration.{Runtime:Runtime,MemorySize:MemorySize,Timeout:Timeout,LastModified:LastModified}' --output table

# Show deployment status
status:
	@echo "📊 Deployment status for ENV=$(ENV):"
	@echo ""
	@cd infra && tofu output -state="$(STATE_FILE)" 2>/dev/null || echo "No infrastructure deployed"

# Health check API endpoint
health-check:
	@echo "🏥 Health check for ENV=$(ENV)..."
	@API_URL=$$(cd infra && tofu output -state="$(STATE_FILE)" -raw api_endpoint 2>/dev/null) && \
	if [ -z "$$API_URL" ]; then \
		echo "❌ No API deployed for ENV=$(ENV)"; \
		exit 1; \
	fi && \
	echo "Testing: $$API_URL" && \
	echo "" && \
	echo "OPTIONS (CORS preflight):" && \
	curl -s -o /dev/null -w "  Status: %{http_code}\n" -X OPTIONS "$$API_URL" -H "Origin: http://localhost:3000" && \
	echo "" && \
	echo "POST without API key (expect 403):" && \
	curl -s -o /dev/null -w "  Status: %{http_code}\n" -X POST "$$API_URL" -H "Content-Type: application/json" -d '{"order_number":"TEST","email":"test@example.com"}'

# ============================================================================
# RELEASES
# ============================================================================

# Create a tagged release
release:
ifndef VERSION
	$(error VERSION is required. Usage: make release VERSION=v1.0.0)
endif
	@echo "🏷️  Creating release $(VERSION)..."
	@git tag -a $(VERSION) -m "Release $(VERSION)"
	@git push origin $(VERSION)
	@echo "✅ Release $(VERSION) created and pushed"

# Rollback to previous version
rollback:
	@echo "⏪ Rolling back ENV=$(ENV)..."
	@echo "Current state:"
	@cd infra && tofu output -state="$(STATE_FILE)" -raw lambda_function_name 2>/dev/null || echo "No deployment found"
	@echo ""
	@echo "To rollback, redeploy a previous version:"
	@echo "  git checkout <previous-tag>"
	@echo "  make deploy ENV=$(ENV)"

# ============================================================================
# CLEANUP
# ============================================================================

# Remove build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf lambda/layer/
	@rm -rf staff/.nuxt/
	@rm -rf staff/.output/
	@rm -rf staff/node_modules/.cache/
	@rm -rf playground/.nuxt/
	@rm -rf playground/.output/
	@rm -rf playground/node_modules/.cache/
	@rm -rf landing/.nuxt/
	@rm -rf landing/.output/
	@rm -rf landing/node_modules/.cache/
	@echo "✅ Clean complete"

# Destroy infrastructure (dangerous!)
destroy:
	@echo "⚠️  WARNING: This will destroy all infrastructure for ENV=$(ENV)"
	@echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
	@sleep 5
	@cd infra && tofu destroy -var-file="$(ENV).tfvars" -state="$(STATE_FILE)"
