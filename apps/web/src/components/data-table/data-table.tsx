import { useState, useEffect, useMemo, useCallback } from "react";
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { DataTablePagination } from "./pagination";
import { DataTableServerToolbar } from "./server-toolbar";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import useRequest from "@/hooks/useRequest";
import type { PaginatedResult } from "@/types";
import { Loader2 } from "lucide-react";

/** 过滤器配置 */
export interface FilterConfig {
  columnId: string;
  title: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

/** 服务端请求参数 */
export interface ServerParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  filters?: Record<string, string | string[]>;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  /** 数据获取函数 */
  fetchData: (params: ServerParams) => Promise<PaginatedResult<TData>>;
  /** 搜索框占位符 */
  searchPlaceholder?: string;
  /** 过滤器配置 */
  filters?: FilterConfig[];
  /** 默认每页条数 */
  defaultPageSize?: number;
  /** 搜索防抖延迟（毫秒） */
  debounceMs?: number;
  /** 表格样式类名 */
  className?: string;
  /** 获取刷新函数的回调 */
  onRefreshRef?: (refresh: () => void) => void;
}

export function ServerDataTable<TData, TValue>({
  columns,
  fetchData,
  searchPlaceholder = "搜索...",
  filters = [],
  defaultPageSize = 10,
  debounceMs = 300,
  className,
  onRefreshRef,
}: DataTableProps<TData, TValue>) {
  // 表格状态
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  // 搜索状态
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebouncedValue(searchValue, debounceMs);

  // 构建过滤参数
  const filterParams = useMemo(() => {
    const params: Record<string, string | string[]> = {};
    columnFilters.forEach((filter) => {
      params[filter.id] = filter.value as string | string[];
    });
    return params;
  }, [columnFilters]);

  // 构建服务端参数
  const serverParams = useMemo<ServerParams>(() => {
    const params: ServerParams = {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    };

    const firstSort = sorting[0];
    if (firstSort) {
      params.sortBy = firstSort.id;
      params.sortOrder = firstSort.desc ? "desc" : "asc";
    }

    if (debouncedSearchValue) {
      params.search = debouncedSearchValue;
    }

    if (Object.keys(filterParams).length > 0) {
      params.filters = filterParams;
    }

    return params;
  }, [pagination, sorting, debouncedSearchValue, filterParams]);

  // 使用 useRequest 获取数据
  const { data, isLoading, isError, error, execute } = useRequest(fetchData, {
    manual: true,
  });

  // 请求数据
  const fetchDataCallback = useCallback(() => {
    execute(serverParams);
  }, [execute, serverParams]);

  // 当参数变化时重新获取数据
  useEffect(() => {
    fetchDataCallback();
  }, [fetchDataCallback]);

  // 提供刷新函数给外部
  useEffect(() => {
    onRefreshRef?.(fetchDataCallback);
  }, [onRefreshRef, fetchDataCallback]);

  // 处理过滤器变化（同时重置到第一页）
  const handleColumnFiltersChange = useCallback(
    (
      updaterOrValue:
        | ColumnFiltersState
        | ((old: ColumnFiltersState) => ColumnFiltersState),
    ) => {
      setColumnFilters(updaterOrValue);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [],
  );

  // 处理搜索变化（同时重置到第一页）
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  // 表格数据
  const tableData = data?.list ?? [];
  const pageCount = data?.totalPages ?? 0;

  const table = useReactTable({
    data: tableData,
    columns,
    pageCount,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={className}>
      <DataTableServerToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        filters={filters}
        columnFilters={columnFilters}
        onColumnFiltersChange={handleColumnFiltersChange}
      />
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  {error?.message || "未知错误"}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
