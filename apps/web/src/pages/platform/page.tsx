import { platforms } from "@repo/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { ExternalLink } from "lucide-react";

export default function PlatformPage() {
  return (
    <div className="flex h-full flex-1 flex-col space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">平台管理</h2>
          <p className="text-muted-foreground">
            查看支持的社交媒体平台列表。
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {platforms.length} 个平台
        </Badge>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {platforms.map((platform) => (
          <Card
            key={platform.code}
            className="group relative overflow-hidden transition-all hover:shadow-sm hover:border-primary/20"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted p-2">
                  <img
                    src={platform.logoUrl}
                    alt={platform.name}
                    className="h-10 w-10 object-contain"
                    onError={(e) => {
                      // 图片加载失败时显示首字母
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden"
                      );
                    }}
                  />
                  <span className="hidden text-2xl font-bold text-muted-foreground">
                    {platform.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{platform.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">
                    {platform.code}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  已支持
                </Badge>
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  访问官网
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}