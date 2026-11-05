# Postman Test Report

Environment: Ecommerce API - Local (`baseUrl = http://localhost:3000`) · Database: Neon PostgreSQL (`neondb`)

Fill the **Actual status** column from your Postman results and add one screenshot per test (or per Runner run) in `screenshots/`.

| # | Test name | Method and route | Body / params | Expected | Actual status | Matches expected? | Screenshot |
|---|---|---|---|---|---|---|---|
| 01 | Get all products | GET `/api/products` | – | 200 |  |  | screenshots/01_get_all_products.png |
| 02 | Get an existing product | GET `/api/products/1` | – | 200 |  |  | screenshots/02_get_an_existing_product.png |
| 03 | Get a non-existing product | GET `/api/products/999999` | – | 404 |  |  | screenshots/03_get_a_non-existing_product.png |
| 04 | Create a valid product | POST `/api/products` | valid product JSON (unique SKU) | 201 |  |  | screenshots/04_create_a_valid_product.png |
| 05 | Create a product without a name | POST `/api/products` | JSON without `name` | 400 |  |  | screenshots/05_create_a_product_without_a_name.png |
| 06 | Create a product with a negative price | POST `/api/products` | `price: -5` | 400 |  |  | screenshots/06_create_a_product_with_a_negative_price.png |
| 07 | Create a product with negative stock | POST `/api/products` | `stock_quantity: -1` | 400 |  |  | screenshots/07_create_a_product_with_negative_stock.png |
| 08 | Create a product with a duplicate SKU | POST `/api/products` | `sku: CMP-LEN-IP3` (already exists) | 409 |  |  | screenshots/08_create_a_product_with_a_duplicate_sku.png |
| 09 | Update an existing product | PUT `/api/products/{{productId}}` | full product JSON | 200 |  |  | screenshots/09_update_an_existing_product.png |
| 10 | Update a non-existing product | PUT `/api/products/999999` | full product JSON | 404 |  |  | screenshots/10_update_a_non-existing_product.png |
| 11 | Deactivate a product | PATCH `/api/products/{{productId}}/deactivate` | – | 200 |  |  | screenshots/11_deactivate_a_product.png |
| 12 | Create a valid category | POST `/api/categories` | `name`, `description` | 201 |  |  | screenshots/12_create_a_valid_category.png |
| 13 | Create a valid user | POST `/api/users` | valid user JSON (unique email) | 201 |  |  | screenshots/13_create_a_valid_user.png |
| 14 | Create a user with a duplicate email | POST `/api/users` | `email: lina.haddad@gmail.com` | 409 |  |  | screenshots/14_create_a_user_with_a_duplicate_email.png |
| 15 | Send incomplete JSON | POST `/api/products` | `{"name": "Only a name"}` | 400 |  |  | screenshots/15_send_incomplete_json.png |
| 16 | Request an unknown API route | GET `/api/unknown-route` | – | 404 |  |  | screenshots/16_request_an_unknown_api_route.png |

## Summary
Total mandatory tests: 16 · Passed: __ · Failed: __

The collection also contains 18 extra tests (categories, users, validation and delete rules).
