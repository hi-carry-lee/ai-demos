import { Router } from "express";
import { MessageController } from "../controllers/message.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router: Router = Router();

// 消息相关路由 - 所有路由都需要认证
router.post("/", authenticateToken, MessageController.createMessage);
router.get(
  "/conversation/:conversationId",
  authenticateToken,
  MessageController.getMessagesByConversation
);
router.get(
  "/conversation/:conversationId/latest",
  authenticateToken,
  MessageController.getLatestMessages
);
router.get("/:id", authenticateToken, MessageController.getMessageById);
router.delete("/:id", authenticateToken, MessageController.deleteMessage);

export default router;
