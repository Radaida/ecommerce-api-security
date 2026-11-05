# Security Review: E-commerce REST API

Scope: Node.js / Express API with Neon PostgreSQL, tested locally only.
Tools: Postman (collection `ecommerce-api-security.postman_collection.json`, 16 tests).

> Before filling in the "Before" column, make sure it matches what you actually observed in your earlier tests.

## Summary

| # | Issue | Severity |
|---|---|---|
| 1 | Secrets (DB URL, JWT secret) hardcoded or exposed | High |
| 2 | SQL Injection via string-built queries | Critical |
| 3 | Plain-text or exposed password data (`password_hash` returned) | High |
| 4 | Missing authentication on sensitive routes | Critical |
| 5 | Missing authorization (any user can use admin routes) | High |
| 6 | Broken object-level access (user reads another user's data) | High |
| 7 | No input validation (invalid IDs and values accepted) | Medium |
| 8 | Information leakage in errors (stack trace, DB details) | Medium |
| 9 | Missing security headers (`X-Powered-By` exposed) | Low |
| 10 | Open CORS policy | Medium |
| 11 | No rate limiting (brute force on login) | Medium |
| 12 | Unsanitized text input (stored XSS risk) | Medium |

## Detailed findings

### 1. Exposed secrets
- **Test:** Review code and repo for credentials.
- **Before:** Connection string / secret in source.
- **Fix:** Moved to `.env`, added `.env` to `.gitignore`, created `.env.example`.
- **After:** No secrets in the repository.

### 2. SQL Injection
- **Test:** Send `' OR '1'='1` in ID/search inputs.
- **Before:** Query built by string concatenation, injectable.
- **Fix:** Parameterized queries (`$1, $2`) everywhere.
- **After:** Payload treated as plain data; no injection.

### 3. Password handling
- **Test:** Register, then inspect responses and database.
- **Before:** Password stored unsafely and/or `password_hash` returned.
- **Fix:** bcrypt hashing; `password_hash` removed from all responses.
- **After:** Only hashes stored; never returned. (Tests 02 to 04)

### 4. Missing authentication
- **Test:** Postman tests 06 and 09 (no token).
- **Before:** Request succeeded with 200/201.
- **Fix:** JWT authentication middleware on protected routes.
- **After:** 401 Unauthorized.

### 5. Missing authorization
- **Test:** Postman tests 07 and 10 (customer token), 08 and 11 (admin token).
- **Before:** Customer could list users and create products.
- **Fix:** Role middleware (`admin` only).
- **After:** Customer gets 403; admin gets 200/201.

### 6. Access to another user's data
- **Test:** Postman tests 15 and 16.
- **Before:** Customer could read any user record by ID.
- **Fix:** Ownership check (token user ID must match, unless admin).
- **After:** Other user's record gives 403; own record gives 200.

### 7. Missing input validation
- **Test:** Postman test 13 (`/api/products/abc`).
- **Before:** Server error or database error message.
- **Fix:** Validate IDs and body fields before querying.
- **After:** 400 with a safe message.

### 8. Verbose errors
- **Test:** Trigger invalid requests and review responses.
- **Before:** Stack trace or SQL error details in the response.
- **Fix:** Central error handler returning generic messages; details logged server-side only.
- **After:** No internal details exposed.

### 9. Security headers
- **Test:** Postman test 01.
- **Before:** `X-Powered-By: Express` present, no hardening headers.
- **Fix:** Helmet added; `x-powered-by` disabled.
- **After:** Header absent; Helmet headers present.

### 10. CORS
- **Test:** Request with a disallowed `Origin` header.
- **Before:** Any origin allowed.
- **Fix:** CORS restricted to `CORS_ORIGIN` list.
- **After:** Unlisted origins not allowed.

### 11. Rate limiting
- **Test:** Repeated wrong-password logins (Postman test 05 and repeated runs).
- **Before:** Unlimited attempts.
- **Fix:** General limiter plus strict login limiter.
- **After:** 429 Too Many Requests after the limit.

### 12. XSS
- **Test:** Postman test 14 (`<script>alert(1)</script>` as product name).
- **Before:** Stored as-is.
- **Fix:** Validation/sanitization rejects script/HTML in text fields.
- **After:** 400 returned; nothing stored.

## Postman results

| Test | Description | Expected |
|---|---|---|
| 01 | No `X-Powered-By` header | 200 |
| 02 | Register customer | 201, role `customer` |
| 03 | Login admin | 200 |
| 04 | Login customer | 200 |
| 05 | Wrong password | 401 |
| 06 | Users, no token | 401 |
| 07 | Users, customer token | 403 |
| 08 | Users, admin token | 200 |
| 09 | Create product, no token | 401 |
| 10 | Create product, customer | 403 |
| 11 | Create product, admin | 201 |
| 12 | Delete product, admin | 200 |
| 13 | Invalid ID | 400 |
| 14 | XSS input | 400 |
| 15 | Customer reads another user | 403 |
| 16 | Customer reads own record | 200 |

**Run result:** 16 / 16 passed (see `screenshots/postman-run.png`).

## Conclusion
The API now requires authentication on sensitive routes, enforces roles and ownership, validates input, uses parameterized queries and bcrypt, and applies Helmet, CORS, rate limiting and safe error handling.
