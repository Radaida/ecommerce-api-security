const pool = require("../config/database");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const v = require("../utils/validators");
const { hashPassword } = require("../utils/password");

// password_hash is never selected, so it can never leak in a response
const COLUMNS = "id, full_name, email, phone, role, is_active, created_at";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ["customer", "admin"];

const getUsers = asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT ${COLUMNS} FROM users ORDER BY id ASC`);
  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const id = v.parseId(req.params.id, "user ID");
  const result = await pool.query(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);

  if (result.rows.length === 0) throw new ApiError(404, "User not found");
  res.status(200).json({ success: true, data: result.rows[0] });
});

const createUser = asyncHandler(async (req, res) => {
  const body = v.getBody(req);

  const full_name = v.requireString(body.full_name, "full_name", 150);
  const email = v.requireString(body.email, "email", 255).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new ApiError(400, "email is not valid");

  const phone = v.optionalString(body.phone, "phone", 20);

  const password = body.password;
  if (password === undefined || password === null || password === "") {
    throw new ApiError(400, "password is required");
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    throw new ApiError(400, "password must be 8 to 128 characters");
  }

  let role = "customer";
  if (body.role !== undefined && body.role !== null) {
    if (!ROLES.includes(body.role)) {
      throw new ApiError(400, "role must be customer or admin");
    }
    role = body.role;
  }

  const passwordHash = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (full_name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COLUMNS}`,
    [full_name, email, phone, passwordHash, role]
  );

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: result.rows[0]
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const id = v.parseId(req.params.id, "user ID");
  const isActive = v.requireBoolean(v.getBody(req).is_active, "is_active");

  const result = await pool.query(
    `UPDATE users SET is_active = $1 WHERE id = $2 RETURNING ${COLUMNS}`,
    [isActive, id]
  );

  if (result.rows.length === 0) throw new ApiError(404, "User not found");
  res.status(200).json({
    success: true,
    message: isActive ? "User activated successfully" : "User deactivated successfully",
    data: result.rows[0]
  });
});

module.exports = { getUsers, getUserById, createUser, updateUserStatus };
