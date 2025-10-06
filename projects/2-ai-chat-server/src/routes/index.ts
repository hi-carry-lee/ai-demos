import { Router, type Request, type Response } from "express";
import {
  chatOnetime,
  chatWithHistoryController,
} from "../controllers/chatControllerOpenAI.js";
import {
  chatOnetimeGemini,
  chatWithHistoryGemini,
} from "../controllers/chat.controller.gemini.js";
import { authenticateToken } from "../middleware/auth.js";

// 导入新的路由
import authRoutes from "./auth.js";
import conversationRoutes from "./conversations.js";
import messageRoutes from "./messages.js";
import userRoutes from "./users.js";

const router: Router = Router();

// 注册新的路由
router.use("/auth", authRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);
router.use("/users", userRoutes);

// 原有的聊天路由 - 需要认证
router.post("/chat-one-time", authenticateToken, chatOnetime);
router.post("/chat-with-history", authenticateToken, chatWithHistoryController);

router.post("/chat-one-time-gemini", authenticateToken, chatOnetimeGemini);
router.post(
  "/chat-with-history-gemini",
  authenticateToken,
  chatWithHistoryGemini
);

// 健康检查路由
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

export default router;
