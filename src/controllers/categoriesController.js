const pool = require("../config/database");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const v = require("../utils/validators");

const COLUMNS = "id, name, description, is_active, created_at";

function readCategoryBody(body) {
  return {
    name: v.requireString(body.name, "name", 100),
    description: v.optionalString(body.description, "description", 5000),
    is_active: v.optionalBoolean(body.is_active, "is_active", true)
  };
}

const getCategories = asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT ${COLUMNS} FROM categories ORDER BY id ASC`);
  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const id = v.parseId(req.params.id, "category ID");
  const result = await pool.query(
    `SELECT ${COLUMNS} FROM categories WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) throw new ApiError(404, "Category not found");
  res.status(200).json({ success: true, data: result.rows[0] });
});

const createCategory = asyncHandler(async (req, res) => {
  const c = readCategoryBody(v.getBody(req));
  const result = await pool.query(
    `INSERT INTO categories (name, description, is_active)
     VALUES ($1, $2, $3)
     RETURNING ${COLUMNS}`,
    [c.name, c.description, c.is_active]
  );

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: result.rows[0]
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const id = v.parseId(req.params.id, "category ID");
  const c = readCategoryBody(v.getBody(req));

  const result = await pool.query(
    `UPDATE categories SET name = $1, description = $2, is_active = $3
      WHERE id = $4
      RETURNING ${COLUMNS}`,
    [c.name, c.description, c.is_active, id]
  );

  if (result.rows.length === 0) throw new ApiError(404, "Category not found");
  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: result.rows[0]
  });
});

// A category that still has products is protected by the foreign key -> 409
const deleteCategory = asyncHandler(async (req, res) => {
  const id = v.parseId(req.params.id, "category ID");
  const result = await pool.query(
    "DELETE FROM categories WHERE id = $1 RETURNING id, name",
    [id]
  );

  if (result.rows.length === 0) throw new ApiError(404, "Category not found");
  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: result.rows[0]
  });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
