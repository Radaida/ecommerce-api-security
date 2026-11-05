const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deactivateProduct,
  deleteProduct
} = require("../controllers/productsController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Anyone can browse
router.get("/", getProducts);
router.get("/:id", getProductById);

// Only admins can change products
router.post("/", authenticate, authorize("admin"), createProduct);
router.put("/:id", authenticate, authorize("admin"), updateProduct);
router.patch("/:id/deactivate", authenticate, authorize("admin"), deactivateProduct);
router.delete("/:id", authenticate, authorize("admin"), deleteProduct);

module.exports = router;