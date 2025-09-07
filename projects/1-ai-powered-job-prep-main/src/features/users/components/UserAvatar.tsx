import { ComponentProps } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";

export function UserAvatar({
  user,
  ...props
}: {
  user: { name: string; imageUrl: string };
} & ComponentProps<typeof Avatar>) {
  return (
    <Avatar {...props}>
      <AvatarImage src={user.imageUrl} alt={user.name} />
      <AvatarFallback className="uppercase">
        {/* 生成用户头像的后备文本（fallback text），当用户的头像图片无法加载时显示 */}
        {/* 取用户first name和last name的首字母 */}
        {user.name
          .split(" ")
          .slice(0, 2)
          .map((n) => n[0])
          .join("")}
      </AvatarFallback>
    </Avatar>
  );
}
