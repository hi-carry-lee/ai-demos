// 分层的缓存标签系统

type CacheTag = "users" | "jobInfos" | "interviews" | "questions";

// 四种标签类型：
// 1. 全局标签：global:users, global:jobInfos 等
export function getGlobalTag(tag: CacheTag) {
  return `global:${tag}` as const;
}

// 2. 用户标签：user:userId:users, user:userId:jobInfos 等
export function getUserTag(tag: CacheTag, userId: string) {
  return `user:${userId}:${tag}` as const;
}

// 3. 工作信息标签：jobInfo:jobInfoId:questions, jobInfo:jobInfoId:interviews 等
export function getJobInfoTag(tag: CacheTag, jobInfoId: string) {
  return `jobInfo:${jobInfoId}:${tag}` as const;
}

// 4. ID标签：id:userId:users, id:questionId:questions 等
export function getIdTag(tag: CacheTag, id: string) {
  return `id:${id}:${tag}` as const;
}
