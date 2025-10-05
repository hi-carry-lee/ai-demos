import type { Request, Response } from "express";
import { chatOneTime } from "../ai/openaiChat.js";
import { chatWithHistory } from "../ai/openaiChat.js";

export const chatOnetime = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
    }

    const response = await chatOneTime(message);
    res.json({ response });
  } catch (error) {
    console.error("Chat controller error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const chatWithHistoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { message } = req.body;
    const response = await chatWithHistory(message);
    res.json({ response });
  } catch (error) {
    console.error("Chat controller error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
