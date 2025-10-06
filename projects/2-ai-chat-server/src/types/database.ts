// 用户相关类型
export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// 会话相关类型
export interface CreateConversationData {
  userId: string;
  title: string;
  model: string;
  status?: "active" | "archived" | "deleted";
}

export interface UpdateConversationData {
  title?: string;
  status?: "active" | "archived" | "deleted";
  model?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  status: "active" | "archived" | "deleted";
  model: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  messages?: Message[];
}

// 消息相关类型
export interface CreateMessageData {
  conversationId: string;
  role: "user" | "model";
  content: string;
}

export interface UpdateMessageData {
  content: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "model";
  content: string;
  createdAt: Date;
  updatedAt: Date;
  conversation?: Conversation;
}

export interface AuthResult {
  success: boolean;
  user?: Omit<User, "password">;
  token?: string;
  error?: string;
}
