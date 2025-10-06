import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router: Router = Router();

// 非公开路由（需要认证）
router.get("/", authenticateToken, UserController.getAllUsers);

export default router;
