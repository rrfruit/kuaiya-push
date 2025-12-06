import { useState, useRef } from "react";
import { getAccounts, deleteAccount } from "@/api/account";
import { getColumns } from "./columns";
import { AccountWithRelations } from "@/types";
import { DataTable } from "@/components/data-table";
import { Loader2, PlusIcon } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { AccountDialog } from "./account-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import useRequest from "@/hooks/useRequest";

export default function AccountPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountWithRelations | null>(null);
  const [deleteAccountData, setDeleteAccountData] = useState<AccountWithRelations | null>(null);

  // 刷新函数引用
  const refreshRef = useRef<(() => void) | null>(null);

  // 获取账号列表
  const { data, isLoading, isError, error, refresh } = useRequest(getAccounts);

  // 存储刷新函数
  refreshRef.current = refresh;

  const accounts = data || [];

  // 删除操作
  const { execute: executeDelete, isLoading: isDeleting } = useRequest(
    deleteAccount,
    {
      manual: true,
      onSuccess: () => {
        toast.success("账号已删除");
        setDeleteAccountData(null);
        refresh();
      },
      onError: (error) => {
        toast.error("删除失败: " + (error?.message || "未知错误"));
      },
    }
  );

  // Define filters for the DataTable
  const filters = [
    {
      columnId: "isLoggedIn",
      title: "isLoggedIn",
      options: [
        { label: "是", value: '1' },
        { label: "否", value: '0' },
      ],
    },
  ];

  const handleCreate = () => {
    setEditingAccount(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (account: AccountWithRelations) => {
    setEditingAccount(account);
    setIsDialogOpen(true);
  };

  const handleDelete = (account: AccountWithRelations) => {
    setDeleteAccountData(account);
  };

  const columns = getColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-destructive">
        <p>Error loading accounts</p>
        <p className="text-sm text-muted-foreground">{error?.message || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="hidden h-full flex-1 flex-col space-y-4 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">账号管理</h2>
          <p className="text-muted-foreground">
            管理你的社交媒体账号及其状态。
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <PlusIcon className="h-4 w-4" />
          添加账号
        </Button>
      </div>
      <DataTable 
        data={accounts} 
        columns={columns} 
        searchKey="displayName"
        searchPlaceholder="Filter accounts..."
        filters={filters}
      />
      
      <AccountDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        account={editingAccount}
        onSuccess={refresh}
      />

      <ConfirmDialog
        open={!!deleteAccountData}
        onOpenChange={(open) => !open && setDeleteAccountData(null)}
        title="确认删除账号?"
        desc={`您确定要删除账号 "${deleteAccountData?.displayName}" 吗？此操作无法撤销。`}
        confirmText="删除"
        destructive
        handleConfirm={() => deleteAccountData && executeDelete(deleteAccountData.id)}
        isLoading={isDeleting}
      />
    </div>
  );
}
