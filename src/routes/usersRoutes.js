const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  updateUserStatus
} = require("../controllers/usersController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Everything here needs login. Only admins can list, create or change users.
router.get("/", authenticate, authorize("admin"), getUsers);
router.post("/", authenticate, authorize("admin"), createUser);
router.patch("/:id/status", authenticate, authorize("admin"), updateUserStatus);

// A user can read their own record. Admins can read anyone's.
router.get(
  "/:id",
  authenticate,
  (req, res, next) => {
    if (req.user.role !== "admin" && String(req.user.id) !== String(req.params.id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to do this"
      });
    }
    next();
  },
  getUserById
);

module.exports = router;