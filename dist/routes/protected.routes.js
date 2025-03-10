import express from "express";
import { verifyJWT, requireAdmin, requireRole, restrictSelfModification, } from "../middleware/authMiddleware";
import { updateUserProfile } from "../controllers/user.controller";
const router = express.Router();
/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: Access a protected route
 *     tags: [Protected]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully accessed protected route
 */
router.get("/protected", verifyJWT, (req, res) => {
    res.json({ message: "You accessed a protected route!", user: req.user });
});
/**
 * @swagger
 * /api/protected/admin/dashboard:
 *   get:
 *     summary: Access admin dashboard
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully accessed admin dashboard
 */
router.get("/admin/dashboard", verifyJWT, requireAdmin, (req, res) => {
    res.json({ message: "Admin dashboard access granted!" });
});
/**
 * @swagger
 * /api/protected/role:
 *   get:
 *     summary: Access role-based protected route
 *     tags: [Protected]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully accessed role-protected route
 */
router.get("/role/protected", verifyJWT, requireRole(["instructor", "customer"]), (req, res) => {
    res.json({ message: "You accessed a role-protected route!" });
});
/**
 * @swagger
 * /api/protected/user/update/{userId}:
 *   put:
 *     summary: Update user profile (Self-modification only)
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Forbidden - Cannot modify other users
 */
router.put("/user/update/:userId", verifyJWT, restrictSelfModification, updateUserProfile);
export default router;
