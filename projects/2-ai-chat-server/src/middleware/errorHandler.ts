import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // 记录错误
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // 返回错误响应
  res.status(500).json({
    error: 'Internal Server Error',
    // 开发环境显示详细错误
    ...(process.env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack,
    }),
  });
};
