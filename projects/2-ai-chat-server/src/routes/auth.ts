import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const router: Router = Router();

// 公开路由（不需要认证）
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

export default router;
