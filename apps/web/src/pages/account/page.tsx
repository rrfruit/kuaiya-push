import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "@/api/account";
import { columns, AccountWithRelations } from "./columns";
import { DataTable } from "@/components/data-table";
import { AccountStatus } from "@repo/db/types";
import { Loader2 } from "lucide-react";

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
        { label: "Logged In", value: AccountStatus.LOGGED_IN },
        { label: "Not Logged In", value: AccountStatus.NOT_LOGGED_IN },
        { label: "Login Expired", value: AccountStatus.LOGIN_EXPIRED },
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
    <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">
            Manage your social media accounts and their status.
          </p>
        </div>
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
