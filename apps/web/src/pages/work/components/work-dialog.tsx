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
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Button } from "@repo/ui/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

import { Work, WorkType } from "@/types";
import { createWork, updateWork } from "@/api/work";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  type: z.enum(["TEXT", "IMAGE", "VIDEO"] as const),
  description: z.string().optional(),
  mediaUrl: z.string().optional(),
  coverUrl: z.string().optional(),
  content: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const workTypes: { label: string; value: WorkType }[] = [
  { label: "文本", value: "TEXT" },
  { label: "图片", value: "IMAGE" },
  { label: "视频", value: "VIDEO" },
];

interface WorkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  work?: Work | null;
}

export function WorkDialog({ open, onOpenChange, work }: WorkDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!work;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "VIDEO",
      description: "",
      mediaUrl: "",
      coverUrl: "",
      content: "",
    },
  });

  // Reset form when work changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        title: work?.title || "",
        type: work?.type || "VIDEO",
        description: work?.description || "",
        mediaUrl: work?.mediaUrl || "",
        coverUrl: work?.coverUrl || "",
        content: work?.content || "",
      });
    }
  }, [work, open, form]);

  // 创建作品
  const createMutation = useMutation({
    mutationFn: createWork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      toast.success("作品创建成功");
      onOpenChange(false);
      form.reset();
    },
    onError: (err) => {
      toast.error("创建失败: " + (err instanceof Error ? err.message : "未知错误"));
    },
  });

  // 更新作品
  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => updateWork(work!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      toast.success("作品更新成功");
      onOpenChange(false);
      form.reset();
    },
    onError: (err) => {
      toast.error("更新失败: " + (err instanceof Error ? err.message : "未知错误"));
    },
  });

  const onSubmit = (values: FormValues) => {
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑作品" : "创建作品"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "修改作品信息。" : "创建一个新的作品。"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      {workTypes.map((type) => (
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
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标题</FormLabel>
                  <FormControl>
                    <Input placeholder="输入作品标题" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入作品描述"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mediaUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>媒体 URL (可选)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/media.mp4" {...field} />
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
                  <FormLabel>封面 URL (可选)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/cover.jpg" {...field} />
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
