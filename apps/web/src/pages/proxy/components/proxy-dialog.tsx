import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Button } from "@repo/ui/components/ui/button";
import { Switch } from "@repo/ui/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

import { ProxyType } from "@/types";
import { ProxyWithCount, createProxy, updateProxy } from "@/api/proxy";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().optional(),
  type: z.enum(["HTTP", "HTTPS", "SOCKS5"] as const),
  host: z.string().min(1, "主机地址不能为空"),
  port: z.coerce.number().min(1, "端口号无效").max(65535, "端口号无效"),
  username: z.string().optional(),
  password: z.string().optional(),
  isActive: z.boolean(),
  location: z.string().optional(),
  expireAt: z.string().optional(),
  remark: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const proxyTypes: { label: string; value: ProxyType }[] = [
  { label: "HTTP", value: "HTTP" },
  { label: "HTTPS", value: "HTTPS" },
  { label: "SOCKS5", value: "SOCKS5" },
];

interface ProxyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proxy?: ProxyWithCount | null;
}

export function ProxyDialog({ open, onOpenChange, proxy }: ProxyDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!proxy;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "HTTP",
      host: "",
      port: 8080,
      username: "",
      password: "",
      isActive: true,
      location: "",
      expireAt: "",
      remark: "",
    },
  });

  // Reset form when proxy changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        name: proxy?.name || "",
        type: proxy?.type || "HTTP",
        host: proxy?.host || "",
        port: proxy?.port || 8080,
        username: proxy?.username || "",
        password: proxy?.password || "",
        isActive: proxy?.isActive ?? true,
        location: proxy?.location || "",
        expireAt: proxy?.expireAt
          ? new Date(proxy.expireAt).toISOString().split("T")[0]
          : "",
        remark: proxy?.remark || "",
      });
    }
  }, [proxy, open, form]);

  // 创建代理
  const createMutation = useMutation({
    mutationFn: createProxy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proxies"] });
      toast.success("代理创建成功");
      onOpenChange(false);
      form.reset();
    },
    onError: (err) => {
      toast.error("创建失败: " + (err instanceof Error ? err.message : "未知错误"));
    },
  });

  // 更新代理
  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      updateProxy(proxy!.id, {
        ...values,
        expireAt: values.expireAt || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proxies"] });
      toast.success("代理更新成功");
      onOpenChange(false);
      form.reset();
    },
    onError: (err) => {
      toast.error("更新失败: " + (err instanceof Error ? err.message : "未知错误"));
    },
  });

  const onSubmit = (values: FormValues) => {
    const data = {
      ...values,
      expireAt: values.expireAt || undefined,
    };
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑代理" : "添加代理"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "修改代理配置信息。" : "添加一个新的代理服务器。"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名称 (可选)</FormLabel>
                    <FormControl>
                      <Input placeholder="例如: 美国代理1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>类型</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {proxyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>主机地址</FormLabel>
                    <FormControl>
                      <Input placeholder="例如: 192.168.1.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>端口</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="8080" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名 (可选)</FormLabel>
                    <FormControl>
                      <Input placeholder="认证用户名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码 (可选)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="认证密码" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>位置 (可选)</FormLabel>
                    <FormControl>
                      <Input placeholder="例如: 美国" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expireAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>过期时间 (可选)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注 (可选)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="添加备注信息..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>启用代理</FormLabel>
                    <FormDescription>启用后可在账号中使用此代理</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "保存" : "创建"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
