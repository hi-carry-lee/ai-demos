import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { UserTable } from "./user";
import { relations } from "drizzle-orm";
import { QuestionTable } from "./question";
import { InterviewTable } from "./interview";

// * 作用：
// *定义了两个表结构，
// *同时定义了枚举类型，这是一个很好的 类型驱动开发（Type-Driven Development） 的例子

export const experienceLevels = ["junior", "mid-level", "senior"] as const;
// 定义一个联合类型，它从数组中提取所有可能的值作为类型，typeof experienceLevels 获取数组的类型
// [number] 索引访问类型（Indexed Access Types）语法，表示访问数组的任意索引，从而获取数组元素的类型
// type定义类型，和interface定义类型类似；
export type ExperienceLevel = (typeof experienceLevels)[number];
export const experienceLevelEnum = pgEnum(
  "job_infos_experience_level",
  experienceLevels
);

// 这是物理层面的关联，用来告诉drizzle如何创建表；
export const JobInfoTable = pgTable("job_info", {
  id,
  title: varchar(),
  name: varchar().notNull(),
  experienceLevel: experienceLevelEnum().notNull(),
  description: varchar().notNull(),
  userId: varchar()
    // 建立外键，cascade表示删除用户，则删除关联的所有jobinfo
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt,
  updatedAt,
});

// 这是逻辑层面的关联，用来告诉drizzle如何关联表；
export const jobInfoRelations = relations(JobInfoTable, ({ one, many }) => ({
  user: one(UserTable, {
    fields: [JobInfoTable.userId],
    references: [UserTable.id],
  }),
  questions: many(QuestionTable),
  interviews: many(InterviewTable),
}));
