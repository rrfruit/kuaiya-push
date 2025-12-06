import { Cross2Icon } from "@radix-ui/react-icons";
import { type Table } from "@tanstack/react-table";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { DataTableFacetedFilter } from "./faceted-filter";
import { DataTableViewOptions } from "./view-options";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  searchPlaceholder?: string;
  /** 客户端过滤：指定列名 */
  searchKey?: string;
  /** 服务端过滤：受控搜索值 */
  searchValue?: string;
  /** 服务端过滤：搜索值变化回调 */
  onSearchChange?: (value: string) => void;
  filters?: {
    columnId: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
};

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "搜索...",
  searchKey,
  searchValue,
  onSearchChange,
  filters = [],
}: DataTableToolbarProps<TData>) {
  // 是否为受控模式（服务端搜索）
  const isControlled =
    searchValue !== undefined && onSearchChange !== undefined;

  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    (isControlled ? searchValue : table.getState().globalFilter);

  const handleReset = () => {
    table.resetColumnFilters();
    if (isControlled) {
      onSearchChange("");
    } else {
      table.setGlobalFilter("");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        {isControlled ? (
          // 服务端搜索：受控模式
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        ) : searchKey ? (
          // 客户端搜索：指定列
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table.getColumn(searchKey)?.setFilterValue(e.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        ) : (
          // 客户端搜索：全局
          <Input
            placeholder={searchPlaceholder}
            value={table.getState().globalFilter ?? ""}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        <div className="flex gap-x-2">
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId);
            if (!column) return null;
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            );
          })}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-8 px-2 lg:px-3"
          >
            重置
            <Cross2Icon className="ms-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
