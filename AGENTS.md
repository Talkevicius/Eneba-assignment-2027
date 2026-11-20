# Eneba Marketplace MVP — Project Rules

This file defines the project constraints and workflow for contributors and coding agents. Follow it together with `docs/architecture.md` and `docs/database-schema.md`.

## Approval workflow

1. Inspect the relevant files and documentation before proposing implementation work.
2. Before editing, tell the user which files will change and summarize the intended changes.
3. Wait for the user's explicit approval before making any edits. Silence, elapsed time, or an ambiguous response is not approval.
4. After approval, make only the approved changes. If the scope needs to change, explain the new scope and get approval before proceeding with it.
5. Do not commit or push unless the user explicitly asks.
6. Report the files changed and the checks performed. Do not claim checks that were not run.

Read-only inspection and documentation review may be done without approval. Do not initialize or reconfigure frameworks, install dependencies, run migrations, or connect to the database unless the user explicitly authorizes that action.

## Product and MVP scope

Build a focused digital video game marketplace MVP for browsing products and seller offers, registering and signing in, selecting offers, checking out with simulated payment, and viewing delivered digital keys in order history.

Product, seller-offer, banner, and demo digital-key data is seeded for demonstration. Payment is simulated; the application does not process real payments or store real payment information. Seller dashboards, refunds, real payment processing, and production-level inventory management are outside the MVP scope.

Do not add features or expand scope beyond the agreed architecture and database schema without explicit user approval.

## Technology stack

- Frontend: React, TypeScript, Vite, React Router, and custom CSS.
- Backend: PHP 8.2, Laravel 12, REST API, and Laravel Sanctum authentication.
- Database: PostgreSQL, hosted on Supabase; schema changes are managed with Laravel migrations and seeders.
- Planned hosting: Vercel for the frontend, Render for the backend, and Supabase for PostgreSQL.
- Development tools: Git, GitHub, Visual Studio Code, and OpenAI Codex.

Do not introduce another framework, database, hosting provider, or architectural component without explicit approval.

## Architecture decisions

- Keep one React frontend, one Laravel backend, and one shared PostgreSQL database as a modular monolith.
- The frontend communicates with the backend through REST API endpoints only; it never accesses the database directly.
- Keep frontend and backend responsibilities separate.
- Organize backend responsibilities into controllers, services, models, and request validation classes. Controllers handle HTTP requests and responses; services hold business logic.
- Homepage sections (promotional banners, best sellers, and special deals) use independent API endpoints and backend services in the same Laravel application.
- `BannerService` retrieves active banner records from the `banners` table. Use `banners` consistently as the database table name.
- Use the documented entities and relationships in `docs/database-schema.md`, including `regions` and the `region_id` relationship from offers.
- The MVP cart is managed on the frontend. At checkout, the backend validates offer availability and recalculates prices; never trust client-submitted totals.
- Checkout and digital-key assignment occur in one database transaction. Lock an available key, create the order and order item with purchase snapshots, assign the key once, and mark simulated payment successful. Roll back on failure.
- A digital key may be assigned to at most one order item. Seed only demo key codes, never real commercial keys.
- Exact API request and response contracts are documented during implementation without changing the agreed endpoint responsibilities.

## Coding standards

- Prefer clear, small, reusable components and simple solutions over unnecessary abstractions.
- Keep business logic out of controllers and keep UI components focused on presentation and interaction.
- Validate incoming API requests and return only data needed by the client.
- Never expose passwords, tokens, or other secrets. Keep secrets and environment-specific configuration in environment variables.
- Use database transactions for checkout and key assignment, and preserve the documented relationships and constraints.
- Seed realistic but clearly fictional demo data.
- Keep changes understandable and explainable; follow the conventions already used in the relevant part of the project.
- Do not hardcode product or promotional content in frontend components when the architecture calls for API-provided content.

## Documentation authority

`docs/architecture.md` and `docs/database-schema.md` define the agreed architecture and data model. Keep table names, entities, relationships, responsibilities, and MVP scope consistent across those documents and this file. If a conflict or ambiguity is found, identify it and ask the user to resolve it before implementing a decision that would change scope or architecture.

## Task boundaries and testing

- Implement only the specific task approved by the user. Do not begin subsequent tasks automatically.
- Do not combine unrelated implementation steps into one task.
- Before implementation, identify the files expected to change and the verification steps.
- After implementation, run relevant tests or checks when authorized and report their actual results.
- If a test cannot be run, explain why instead of claiming it passed.

## Agent conversation history

- The user maintains the complete Codex conversation history in `docs/agent-history.md`.
- Do not replace complete conversation transcripts with summaries.
- Do not modify the agent-history file unless explicitly requested.