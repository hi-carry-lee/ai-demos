// user controller, only one method, get all users

import type { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';

export class UserController {
  static async getAllUsers(_req: Request, res: Response) {
    const users = await UserService.findAllUsers();
    res.json({
      success: true,
      data: users,
    });
    return;
  }
}
