import { PricingTable as ClerkPricingTable } from "@clerk/nextjs";

// export function PricingTable() {
//   return <ClerkPricingTable newSubscriptionRedirectUrl="/app" />;
// }

export function PricingTable() {
  // 开发阶段使用占位符，避免 Clerk 计费配置
  if (process.env.NODE_ENV === "development") {
    return (
      <div className="p-8 text-center border border-border rounded-lg bg-muted/20">
        <h3 className="text-xl font-semibold mb-2">Pricing Plans</h3>
        <p className="text-muted-foreground mb-4">
          Pricing plans will be available in production
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="p-6 border border-border rounded-lg">
            <h4 className="font-medium text-lg mb-2">Free Plan</h4>
            <p className="text-2xl font-bold mb-2">$0</p>
            <p className="text-sm text-muted-foreground mb-4">Basic features</p>
            <ul className="text-sm space-y-1">
              <li>✓ 5 job applications</li>
              <li>✓ Basic AI feedback</li>
              <li>✓ Standard templates</li>
            </ul>
          </div>
          <div className="p-6 border border-border rounded-lg bg-primary/5">
            <h4 className="font-medium text-lg mb-2">Pro Plan</h4>
            <p className="text-2xl font-bold mb-2">$29</p>
            <p className="text-sm text-muted-foreground mb-4">
              Everything in Free, plus:
            </p>
            <ul className="text-sm space-y-1">
              <li>✓ Unlimited applications</li>
              <li>✓ Advanced AI analysis</li>
              <li>✓ Custom templates</li>
              <li>✓ Priority support</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // 生产环境使用真实的 Clerk 定价表
  return <ClerkPricingTable newSubscriptionRedirectUrl="/app" />;
}
