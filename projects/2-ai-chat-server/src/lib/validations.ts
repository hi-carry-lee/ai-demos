import z from "zod";

export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "message is required")
    .max(1000, "message is too long"),
  conversationId: z.string().uuid(),
});
