import { SignIn } from "@clerk/nextjs";

// 使用了可选捕获路由语法，可以匹配 /sign-in 后面的任意数量的路径段，例如：/sign-in/a/b/c 都会被这个路由捕获
export default function SignInPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
