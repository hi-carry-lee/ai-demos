import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { JobInfoTable } from "./jobInfo";
import { relations } from "drizzle-orm/relations";

export const InterviewTable = pgTable("interviews", {
  id,
  jobInfoId: uuid()
    .references(() => JobInfoTable.id, { onDelete: "cascade" })
    .notNull(),
  duration: varchar().notNull(),
  humeChatId: varchar(), // 只存储humeChatId，不存储对话数据，将来从Hume获取对话数据
  feedback: varchar(), // 将AI生成的反馈存储在数据库中
  createdAt,
  updatedAt,
});

export const interviewRelations = relations(InterviewTable, ({ one }) => ({
  jobInfo: one(JobInfoTable, {
    fields: [InterviewTable.jobInfoId],
    references: [JobInfoTable.id],
  }),
}));
