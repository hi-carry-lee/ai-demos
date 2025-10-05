import express from "express";
import { env } from "./config/env.js"; // 注意：ESM需要.js后缀
import { errorHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";
import cors from "cors";

// 创建Express应用
const app = express();

// ========== 中间件 ==========
// 替换现有的 CORS 中间件
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.com"]
        : true,
    credentials: true,
  })
);

// 解析JSON请求体，否则无法使用 req.body
app.use(express.json());
// 解析URL编码的请求体（表单数据）
app.use(express.urlencoded({ extended: true }));

// ========== 路由 ==========
// API路由（所有路由前缀/api）
app.use("/api", routes);

// 根路径健康检查
app.get("/", (_req: express.Request, res: express.Response) => {
  res.json({
    message: "Server is running",
    version: "1.0.0",
  });
});

// ========== 错误处理 ==========
// 必须放在所有路由之后
app.use(errorHandler);

// ========== 启动服务器 ==========
app.listen(env.PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${env.PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
});
