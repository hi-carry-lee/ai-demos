import { UserRepository } from "../repositories/user.repository.js";

export class UserService {
  /**
   * 根据邮箱查找用户
   */
  static async findUserByEmail(email: string) {
    return UserRepository.findByEmail(email);
  }

  /**
   * 根据id查找用户
   */
  static async validateUserExists(id: string) {
    return UserRepository.findById(id);
  }

  /**
   * 检查邮箱是否已存在
   */
  static async checkEmailExists(email: string) {
    return UserRepository.emailExists(email);
  }
  /**
   * 检查邮箱是否已存在
   */
  static async findAllUsers() {
    return UserRepository.findAll();
  }
}
