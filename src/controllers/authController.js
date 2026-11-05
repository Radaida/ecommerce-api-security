const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const v = require("../utils/validators");
const { hashPassword, comparePassword } = require("../utils/password");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COLUMNS = "id, full_name, email, phone, role, is_active, created_at";

const register = asyncHandler(async (req, res) => {
  const body = v.getBody(req);

  const full_name = v.requireString(body.full_name, "full_name", 150);
  const email = v.requireString(body.email, "email", 255).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new ApiError(400, "email is not valid");
  const phone = v.optionalString(body.phone, "phone", 20);

  const password = body.password;
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    throw new ApiError(400, "password must be 8 to 128 characters");
  }

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) throw new ApiError(409, "email is already registered");

  const passwordHash = await hashPassword(password);

  // The role is always "customer" here. Nobody can register as admin.
  const result = await pool.query(
    `INSERT INTO users (full_name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, 'customer')
     RETURNING ${COLUMNS}`,
    [full_name, email, phone, passwordHash]
  );

  res.status(201).json({
    success: true,
    message: "Registered successfully",
    data: result.rows[0]
  });
});

const login = asyncHandler(async (req, res) => {
  const body = v.getBody(req);
  const email = v.requireString(body.email, "email", 255).toLowerCase();
  const password = body.password;
  if (typeof password !== "string" || password === "") {
    throw new ApiError(400, "password is required");
  }

  const result = await pool.query(
    `SELECT ${COLUMNS}, password_hash FROM users WHERE email = $1`,
    [email]
  );
  const user = result.rows[0];

  // Same message for "no such email" and "wrong password", so attackers learn nothing
  const matches = user ? await comparePassword(password, user.password_hash) : false;
  if (!matches) throw new ApiError(401, "Invalid email or password");
  if (!user.is_active) throw new ApiError(403, "Account is deactivated");

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h"
  });

  delete user.password_hash;
  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    data: user
  });
});

module.exports = { register, login };