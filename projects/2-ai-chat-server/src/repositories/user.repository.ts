import { prisma } from "../lib/prisma.js";
import type { RegisterUserData } from "../types/database.js";

export class UserRepository {
  /**
   * 注册新用户
   */
  static async create(data: RegisterUserData) {
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });
    return newUser;
  }

  /**
   * 根据邮箱查找用户
   */
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * 根据id查找用户
   */
  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * 检查邮箱是否已存在
   */
  static async emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  /**
   * 获取所有用户
   */
  static async findAll() {
    // how to get all users from prisma
    return prisma.user.findMany();
  }
}
