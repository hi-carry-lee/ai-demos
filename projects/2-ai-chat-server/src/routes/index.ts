import { Router, type Request, type Response } from "express";
import {
  chatOnetime,
  chatWithHistoryController,
} from "../controllers/chatControllerOpenAI.js";
import {
  chatOnetimeGemini,
  chatWithHistoryGemini,
} from "../controllers/chatControllerGemini.js";

const router: Router = Router();

// 定义路由
router.post("/chat-one-time", chatOnetime);
router.post("/chat-with-history", chatWithHistoryController);

router.post("/chat-one-time-gemini", chatOnetimeGemini);
router.post("/chat-with-history-gemini", chatWithHistoryGemini);

router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

export default router;
