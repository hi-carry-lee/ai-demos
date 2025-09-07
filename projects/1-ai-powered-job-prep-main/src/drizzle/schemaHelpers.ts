import { timestamp, uuid } from "drizzle-orm/pg-core";

export const id = uuid().primaryKey().defaultRandom();

// 这里是应用层面处理时间，还有一种方案是在数据库层面处理时间，比如在postgresql中使用timestamp with time zone
// 当前的最新趋势，倾向于使用应用层触发，因为当前的云原生和微服务架构，数据库层面操作时间，会增加复杂度；
// 而现在ORM框架的成熟，使用应用层管理时间字段更加方便；
export const createdAt = timestamp({ withTimezone: true })
  .notNull()
  .defaultNow();
export const updatedAt = timestamp({ withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());
