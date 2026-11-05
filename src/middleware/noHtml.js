const ApiError = require("../utils/ApiError");

const HTML_TAG = /<[^>]*>/;

// Rejects any text field that contains an HTML tag like <script>
const rejectHtml = (req, res, next) => {
  const body = req.body;
  if (body && typeof body === "object") {
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string" && HTML_TAG.test(value)) {
        return next(new ApiError(400, `${key} must not contain HTML tags`));
      }
    }
  }
  next();
};

module.exports = rejectHtml;