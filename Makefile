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

.PHONY: help dev build preview lint format test clean \
        db-start db-stop db-reset db-migrate db-status db-seed db-push db-pull \
        layer plan apply deploy logs verify status \
        release rollback health-check

# Ensure correct working directory for scripts
export PROJECT_ROOT := $(PWD)

# ============================================================================
# HELP
# ============================================================================

help:
	@echo "Warehouse Pickup Queue - Available Commands"
	@echo "============================================"
	@echo ""
	@echo "DEVELOPMENT"
	@echo "  make dev            - Start Nuxt dev server"
	@echo "  make build          - Build for production"
	@echo "  make preview        - Preview production build locally"
	@echo "  make lint           - Run ESLint"
	@echo "  make format         - Auto-fix formatting (Prettier + ESLint)"
	@echo "  make test           - Run tests"
	@echo ""
	@echo "DATABASE (Supabase)"
	@echo "  make db-start       - Start local Supabase (Docker)"
	@echo "  make db-stop        - Stop local Supabase"
	@echo "  make db-reset       - Reset local database (destructive)"
	@echo "  make db-migrate     - Run pending migrations"
	@echo "  make db-status      - Show migration status"
	@echo "  make db-seed        - Seed database with sample data"
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
# DEVELOPMENT
# ============================================================================

# Start Nuxt development server
dev:
	@echo "🚀 Starting Nuxt dev server..."
	@npx nuxt dev

# Build for production
build:
	@echo "📦 Building for production..."
	@npx nuxt build

# Preview production build
preview:
	@echo "👀 Previewing production build..."
	@npx nuxt preview

# Run ESLint
lint:
	@echo "🔍 Running ESLint..."
	@npx eslint . --ext .vue,.js,.ts,.tsx

# Auto-fix formatting
format:
	@echo "🔧 Fixing formatting..."
	@npx prettier --write "**/*.{vue,js,ts,json,md}"
	@npx eslint . --ext .vue,.js,.ts,.tsx --fix
	@echo "✅ Formatting complete"

# Run tests
test:
	@echo "🧪 Running tests..."
	@npx vitest run

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
	@rm -rf .nuxt/
	@rm -rf .output/
	@rm -rf node_modules/.cache/
	@echo "✅ Clean complete"

# Destroy infrastructure (dangerous!)
destroy:
	@echo "⚠️  WARNING: This will destroy all infrastructure for ENV=$(ENV)"
	@echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
	@sleep 5
	@cd infra && tofu destroy -var-file="$(ENV).tfvars" -state="$(STATE_FILE)"
