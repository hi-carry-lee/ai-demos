import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router: Router = Router();

// 会话相关路由 - 所有路由都需要认证
router.post('/', authenticateToken, ConversationController.createConversation);
router.get('/', authenticateToken, ConversationController.getUserConversations);
router.get(
  '/:id',
  authenticateToken,
  ConversationController.getConversationById
);
router.delete(
  '/:id',
  authenticateToken,
  ConversationController.deleteConversation
);
router.put(
  '/:id',
  authenticateToken,
  ConversationController.updateConversation
);

export default router;
