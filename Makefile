.PHONY: help install dev build clean db-setup db-seed

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	pnpm install

dev: ## Start development servers
	pnpm dev

build: ## Build all packages
	pnpm build

clean: ## Clean build artifacts
	pnpm clean
	rm -rf node_modules

docker-up: ## Start Docker services (PostgreSQL, Redis)
	docker-compose up -d

docker-down: ## Stop Docker services
	docker-compose down

db-setup: docker-up ## Setup database (requires Docker)
	sleep 5
	cd apps/api && pnpm prisma db push

db-seed: ## Seed database with sample data
	cd apps/api && pnpm prisma db seed

db-studio: ## Open Prisma Studio
	cd apps/api && pnpm prisma studio

setup: install docker-up db-setup db-seed ## Complete setup (install + docker + db + seed)
	@echo "✅ Setup complete! Run 'make dev' to start development"
