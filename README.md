# Eneba Marketplace MVP

Live Demo:

An Eneba-inspired digital game marketplace built as a full-stack development assignment. Users can browse games, compare offers from different sellers, manage a shopping cart, create an account, complete simulated purchases, receive digital keys, and view their order history.

## Features

### Marketplace
- Responsive homepage with promotional banners, best sellers, and deals.
- Product catalog with title search, category, platform, region, and price filters.
- Sorting by title and price.
- Product details with available seller offers, platforms, regions, and prices.
- Individual offer cards with direct add-to-cart functionality.

### Shopping and checkout
- Persistent shopping cart using browser local storage.
- Current offer and price validation against the backend.
- Authenticated checkout with simulated payment.
- Transactional order creation and digital-key assignment.
- Order history with pagination.
- Individual order details with delivered digital keys.

### Authentication
- User registration and login.
- Laravel Sanctum bearer-token authentication.
- Protected checkout and order-history pages.
- Logout and authenticated-user functionality.

## Technology stack

| Area | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | SCSS |
| Backend | PHP 8.2+, Laravel 12 |
| API | REST API, Laravel Sanctum |
| Database | PostgreSQL |
| Testing | PHPUnit, SQLite in-memory database |
| Development tools | Node.js, npm, Composer, ESLint |

## Architecture

The project uses a modular monolith architecture:

- **Frontend:** React application responsible for the user interface, routing, authentication state, and shopping cart.
- **Backend:** Laravel REST API responsible for authentication, catalog data, offers, checkout, order management, and digital-key delivery.
- **Database:** PostgreSQL stores users, products, sellers, offers, orders, and digital keys.
- **Cart:** Stored in browser local storage. Prices are retrieved and validated by the backend during checkout.

The backend recalculates order totals using database prices rather than trusting prices submitted by the frontend. Checkout uses database transactions to ensure that orders and digital-key assignments are handled consistently.

See [Architecture](docs/architecture.md), [Database Schema](docs/database-schema.md), and [API Documentation](docs/api.md) for more details.

## Repository structure

```text
.
├── backend/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── architecture.md
│   ├── database-schema.md
│   ├── api.md
│   └── agent-history.md
├── AGENTS.md
└── README.md
```

## Prerequisites

- PHP 8.2 or later with the required Laravel extensions, including `pdo_pgsql` and `pdo_sqlite`.
- Composer.
- Node.js 20.19+ or 22.12+ and npm.
- PostgreSQL database.

## Local setup

### Backend

From the repository root, open PowerShell:

```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
```

Configure your local `backend/.env` file with your PostgreSQL connection details:

```env
DB_CONNECTION=pgsql
DB_HOST=your-database-host
DB_PORT=5432
DB_DATABASE=your-database-name
DB_USERNAME=your-database-user
DB_PASSWORD=your-database-password
```

For a new development database, run:

```powershell
php artisan migrate --seed
```

This creates the database schema and populates it with demo data.

Start the Laravel development server:

```powershell
php artisan serve
```

The default local API URL is `http://127.0.0.1:8000/api`.

### Frontend

Open a second terminal from the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

Vite will display the local development URL.

Configure the frontend API base URL according to the existing API client configuration before connecting it to a different backend environment.

## Testing

### Backend

From the `backend` directory:

```powershell
php artisan test
```

The backend includes feature tests for:
- Authentication and token handling.
- Checkout validation, order creation, and digital-key assignment.
- User-scoped order history and order details.

PHPUnit is configured to use an isolated SQLite in-memory database. Tests do not use the configured PostgreSQL development database.

### Frontend

From the `frontend` directory:

```powershell
npm run build
npm run lint
```

## API documentation

See [docs/api.md](docs/api.md) for available endpoints, authentication requirements, request formats, response structures, and validation errors.

## Deployment

The planned deployment architecture uses:

- **Frontend:** Vercel.
- **Backend:** Render.
- **Database:** Supabase PostgreSQL.

Deployment configuration and public application URLs will be added after deployment.

## Project scope

This project implements a simulated digital game marketplace for demonstration and assignment purposes.

Payments are simulated; no real payment provider or financial transactions are involved. Seller management and real payment processing are outside the scope of this MVP.
