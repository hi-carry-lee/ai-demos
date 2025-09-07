import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm/relations";
import { JobInfoTable } from "./jobInfo";

export const UserTable = pgTable("users", {
  // 这里为什么不使用helper里面的id函数？因为使用clerk进行认证，而它不使用uuid ；
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  email: varchar().notNull().unique(),
  imageUrl: varchar().notNull(),
  createdAt,
  updatedAt,
});

export const userRelations = relations(UserTable, ({ many }) => ({
  jobInfos: many(JobInfoTable),
}));
