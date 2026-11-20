
# Eneba Marketplace MVP — Architecture

## 1. Project Overview

A digital video game marketplace inspired by Eneba. Users can browse products, compare offers from different sellers, register, purchase digital products through a simulated checkout, and access their purchased digital keys.

The application is designed as a focused MVP. The priority is a complete and functional purchasing journey rather than production-level marketplace complexity.

## 2. Technology Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- CSS (custom styling)

### Backend
- PHP 8.2
- Laravel 12
- REST API
- Laravel Sanctum for authentication

### Database
- PostgreSQL
- Supabase as the hosted database provider
- Laravel migrations and seeders for database management

### Development and Deployment
- Git and GitHub
- Visual Studio Code
- OpenAI Codex for agentic development
- Vercel for frontend hosting
- Render for backend hosting
- Supabase for database hosting


## 3. Application Architecture

The application follows a modular monolith architecture.

The system consists of:
- One React frontend application.
- One Laravel backend application.
- One PostgreSQL database.

The Laravel backend is organized into separate controllers, services, models and request validation classes. Each component has a clearly defined responsibility.

Business logic is separated into dedicated services, while controllers handle HTTP requests and responses.

The homepage contains independently managed sections. Each section has its own API endpoint and dedicated backend service, but all services operate within the same Laravel application and use the shared PostgreSQL database.

The promotional banner section reads from the `banners` table through `BannerService`.

The frontend communicates with the backend exclusively through REST API endpoints. It does not access the database directly.


## 4. Main Application Modules

### Homepage
The homepage consists of independently managed content sections:
- Promotional banners
- Best sellers
- Special deals

Each section receives its content from a dedicated backend API endpoint. Product and promotional content must not be hardcoded in frontend components.

### Store
- Browse the product catalog.
- Filter by platform, region and price.
- Sort products by price and popularity.
- Search products by name.

### Search
- Search from anywhere in the application.
- Support partial product-name matching.
- Implement basic typo tolerance where practical.

### Product Details
- Display product information.
- Display available offers from multiple sellers.
- Show seller, region, platform and price.
- Allow the buyer to select an offer.

### Authentication
- User registration.
- User login and logout.
- Protected checkout and order history.
- Token-based API authentication.

### Shopping Cart and Checkout
- Add and remove selected offers.
- Calculate the total price.
- Require authentication before checkout.
- Simulate payment without processing real money.
- Create an order after successful simulated payment.

### Digital Key Delivery
- Store seeded digital keys for demo products.
- Assign an available key after a successful simulated purchase.
- Prevent the same key from being assigned more than once.
- Make purchased keys available in order history.

## 5. Initial Database Entities

- Users
- Products
- Categories
- Platforms
- Regions
- Sellers
- Offers
- DigitalKeys
- Orders
- OrderItems
- Banners

The detailed relationships and fields are documented in `database-schema.md`.

## 6. API Design

The backend exposes REST API endpoints grouped by responsibility:

- `/api/home`
- `/api/products`
- `/api/search`
- `/api/offers`
- `/api/auth`
- `/api/cart`
- `/api/checkout`
- `/api/orders`

The exact endpoints and request/response structures will be documented during implementation.

## 7. Development Principles

- Keep frontend and backend responsibilities separate.
- Use reusable React components.
- Keep business logic in Laravel services rather than controllers.
- Validate incoming API requests.
- Use database transactions for checkout and digital key assignment.
- Never expose passwords or other sensitive information.
- Use environment variables for secrets and configuration.
- Use seeders to provide realistic demo data.
- Keep the implementation understandable and explainable.
- Prefer simple solutions over unnecessary abstractions.

## 8. Project Scope

The MVP focuses on the complete digital product purchasing journey.

Payment processing is simulated. Product data, seller offers and digital keys are seeded for demonstration purposes.

Advanced marketplace features such as seller dashboards, real payment processing, refunds and production-level inventory management are outside the initial scope.
