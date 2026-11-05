const pool = require("../config/database");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const v = require("../utils/validators");

const COLUMNS =
  "id, category_id, name, description, price, stock_quantity, sku, is_active, created_at, updated_at";

// Validates the body used by POST (create) and PUT (full update)
function readProductBody(body) {
  return {
    category_id: v.requirePositiveInt(body.category_id, "category_id"),
    name: v.requireString(body.name, "name", 200),
    description: v.optionalString(body.description, "description", 5000),
    price: v.requirePrice(body.price, "price"),
    stock_quantity: v.optionalNonNegativeInt(body.stock_quantity, "stock_quantity", 0),
    sku: v.requireString(body.sku, "sku", 50),
    is_active: v.optionalBoolean(body.is_active, "is_active", true)
  };
}

const getProducts = asyncHandler(async (req, res) => {
  const params = [];
  let sql = `SELECT ${COLUMNS} FROM products`;

  // Optional filter: /api/products?active=true
  if (req.query.active !== undefined) {
    if (!["true", "false"].includes(req.query.active)) {
      throw new ApiError(400, "active must be true or false");
    }
    params.push(req.query.active === "true");
    sql += " WHERE is_active = $1";
  }

  sql += " ORDER BY id DESC";
  const result = await pool.query(sql, params);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const id = v.parseId(req.params.id, "product ID");
  const result = await pool.query(
    `SELECT ${COLUMNS} FROM products WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) throw new ApiError(404, "Product not found");
  res.status(200).json({ success: true, data: result.rows[0] });
});

const createProduct = asyncHandler(async (req, res) => {
  const p = readProductBody(v.getBody(req));

  const result = await pool.query(
    `INSERT INTO products
       (category_id, name, description, price, stock_quantity, sku, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${COLUMNS}`,
    [p.category_id, p.name, p.description, p.price, p.stock_quantity, p.sku, p.is_active]
  );

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: result.rows[0]
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const id = v.parseId(req.params.id, "product ID");
  const p = readProductBody(v.getBody(req));

  const result = await pool.query(
    `UPDATE products
        SET category_id = $1, name = $2, description = $3, price = $4,
            stock_quantity = $5, sku = $6, is_active = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING ${COLUMNS}`,
    [p.category_id, p.name, p.description, p.price, p.stock_quantity, p.sku, p.is_active, id]
  );

  if (result.rows.length === 0) throw new ApiError(404, "Product not found");
  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: result.rows[0]
  });
});

const deactivateProduct = asyncHandler(async (req, res) => {
  const id = v.parseId(req.params.id, "product ID");
  const result = await pool.query(
    `UPDATE products SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING ${COLUMNS}`,
    [id]
  );

  if (result.rows.length === 0) throw new ApiError(404, "Product not found");
  res.status(200).json({
    success: true,
    message: "Product deactivated successfully",
    data: result.rows[0]
  });
});

// Hard delete. Products used in orders are protected by the foreign key
// (order_items.product_id) and the API answers 409 -> use deactivate instead.
const deleteProduct = asyncHandler(async (req, res) => {
  const id = v.parseId(req.params.id, "product ID");
  const result = await pool.query(
    "DELETE FROM products WHERE id = $1 RETURNING id, name",
    [id]
  );

  if (result.rows.length === 0) throw new ApiError(404, "Product not found");
  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
    data: result.rows[0]
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deactivateProduct,
  deleteProduct
};
