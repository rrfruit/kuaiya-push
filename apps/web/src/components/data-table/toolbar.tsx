import { Cross2Icon } from "@radix-ui/react-icons";
import { type Table } from "@tanstack/react-table";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { DataTableFacetedFilter } from "./faceted-filter";
import { DataTableViewOptions } from "./view-options";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  searchPlaceholder?: string;
  searchKey?: string;
  filters?: {
    columnId: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
  // 服务端搜索参数
  manualFiltering?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Filter...",
  searchKey,
  filters = [],
  manualFiltering,
  searchValue,
  onSearchChange,
}: DataTableToolbarProps<TData>) {
  // 对于服务端过滤，使用外部的 searchValue；否则使用 table 的内部状态
  const currentSearchValue = manualFiltering
    ? searchValue ?? ""
    : searchKey
      ? (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
      : table.getState().globalFilter ?? "";

  const handleSearchChange = (value: string) => {
    if (manualFiltering && onSearchChange) {
      onSearchChange(value);
    } else if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(value);
    } else {
      table.setGlobalFilter(value);
    }
  };

  const isFiltered = manualFiltering
    ? (searchValue && searchValue.length > 0) || table.getState().columnFilters.length > 0
    : table.getState().columnFilters.length > 0 || table.getState().globalFilter;

  const handleReset = () => {
    table.resetColumnFilters();
    if (manualFiltering && onSearchChange) {
      onSearchChange("");
    } else {
      table.setGlobalFilter("");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder={searchPlaceholder}
          value={currentSearchValue}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
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
            Reset
            <Cross2Icon className="ms-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
