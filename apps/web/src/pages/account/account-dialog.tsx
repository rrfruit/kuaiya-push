import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import useRequest from "@/hooks/useRequest";

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
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

import { AccountWithRelations } from "@/types";
import { createAccount, updateAccount } from "@/api/account";
import { platforms } from "@repo/shared";

const formSchema = z.object({
  displayName: z.string().min(1, "显示名称不能为空"),
  platform: z.string().min(1, "请选择平台"),
  coverUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: AccountWithRelations | null;
  onSuccess?: () => void;
}

export function AccountDialog({ open, onOpenChange, account, onSuccess }: AccountDialogProps) {
  const isEdit = !!account;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      platform: "",
      coverUrl: "",
    },
  });

  // Reset form when account changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        displayName: account?.displayName || "",
        platform: account?.platform || "",
        coverUrl: account?.coverUrl || "",
      });
    }
  }, [account, open, form]);

  // 创建账号
  const { execute: executeCreate, isLoading: isCreating } = useRequest(
    createAccount,
    {
      manual: true,
      onSuccess: () => {
        onSuccess?.();
        onOpenChange(false);
        form.reset();
      },
    }
  );

  // 更新账号
  const { execute: executeUpdate, isLoading: isUpdating } = useRequest(
    (values: FormValues) => updateAccount(account!.id, values),
    {
      manual: true,
      onSuccess: () => {
        onSuccess?.();
        onOpenChange(false);
        form.reset();
      },
    }
  );

  const onSubmit = (values: FormValues) => {
    if (isEdit) {
      executeUpdate(values);
    } else {
      executeCreate(values);
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑账号" : "添加账号"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "修改账号信息。" : "添加一个新的社交媒体账号。"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>平台</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEdit}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择平台" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform.name} value={platform.code}>
                          {platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>显示名称</FormLabel>
                  <FormControl>
                    <Input placeholder="例如: 我的Instagram账号" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>封面图片 URL (可选)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
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
