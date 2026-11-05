# E-commerce REST API (Secured)

Node.js + Express REST API for an online store, backed by Neon PostgreSQL. This version applies basic web application security controls and includes a Postman collection that tests the success and failure cases.

## Requirements
- Node.js 18+
- A Neon PostgreSQL database

## Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in real values (database URL, JWT secret, allowed origins).
3. Start the server: `npm start`
4. The API runs on `http://localhost:3000`.

`.env` is listed in `.gitignore` and must never be committed.

## Security features
| Area | Implementation |
|---|---|
| Secrets | Stored in `.env`; `.env.example` has placeholders only |
| Input validation | All body, params and query values validated; invalid values return 400 |
| SQL Injection | Parameterized queries only |
| Passwords | Hashed with bcrypt; `password_hash` is never returned |
| Authentication | JWT issued at login, checked on protected routes |
| Authorization | `customer` and `admin` roles; admin-only routes return 403 for customers |
| Data isolation | A customer can read only their own user record and orders |
| Security headers | Helmet; `X-Powered-By` removed |
| CORS | Only origins listed in `CORS_ORIGIN` are allowed |
| Rate limiting | General limiter plus a stricter limiter on login (429 when exceeded) |
| Error handling | Generic messages; no stack traces or database details |
| XSS | Text inputs containing script/HTML are rejected or sanitized |

## Main endpoints
| Method | Path | Access |
|---|---|---|
| POST | `/api/auth/register` | Public (always creates role `customer`) |
| POST | `/api/auth/login` | Public, rate limited |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Admin |
| DELETE | `/api/products/:id` | Admin |
| GET | `/api/users` | Admin |
| GET | `/api/users/:id` | Admin, or the user themselves |

## Testing with Postman
1. Start the server.
2. Import `postman/ecommerce-api-security.postman_collection.json`.
3. Set the environment to **No Environment** (the collection has its own `baseUrl`).
4. Make sure the test accounts exist: `sec.test@example.com` (admin) and `cust.test@example.com` (customer), both with password `test12345`.
5. Run the collection. It contains 16 tests.
6. If login returns 429, wait for the rate limit window to pass and run again.

Screenshot of the run: `screenshots/postman-run.png`

## Documentation
- `SECURITY_REVIEW.md`: findings, severity, tests, and before/after results.

## Security note
Run all tests only against your local project or an authorized training environment.
