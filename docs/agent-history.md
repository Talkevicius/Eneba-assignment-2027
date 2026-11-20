# AGENTS.md

## Project Overview

Build a small digital game marketplace inspired by Eneba as part of the Eneba Intern Assignment 2027.

The goal is to deliver a working, understandable MVP. Prioritize correctness, clean code, and a few complete features over implementing many incomplete features.

Before implementing anything, read:
- `docs/architecture.md`
- `docs/database-schema.md`

These documents define the agreed architecture and database design.

## Technology Stack

### Frontend
- React
- TypeScript
- Vite

### Backend
- PHP 8.2
- Laravel 12
- Laravel Sanctum for API token authentication
- REST API

### Database and Deployment
- PostgreSQL hosted on Supabase
- Frontend deployment: Vercel
- Backend deployment: Render
- GitHub repository: `Talkevicius/Eneba-assignment-2027`

Do not change these technologies without asking first.

## Architecture

Use a modular monolith:
- One Laravel backend.
- One PostgreSQL database.
- Separate controllers, services, models, requests, and other classes according to responsibility.
- Keep business logic out of controllers whenever practical.
- Do not introduce microservices.

The frontend must retrieve application content through the backend API. Do not hardcode homepage banners, products, offers, or other marketplace content in React components.

## Backend Guidelines

- Follow Laravel conventions and directory structure.
- Use Eloquent models and relationships.
- Use Form Requests or equivalent validation for incoming data.
- Keep controllers focused on HTTP requests and responses.
- Put business logic in appropriately named service classes.
- Use API Resources where they improve response consistency.
- Protect authenticated endpoints using Laravel Sanctum.
- Verify resource ownership on the backend.
- Never rely on frontend checks for authorization or payment validation.
- Store secrets and credentials in environment variables, never commit them.

### Checkout

Checkout must:
- Validate offers and their availability on the backend.
- Recalculate prices on the backend.
- Run database operations inside a transaction.
- Lock an available digital key before assigning it.
- Create order and order item records.
- Store product, seller, and price snapshots in order items.
- Prevent the same digital key from being assigned more than once.
- Use simulated payment only. Do not implement real payment processing.

## Frontend Guidelines

- Use TypeScript and avoid `any` unless genuinely necessary.
- Create reusable components rather than duplicating UI.
- Keep API communication in a centralized API layer.
- Handle loading, error, and empty states.
- Keep components focused and reasonably small.
- Make the interface responsive.
- Follow the visual direction of Eneba's marketplace.
- Do not put business logic or hardcoded marketplace data in presentation components.

## Project Scope

Focus on the following MVP features:
1. Homepage with database-driven banners, best sellers, and deals.
2. Product catalog with search, filters, and sorting.
3. Product detail pages with multiple seller offers.
4. Shopping cart.
5. User registration and login.
6. Protected checkout and order history.
7. Simulated payment and digital key delivery.

Avoid adding unrelated features such as seller dashboards, real payment integrations, refunds, or complex multi-currency support unless explicitly requested.

## Development Rules

- Work incrementally. Implement one clearly defined feature at a time.
- Before making significant changes, explain the intended approach.
- Do not rewrite unrelated files or introduce unnecessary abstractions.
- Do not add dependencies without explaining why they are needed.
- Follow the existing architecture and database schema.
- If a requirement is unclear, ask before making a major assumption.
- Explain important implementation decisions so the project owner can understand and maintain the code.
- After each task, list the files changed, explain what changed, and provide the commands needed to test it.
- Run relevant tests and builds when practical.
- Do not claim something works unless it has been tested or the limitation is clearly stated.

## Agent Conversation History

The assignment requires submission of the full AI agent conversation history, including prompts and responses.

For every coding task, provide:
- The complete prompt used.
- The complete response.
- A short note describing which changes were accepted, modified, or rejected.

Keep this history in `docs/agent-history.md`.

Do not replace full prompts and responses with summaries. Remind the project owner to save the complete interaction after each task.

## Strict Task Scope and Approval Gates

The project owner controls the development sequence.

- Never attempt to build the entire application in one task.
- Work on only the specific feature or task requested in the latest prompt.
- Do not start the next feature automatically, even if it is the obvious next step.
- Do not implement additional features, improvements, or refactoring that were not requested.
- Before editing files, explain:
  1. What you intend to implement.
  2. Which files you expect to create or modify.
  3. What is explicitly outside the scope of this task.
  4. How the result will be tested.
- Wait for the project owner's approval before making changes.
- If implementation reveals a need for work outside the approved scope, stop and explain why.
- After implementation, stop. Report changed files, test results, and any outstanding issues.
- Do not proceed until the project owner gives a new task.

**One task = one approved implementation scope.**