# Discussion Questions – Short Answers

1. **Node.js vs Express.js:** Node.js is the runtime that runs JavaScript outside the browser; Express is a library built on top of it that makes routes, middleware and JSON APIs easy to write.
2. **GET, POST, PUT, PATCH:** GET reads data; POST creates a record; PUT replaces/fully updates a record; PATCH changes only part of a record.
3. **400 vs 404:** 400 when the request itself is wrong (missing field, negative price, invalid ID); 404 when the request is valid but the record or route does not exist.
4. **`express.json()`:** middleware that reads a JSON request body and puts the parsed object in `req.body`.
5. **`req.params` / `req.query` / `req.body`:** params are values inside the path (`/products/5`), query is the part after `?` (`?active=true`), body is the data sent with POST/PUT/PATCH.
6. **Why `.env`:** keeps secrets (database URL, passwords) out of the source code and out of GitHub, and lets each machine use its own settings.
7. **SQL injection:** an attack where user input is inserted into an SQL string and changes the meaning of the query (for example `' OR 1=1 --`).
8. **Parameterized queries:** the SQL text and the values are sent separately (`$1`, `$2`), so the database always treats values as data, never as SQL code.
9. **Status 201:** tells the client that a new record was created, not just that the request succeeded (200).
10. **Deactivate vs delete:** deleting a product used in old orders would break order history (and the foreign key blocks it); deactivating keeps the data but hides the product.
11. **Routes vs controllers:** routes only map URLs to functions; controllers hold the logic. This keeps code short, readable, testable and easy to change.
12. **Proving Neon is used:** create a record with POST, restart the server and GET it again (it persists), and see the same row in the Neon console Tables page; in-memory arrays would reset on restart.
