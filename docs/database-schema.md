
# Database Schema

## 1. Overview

The application uses PostgreSQL as its relational database.

The schema is designed around a digital marketplace where multiple sellers can offer the same product at different prices, platforms and regions.

## 2. Tables

### users
Managed through Laravel's authentication system.

- id (PK)
- name
- email (unique)
- password
- created_at
- updated_at

Laravel Sanctum will additionally use its personal_access_tokens table.

### categories
- id (PK)
- name
- slug (unique)

### platforms
- id (PK)
- name
- slug (unique)

Examples: Steam, PlayStation, Xbox, Nintendo.

### regions
- id (PK)
- name
- code (unique)

Examples: Global, Europe, North America.

### products
- id (PK)
- category_id (FK)
- title
- slug (unique)
- description
- image_url
- developer (nullable)
- publisher (nullable)
- release_date (nullable)
- created_at
- updated_at

### sellers
- id (PK)
- name
- description (nullable)
- rating (nullable)
- created_at
- updated_at

### offers
Represents an individual seller's listing for a product.

- id (PK)
- product_id (FK)
- seller_id (FK)
- platform_id (FK)
- region_id (FK)
- price (decimal)
- original_price (decimal, nullable)
- currency
- is_active (boolean)
- created_at
- updated_at

A product can have multiple offers from different sellers.

### orders
- id (PK)
- user_id (FK)
- total (decimal)
- currency
- payment_status
- created_at
- updated_at

Payment is simulated. No real payment information is stored.

### order_items
Represents an offer purchased as part of an order.

- id (PK)
- order_id (FK)
- offer_id (FK)
- product_title (snapshot)
- seller_name (snapshot)
- unit_price (decimal snapshot)
- currency
- created_at
- updated_at

Each order item represents one digital product unit.

### digital_keys
Stores digital keys available for delivery.

- id (PK)
- offer_id (FK)
- order_item_id (FK, nullable, unique)
- key_code
- created_at
- updated_at

A key is available when order_item_id is null. Once purchased, it is assigned to exactly one order item.

For the MVP, key codes are seeded demo data and should not be real commercial keys.

### banners
- id (PK)
- title
- subtitle (nullable)
- image_url
- target_url (nullable)
- is_active (boolean)
- display_order (integer)
- starts_at (nullable)
- ends_at (nullable)
- created_at
- updated_at

## 3. Relationships

- A category has many products.
- A product belongs to one category.
- A product has many offers.
- A seller has many offers.
- An offer belongs to one product, seller, platform and region.
- A user has many orders.
- An order belongs to one user.
- An order has many order items.
- An order item references one purchased offer.
- An offer can have many digital keys.
- An order item can receive at most one digital key.

## 4. Homepage Data

Homepage content is retrieved through independent backend services and API endpoints.

- BannerService retrieves active banners from the banners table.
- BestSellerService calculates best sellers using completed sales.
- DealService retrieves active offers with valid discounts.

All services use the same PostgreSQL database.

## 5. Cart

The shopping cart is managed on the frontend for the MVP.

The backend validates offer availability and recalculates prices during checkout. The frontend is never trusted for final payment totals.

## 6. Checkout and Key Assignment

Checkout uses a database transaction.

1. Validate the selected offer.
2. Retrieve an available digital key using a row lock.
3. Create the order.
4. Create the order item with price and seller snapshots.
5. Assign the digital key to the order item.
6. Mark the simulated payment as successful.
7. Commit the transaction.

If any operation fails, the transaction is rolled back.

A unique constraint on digital_keys.order_item_id prevents assigning the same key to multiple order items.
