.PHONY: help up down build logs seed test-backend test-frontend lint-frontend type-check clean

# Default target
help:
	@echo ""
	@echo "SleepSense AI — Development Commands"
	@echo "======================================"
	@echo "  make up              Start all services (Docker)"
	@echo "  make down            Stop all services"
	@echo "  make build           Rebuild all Docker images"
	@echo "  make logs            Tail logs from all services"
	@echo "  make seed            Seed the database with demo data"
	@echo "  make migrate         Run database migrations"
	@echo "  make test-backend    Run Python pytest suite"
	@echo "  make test-frontend   Run Jest test suite"
	@echo "  make lint-frontend   Run ESLint on frontend"
	@echo "  make type-check      TypeScript type check"
	@echo "  make clean           Remove containers and volumes"
	@echo ""

# Docker commands
up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose up --build -d

logs:
	docker-compose logs -f

# Database
migrate:
	docker exec sleepsense_backend alembic upgrade head

seed:
	docker exec sleepsense_backend python seed.py

# Testing
test-backend:
	cd sleepsense-backend && python -m pytest tests/ -v

test-frontend:
	cd sleepsense-frontend && npm test -- --watchAll=false

# Code quality
lint-frontend:
	cd sleepsense-frontend && npm run lint

type-check:
	cd sleepsense-frontend && npm run type-check

# Cleanup
clean:
	docker-compose down -v --remove-orphans
	docker system prune -f
