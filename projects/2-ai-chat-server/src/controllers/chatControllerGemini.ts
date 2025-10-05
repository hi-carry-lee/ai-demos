import type { Request, Response } from "express";
import { singleTurnChat, multiTurnChat } from "../ai/geminiChat.js";
import { chatRequestSchema } from "../lib/validations.js";

export const chatOnetimeGemini = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parseResult = chatRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.format() });
      // if not return, then the code will continue to execute
      // "parseResult.data.message" probably will be undefined
      return;
    }

    const response = await singleTurnChat(parseResult.data.message);
    res.json({ response });
  } catch (error) {
    console.error("Chat controller error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const chatWithHistoryGemini = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { message } = req.body;
    const response = await multiTurnChat(message);
    res.json({ response });
  } catch (error) {
    console.error("Chat controller error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
