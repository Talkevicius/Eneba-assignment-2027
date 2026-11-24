# Eneba Marketplace API

This document describes the API implemented in `backend/routes/api.php` and its controllers, requests, services, and JSON resources. All paths below include Laravel's `/api` prefix. Examples use illustrative IDs and data; IDs depend on the current database contents.

Send `Accept: application/json` with API requests so validation and error responses use JSON.

## Authentication

Registration and login return a Laravel Sanctum personal access token as plain text. Send it on protected requests using:

```http
Authorization: Bearer <token>
```

The token is returned only by registration and login. Do not include it in URLs or logs. Protected endpoints require a valid bearer token and return `401 Unauthorized` if authentication is missing or invalid.

## Common validation errors

Form Request validation failures use Laravel's standard `422 Unprocessable Content` JSON format:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field": ["A validation message."]
  }
}
```

The exact validation message depends on the failing rule. Routes shown as public do not require a token. Registration and login are limited to five requests per minute per IP; throttled requests receive `429 Too Many Requests`.

## Authentication endpoints

### Register

`POST /api/register` — public; maximum five requests per minute per IP.

Request body:

```json
{
  "name": "Alex Buyer",
  "email": "alex@example.test",
  "password": "example-password"
}
```

Validation: name is required, a string, and at most 255 characters; email is required, valid, at most 255 characters, and unique; password is required and at least eight characters. There is no password-confirmation field.

Success: `201 Created`.

```json
{
  "data": {
    "user": { "id": 42, "name": "Alex Buyer", "email": "alex@example.test" },
    "token": "42|<plain-text-token>",
    "token_type": "Bearer"
  }
}
```

Other statuses: `422` for validation errors; `429` when rate limited.

### Login

`POST /api/login` — public; maximum five requests per minute per IP.

Request body:

```json
{
  "email": "alex@example.test",
  "password": "example-password"
}
```

Email and password are required; email must be valid and at most 255 characters.

Success: `200 OK`, with the same `data.user`, `data.token`, and `data.token_type` structure as registration.

Other statuses: `401 Unauthorized` with `{"message":"Invalid credentials."}` for a wrong email/password combination; `422` for invalid request fields; `429` when rate limited.

### Logout

`POST /api/logout` — requires a bearer token. Revokes only the current access token.

Success: `200 OK`.

```json
{ "data": { "message": "Logged out successfully." } }
```

Other status: `401` if unauthenticated.

### Authenticated user

`GET /api/user` — requires a bearer token.

Success: `200 OK`.

```json
{
  "data": {
    "user": { "id": 42, "name": "Alex Buyer", "email": "alex@example.test" }
  }
}
```

The response does not include password hashes or token data. Other status: `401` if unauthenticated.

## Product catalog

### List products

`GET /api/products` — public.

Supported query parameters:

| Parameter | Behavior |
| --- | --- |
| `search` | Optional case-insensitive partial product-title match; string, at most 100 characters. |
| `category` | Optional category slug, such as `rpg`. |
| `platform` | Optional platform slug, such as `steam`. |
| `region` | Optional region code, such as `EU` or `GLOBAL`. |
| `min_price` | Optional minimum offer price; numeric and at least zero. |
| `max_price` | Optional maximum offer price; numeric and at least zero. Must be greater than or equal to `min_price` when both are supplied. |
| `sort` | `title` (default), `price_asc`, or `price_desc`. |
| `page` | Optional page number, at least 1. |
| `per_page` | Optional page size from 1 to 50; default 12. |

Only products with active offers matching the offer filters are listed. Price filters apply to offer prices; the product's `starting_price` is the lowest matching active offer. Price sorting uses that value. Title and price sorting use product ID as a stable tie-breaker.

The catalog resource currently reports `starting_price` with `currency: "EUR"`; it does not derive a catalog currency from offer records.

Each catalog product also includes an `offers` array containing its active offers that match the supplied `platform`, `region`, `min_price`, and `max_price` filters. The offer filter is the same one used to determine whether a product is listed and to calculate `starting_price`. Offers are ordered by price ascending, then offer ID. Each offer includes its seller, platform, region, current price, optional original price, and currency.

Success: `200 OK`, with Laravel's paginated resource structure (`data`, `links`, and `meta`). Each product contains:

```json
{
  "id": 108,
  "title": "Hades",
  "slug": "hades",
  "description": "Demo catalog listing for Hades.",
  "image_url": "https://example.test/hades-cover.jpg",
  "developer": "Supergiant Games",
  "publisher": "Supergiant Games",
  "release_date": "2020-09-17",
  "category": { "id": 1, "name": "Action", "slug": "action" },
  "starting_price": "12.99",
  "currency": "EUR",
  "offers": [
    {
      "id": 501,
      "seller": { "id": 3, "name": "Pixel Harbor", "rating": "4.92" },
      "platform": { "id": 1, "name": "Steam", "slug": "steam" },
      "region": { "id": 1, "name": "Global", "code": "GLOBAL" },
      "price": "12.99",
      "original_price": "27.99",
      "currency": "EUR"
    }
  ]
}
```

Other status: `422` for invalid filters, unknown category/platform/region values, or an invalid price range. `search`, `category`, `platform`, `region`, `min_price`, `max_price`, and `sort` may be null when supplied; pagination values must meet their stated integer bounds.

### Product details

`GET /api/products/{slug}` — public. The `slug` is the product slug, for example `/api/products/hades`.

Success: `200 OK`. The response is a resource with a top-level `data` object containing product fields and category, plus active offers ordered by ascending price and then offer ID:

```json
{
  "data": {
    "id": 108,
    "title": "Hades",
    "slug": "hades",
    "description": "Demo catalog listing for Hades.",
    "image_url": "https://example.test/hades-cover.jpg",
    "developer": "Supergiant Games",
    "publisher": "Supergiant Games",
    "release_date": "2020-09-17",
    "category": { "id": 1, "name": "Action", "slug": "action" },
    "offers": [
      {
        "id": 501,
        "seller": { "id": 3, "name": "Pixel Harbor", "rating": "4.92" },
        "platform": { "id": 1, "name": "Steam", "slug": "steam" },
        "region": { "id": 1, "name": "Global", "code": "GLOBAL" },
        "price": "12.99",
        "original_price": "27.99",
        "currency": "EUR"
      }
    ]
  }
}
```

`developer`, `publisher`, and an offer's `original_price` may be null. Other status: `404 Not Found` if the slug does not exist.

## Homepage

Each homepage section is a public endpoint and returns a resource collection in a top-level `data` array. These collections are not paginated.

### Banners

`GET /api/home/banners` — public. Returns banners where `is_active` is true and the current time is within the optional `starts_at` and `ends_at` schedule. Results are ordered by `display_order`, then ID.

Success: `200 OK`.

```json
{
  "data": [
    {
      "id": 1,
      "title": "Find Your Next Adventure",
      "subtitle": "Explore demo offers across a wide range of games.",
      "image_url": "https://cdn.akamai.steamstatic.com/steam/apps/1332010/header.jpg",
      "target_url": "/store?category=adventure",
      "display_order": 1,
      "starts_at": null,
      "ends_at": null
    }
  ]
}
```

`subtitle`, `target_url`, `starts_at`, and `ends_at` may be null.

### Best sellers

`GET /api/home/best-sellers` — public. Returns up to eight products ranked by the count of their order items in orders whose `payment_status` is `successful`. Each order item counts as one unit sold. Products with no successful sales are omitted. Ties are ordered by title, then product ID. Each product includes all its active offers, ordered by price ascending and then offer ID, with seller, platform, region, current price, optional original price, and currency.

Success: `200 OK`. Items use the product resource with its category and a `sales_count` field:

```json
{
  "data": [
    {
      "id": 108,
      "title": "Hades",
      "slug": "hades",
      "description": "Demo catalog listing for Hades.",
      "image_url": "https://example.test/hades-cover.jpg",
      "developer": "Supergiant Games",
      "publisher": "Supergiant Games",
      "release_date": "2020-09-17",
      "category": { "id": 1, "name": "Action", "slug": "action" },
      "sales_count": 18,
      "offers": [
        {
          "id": 501,
          "seller": { "id": 3, "name": "Pixel Harbor", "rating": "4.92" },
          "platform": { "id": 1, "name": "Steam", "slug": "steam" },
          "region": { "id": 1, "name": "Global", "code": "GLOBAL" },
          "price": "12.99",
          "original_price": "27.99",
          "currency": "EUR"
        }
      ]
    }
  ]
}
```

### Deals

`GET /api/home/deals` — public. Returns up to eight products that have at least one active offer with `original_price` greater than `price`. Each qualifying product includes all of its active offers, ordered by price ascending and then offer ID; the included offers are not limited to discounted offers. Products are ordered by title, then product ID. No currency conversion is performed; current demo offers use EUR.

Success: `200 OK`. Each item uses the product resource and contains an `offers` array with seller, platform, region, price, original price, and currency in the same structure as product details.

## Checkout

### Create an order

`POST /api/checkout` — requires a bearer token.

Request body:

```json
{
  "items": [
    { "offer_id": 501, "quantity": 1 }
  ]
}
```

`items` is required and non-empty. Each `offer_id` must be an existing integer and distinct within the request. Each quantity must be an integer of at least 1. Client-submitted prices or totals are not used; prices are read from the database. All selected offers must have the same currency.

Checkout is simulated: no payment provider or real payment is involved. The backend checks that offers are active and sufficient unassigned digital keys exist, then creates the order and one order item per unit, snapshots product title, seller name, unit price, and currency, assigns one key per item, and records payment as `successful`. The work runs in one database transaction. Assigned key codes are returned to the authenticated buyer in the response.

Success: `201 Created`.

```json
{
  "data": {
    "id": 73,
    "total": "12.99",
    "currency": "EUR",
    "payment_status": "successful",
    "created_at": "2026-11-24T12:00:00.000000Z",
    "items": [
      {
        "id": 203,
        "product_title": "Hades",
        "seller_name": "Pixel Harbor",
        "unit_price": "12.99",
        "currency": "EUR",
        "digital_key": "DEMO-HADES-KEY-1-NOT-A-REAL-KEY"
      }
    ]
  }
}
```

Other statuses:

- `401` if unauthenticated.
- `409 Conflict` if an offer is inactive or does not have enough unassigned keys.
- `422` for invalid items, duplicate offer IDs, mixed currencies, or a total above the supported database amount.

Validation failures use Laravel's `message` and `errors` format. Inventory and inactive-offer conflicts return a `message` string.

## Order history

### List the authenticated user's orders

`GET /api/orders` — requires a bearer token. Returns only the authenticated user's orders, newest first (ID descending as a tie-breaker), 10 per page. Use the standard `page` query parameter to select a page. The response uses Laravel's paginated resource structure with `data`, `links`, and `meta`.

Success: `200 OK`. Each list entry includes only summary fields; it contains no items or digital keys:

```json
{
  "data": [
    {
      "id": 73,
      "total": "38.23",
      "currency": "EUR",
      "payment_status": "successful",
      "created_at": "2026-11-24T12:00:00.000000Z"
    }
  ],
  "links": { "first": "…?page=1", "last": "…?page=4", "prev": null, "next": "…?page=2" },
  "meta": { "current_page": 1, "per_page": 10, "total": 34 }
}
```

Other status: `401` if unauthenticated.

### Get order details

`GET /api/orders/{id}` — requires a bearer token. The order ID must belong to the authenticated user. Another user's order, or a nonexistent ID, returns `404 Not Found`.

Success: `200 OK` with a top-level `data` object containing the summary fields and `items`. Item fields are stored purchase snapshots. When `payment_status` is `successful`, each item includes its `digital_key` field, containing its assigned code (or `null` if no key is assigned); the field is omitted for other payment statuses.

```json
{
  "data": {
    "id": 73,
    "total": "12.34",
    "currency": "EUR",
    "payment_status": "successful",
    "created_at": "2026-11-24T12:00:00.000000Z",
    "items": [
      {
        "id": 203,
        "product_title": "Hades",
        "seller_name": "Pixel Harbor",
        "unit_price": "12.34",
        "currency": "EUR",
        "digital_key": "DEMO-HADES-KEY-1-NOT-A-REAL-KEY"
      }
    ]
  }
}
```

Other statuses: `401` if unauthenticated; `404` if the order is not owned by the authenticated user or does not exist.
