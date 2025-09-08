// 这个文件是AI生成的，用来处理Server action中重复的错误处理逻辑
export class ActionError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "ActionError";
  }
}

export class AuthError extends ActionError {
  constructor(message = "You don't have permission to do this") {
    super(message, "AUTH_ERROR");
  }
}

export class ValidationError extends ActionError {
  constructor(message = "Invalid data provided") {
    super(message, "VALIDATION_ERROR");
  }
}

export class ResourceNotFoundError extends ActionError {
  constructor(message = "Resource not found") {
    super(message, "RESOURCE_NOT_FOUND");
  }
}
