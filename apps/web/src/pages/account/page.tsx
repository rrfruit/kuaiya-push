import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "@/api/account";
import { columns, AccountWithRelations } from "./columns";
import { DataTable } from "@/components/data-table";
import { Loader2, PlusIcon } from "lucide-react";
import { AccountStatusEnum } from "@/types/enum";
import { Button } from "@repo/ui/components/ui/button";

export default function AccountPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
  });

  const accounts = (data?.data || []) as AccountWithRelations[];

  // Define filters for the DataTable
  const filters = [
    {
      columnId: "status",
      title: "Status",
      options: [
        { label: "Logged In", value: AccountStatusEnum.LOGGED_IN },
        { label: "Not Logged In", value: AccountStatusEnum.NOT_LOGGED_IN },
        { label: "Login Expired", value: AccountStatusEnum.LOGIN_EXPIRED },
      ],
    },
  ];

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
        <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "Unknown error"}</p>
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
        <Button size="sm" onClick={() => {}}>
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
    </div>
  );
}
