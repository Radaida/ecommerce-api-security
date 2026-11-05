# API Endpoints and Expected Status Codes

All bodies are JSON (`Content-Type: application/json`). Base URL: `http://localhost:3000`.

## Products
Fields: `category_id` (required, existing category), `name` (required, ≤200), `description` (optional),
`price` (required, > 0, max 2 decimals), `stock_quantity` (optional, whole number ≥ 0, default 0),
`sku` (required, ≤50, unique), `is_active` (optional boolean, default true).

| Method and path | Body | Expected status codes |
|---|---|---|
| GET /api/products | – (optional `?active=true\|false`) | 200; 400 invalid `active` |
| GET /api/products/:id | – | 200; 400 invalid ID; 404 not found |
| POST /api/products | all fields above | 201; 400 missing/invalid field, unknown `category_id`; 409 duplicate SKU |
| PUT /api/products/:id | all fields above (full update) | 200; 400 invalid ID/field; 404 not found; 409 duplicate SKU |
| PATCH /api/products/:id/deactivate | – | 200; 400 invalid ID; 404 not found |
| DELETE /api/products/:id | – | 200; 400 invalid ID; 404 not found; 409 product is used in orders (deactivate it instead) |

Example POST body:
```json
{ "category_id": 1, "name": "Wireless Mouse", "description": "Rechargeable wireless mouse",
  "price": 18.5, "stock_quantity": 20, "sku": "MOUSE-001" }
```

## Categories
Fields: `name` (required, ≤100, unique), `description` (optional), `is_active` (optional boolean, default true).

| Method and path | Body | Expected status codes |
|---|---|---|
| GET /api/categories | – | 200 |
| GET /api/categories/:id | – | 200; 400 invalid ID; 404 not found |
| POST /api/categories | name, description, is_active | 201; 400 missing name; 409 duplicate name |
| PUT /api/categories/:id | name, description, is_active | 200; 400 invalid ID/field; 404 not found; 409 duplicate name |
| DELETE /api/categories/:id | – | 200; 400 invalid ID; 404 not found; 409 category still has products |

## Users
Fields: `full_name` (required, ≤150), `email` (required, valid format, unique, stored lowercase),
`password` (required, 8–128 chars, stored only as a scrypt hash), `phone` (optional, ≤20),
`role` (optional: `customer` or `admin`, default `customer`).

| Method and path | Body | Expected status codes |
|---|---|---|
| GET /api/users | – | 200 |
| GET /api/users/:id | – | 200; 400 invalid ID; 404 not found |
| POST /api/users | fields above | 201; 400 missing/invalid field; 409 duplicate email |
| PATCH /api/users/:id/status | `{ "is_active": true\|false }` | 200; 400 invalid ID or non-boolean value; 404 not found |

## General
| Situation | Status |
|---|---|
| Unknown route (e.g. GET /api/unknown) | 404 |
| Malformed JSON body | 400 |
| Unexpected server/database failure | 500 (safe message only) |
