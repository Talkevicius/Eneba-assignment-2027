# Eneba Marketplace MVP

A digital video game marketplace assignment. The Laravel API supports account authentication, product and offer browsing, homepage sections, simulated checkout, digital-key delivery, and order history. The React frontend is currently the Vite starter screen; marketplace UI and API integration are pending.

## Technology stack

- **Frontend:** React, TypeScript, Vite, and custom CSS.
- **Backend:** PHP 8.2+, Laravel 12, REST API, and Laravel Sanctum personal access tokens.
- **Database:** PostgreSQL is the project target; Laravel's local environment template currently defaults to SQLite. The database schema is managed with Laravel migrations and seeders.
- **Frontend tooling:** Node.js, npm, TypeScript, ESLint.

## Implemented backend features

- Registration, login, logout, and authenticated-user endpoints.
- Product listing, title search, category/platform/region and price filters, sorting, pagination, and product details with active seller offers.
- Scheduled homepage banners, best sellers based on successful order items, and discounted offers.
- Authenticated checkout with database-priced totals, simulated successful payment, and transactional digital-key assignment.
- Authenticated, user-scoped order history and order details. Keys are returned only for successful orders.
- Repeatable demo data seeders for categories, platforms, regions, sellers, products, offers, digital keys, and banners.
- Five authentication feature tests, five checkout feature tests, and order-history feature tests. Run the suite as described below.

See [API documentation](docs/api.md) for endpoint contracts and examples.

## Repository structure

```text
.
├── backend/
│   ├── app/Http/Controllers/   # API controllers
│   ├── app/Http/Requests/     # API validation
│   ├── app/Http/Resources/    # JSON response resources
│   ├── app/Models/            # Eloquent models
│   ├── app/Services/          # Catalog, homepage, checkout, and order logic
│   ├── database/migrations/   # Laravel schema migrations
│   ├── database/seeders/      # Demo data
│   ├── routes/api.php         # API routes
│   └── tests/                 # PHPUnit tests
├── docs/                      # Architecture, schema, and API documentation
└── frontend/
    ├── src/                   # Current Vite/React starter application
    ├── package.json
    └── vite.config.ts
```

## Prerequisites

- PHP 8.2 or later with the extensions required by Laravel. Enable `pdo_pgsql` for PostgreSQL and `pdo_sqlite` for the in-memory feature tests.
- Composer.
- Node.js compatible with the locked Vite version (Node 20.19+ or Node 22.12+), and npm.
- A PostgreSQL development database for the project's target configuration, or SQLite for local development where appropriate.

## Local setup

### Backend

In PowerShell:

```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
```

The checked-in `.env.example` defaults to SQLite. To use PostgreSQL, edit `backend/.env` locally and set `DB_CONNECTION=pgsql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` for your own development database. Keep credentials out of source control and never paste real secrets into documentation. The Laravel PostgreSQL connection is defined in `backend/config/database.php`.

Before running migrations or seeders, verify that `.env` points to the intended development database. For a new development database, the repository supports:

```powershell
php artisan migrate --seed
```

This creates the schema and demo data. Do not use a destructive reset command against a shared or valuable database. The project’s existing shared development database has already been migrated and seeded; it does not need to be reinitialized for normal API development.

Start the API development server:

```powershell
php artisan serve
```

The default local base URL is `http://127.0.0.1:8000`; API routes are under `/api`.

### Frontend

In a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Vite prints the local development URL. `npm run build` and `npm run lint` are also defined in `frontend/package.json`. The frontend currently displays the default Vite starter screen. Marketplace pages, backend API integration, and a frontend API base-URL setting are pending.

## Backend tests

From `backend/`, run:

```powershell
php artisan test
```

`backend/phpunit.xml` forces `DB_CONNECTION=sqlite` and `DB_DATABASE=:memory:` for PHPUnit. Feature tests use `RefreshDatabase`, so they use an isolated in-memory test database rather than the configured Supabase development database. Do not remove these forced testing settings or point tests at a shared database.

## Deployment

Deployment instructions are pending. The architecture plans for Vercel, Render, and Supabase, but deployment configuration is not included in the current repository implementation.
