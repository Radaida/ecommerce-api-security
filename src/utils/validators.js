const ApiError = require("./ApiError");

const bad = (message) => new ApiError(400, message);

function getBody(req) {
  const body = req.body;
  return body && typeof body === "object" && !Array.isArray(body) ? body : {};
}

function isMissing(value) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  );
}

// Route/body identifiers: positive whole numbers only ("abc", "-1", "1.5", "0" are rejected)
function parseId(value, label = "ID") {
  const text = String(value);
  if (!/^[1-9]\d*$/.test(text) || !Number.isSafeInteger(Number(text))) {
    throw bad(`Invalid ${label}`);
  }
  return Number(text);
}

function requirePositiveInt(value, field) {
  if (isMissing(value)) throw bad(`${field} is required`);
  if (typeof value !== "number" && typeof value !== "string") {
    throw bad(`Invalid ${field}`);
  }
  return parseId(value, field);
}

function requireString(value, field, max) {
  if (isMissing(value)) throw bad(`${field} is required`);
  if (typeof value !== "string") throw bad(`${field} must be a string`);
  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw bad(`${field} must be at most ${max} characters`);
  }
  return trimmed;
}

function optionalString(value, field, max) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") throw bad(`${field} must be a string`);
  const trimmed = value.trim();
  if (trimmed === "") return null;
  if (trimmed.length > max) {
    throw bad(`${field} must be at most ${max} characters`);
  }
  return trimmed;
}

// products.price is NUMERIC(10,2): greater than 0, at most 2 decimals
function requirePrice(value, field = "price") {
  if (isMissing(value)) throw bad(`${field} is required`);
  if (typeof value !== "number" && typeof value !== "string") {
    throw bad(`${field} must be a number`);
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw bad(`${field} must be a number greater than zero`);
  }
  if (number > 99999999.99) throw bad(`${field} is too large`);
  if (Math.round(number * 100) / 100 !== number) {
    throw bad(`${field} must have at most 2 decimal places`);
  }
  return number;
}

// stock_quantity: whole number, 0 or more
function optionalNonNegativeInt(value, field, defaultValue) {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value !== "number" && typeof value !== "string") {
    throw bad(`${field} must be a whole number`);
  }
  if (typeof value === "string" && value.trim() === "") {
    throw bad(`${field} must be a whole number`);
  }
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 2147483647) {
    throw bad(`${field} must be a whole number of 0 or more`);
  }
  return number;
}

function optionalBoolean(value, field, defaultValue) {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value !== "boolean") throw bad(`${field} must be true or false`);
  return value;
}

function requireBoolean(value, field) {
  if (value === undefined || value === null) throw bad(`${field} is required`);
  if (typeof value !== "boolean") throw bad(`${field} must be true or false`);
  return value;
}

module.exports = {
  getBody,
  parseId,
  requirePositiveInt,
  requireString,
  optionalString,
  requirePrice,
  optionalNonNegativeInt,
  optionalBoolean,
  requireBoolean
};
