import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { getProxies, deleteProxy } from "@/api/proxy";
import { columns } from "./components/columns";
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from "@/components/data-table";
import { PlusIcon } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { ProxyDialog } from "./components/proxy-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { ProxiesProvider, useProxies } from "./components/proxies-provider";

const QUERY_KEY = "proxies";

function ProxyContent() {
  const queryClient = useQueryClient();
  const { open, setOpen, currentRow, setCurrentRow } = useProxies();

  // 获取代理列表
  const {
    data: proxies = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getProxies,
  });

  // 删除操作
  const deleteMutation = useMutation({
    mutationFn: deleteProxy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("代理已删除");
      setOpen(null);
      setCurrentRow(null);
    },
    onError: (err) => {
      toast.error(
        "删除失败: " + (err instanceof Error ? err.message : "未知错误"),
      );
    },
  });

  const filters = [
    {
      columnId: "type",
      title: "类型",
      options: [
        { label: "HTTP", value: "HTTP" },
        { label: "HTTPS", value: "HTTPS" },
        { label: "SOCKS5", value: "SOCKS5" },
      ],
    },
    {
      columnId: "isActive",
      title: "状态",
      options: [
        { label: "启用", value: "1" },
        { label: "禁用", value: "0" },
      ],
    },
  ];

  // 客户端表格
  const table = useReactTable({
    data: proxies,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex h-full flex-1 flex-col space-y-4 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">代理管理</h2>
          <p className="text-muted-foreground">管理你的代理服务器配置。</p>
        </div>
        <Button size="sm" onClick={() => setOpen("create")}>
          <PlusIcon className="h-4 w-4" />
          添加代理
        </Button>
      </div>

      <div className="space-y-4">
        <DataTableToolbar
          table={table}
          searchKey="name"
          searchPlaceholder="搜索代理..."
          filters={filters}
        />
        <DataTable
          table={table}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error instanceof Error ? error.message : undefined}
        />
        <DataTablePagination table={table} />
      </div>

      <ProxyDialog
        open={open === "create" || open === "update"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null);
            setCurrentRow(null);
          }
        }}
        proxy={open === "update" ? currentRow : null}
      />

      <ConfirmDialog
        open={open === "delete"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null);
            setCurrentRow(null);
          }
        }}
        title="确认删除代理?"
        desc={`您确定要删除代理 "${currentRow?.name || `${currentRow?.host}:${currentRow?.port}`}" 吗？关联的账号将不再使用此代理。`}
        confirmText="删除"
        destructive
        handleConfirm={() => currentRow && deleteMutation.mutate(currentRow.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function ProxyPage() {
  return (
    <ProxiesProvider>
      <ProxyContent />
    </ProxiesProvider>
  );
}
