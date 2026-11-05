const ApiError = require("../utils/ApiError");

// Friendly messages for the unique constraints created in 01_create_tables.sql
const UNIQUE_MESSAGES = {
  uq_users_email: "Email already exists",
  uq_products_sku: "SKU already exists",
  uq_categories_name: "Category name already exists"
};

function mapError(error) {
  if (error instanceof ApiError) {
    return { status: error.status, message: error.message };
  }

  // Malformed JSON body (thrown by express.json())
  if (error.type === "entity.parse.failed") {
    return { status: 400, message: "Invalid JSON in request body" };
  }
  if (error.type === "entity.too.large") {
    return { status: 413, message: "Request body is too large" };
  }

  // PostgreSQL error codes
  switch (error.code) {
    case "23505": // unique_violation
      return {
        status: 409,
        message:
          UNIQUE_MESSAGES[error.constraint] ||
          "A record with the same unique value already exists"
      };
    case "23503": // foreign_key_violation
      if (error.detail && error.detail.includes("is still referenced")) {
        return {
          status: 409,
          message:
            "This record is still used by other records and cannot be deleted"
        };
      }
      return { status: 400, message: "A referenced record does not exist" };
    case "23502": // not_null_violation
    case "23514": // check_violation
    case "22P02": // invalid_text_representation
    case "22003": // numeric_value_out_of_range
    case "22001": // string_data_right_truncation
      return { status: 400, message: "Invalid data was sent" };
    default:
      return null;
  }
}

// Express recognises this as an error handler because it has 4 arguments
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const mapped = mapError(error);

  if (mapped) {
    if (error.code) {
      console.error(`DB error ${error.code} (${error.constraint || "no constraint"})`);
    }
    return res.status(mapped.status).json({ success: false, message: mapped.message });
  }

  // Unexpected failure: log the details internally, return a safe message
  console.error(error);
  res.status(500).json({ success: false, message: "Internal server error" });
}

module.exports = errorHandler;
