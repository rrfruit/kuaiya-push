import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { cn } from "@/lib/utils";
import { ScrollTextIcon, XIcon, Trash2Icon, GripIcon } from "lucide-react";
import { useWebSocketEvent, useWebSocketStatus } from "@/hooks/use-websocket";
import { ResizablePanel, calculateDefaultPosition } from "./resizable-panel";

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  context?: string;
}

interface LogData {
  timestamp?: string;
  level?: string;
  message?: string;
  context?: string;
}

const STORAGE_KEY = "log-viewer-panel-state";
const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 400;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;

export function LogViewer() {
  const [isOpen, setIsOpen] = useState(false);

  // 计算默认位置：在按钮左边，底部对齐
  const defaultState = useMemo(() => {
    const { x, y } = calculateDefaultPosition({
      anchorRight: 24,
      anchorBottom: 24,
      anchorWidth: 56,
      anchorHeight: 56,
      panelWidth: DEFAULT_WIDTH,
      panelHeight: DEFAULT_HEIGHT,
      gap: 16,
    });
    return { x, y, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
  }, []);

  const status = useWebSocketStatus();
  const isConnected = status === "connected";


  return (
    <>
      {/* 全局悬浮按钮 */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-all",
          "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500",
          "size-14"
        )}
        size="icon-lg"
      >
        <ScrollTextIcon className="size-6" />
      </Button>

      {/* 日志弹出层 */}
      <ResizablePanel
        open={isOpen}
        storageKey={STORAGE_KEY}
        defaultState={defaultState}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        className="shadow-2xl"
      >
        {({ onMouseDown, isDragging }) => (
          <Card className="flex flex-col pt-0 pb-2 gap-2 h-full border-0 bg-zinc-900/95 backdrop-blur-sm text-zinc-100 rounded-xl overflow-hidden">
            {/* 头部 - 可拖动区域 */}
            <CardHeader
              className={cn(
                "cursor-grab pt-2.5! pb-2! gap-0 border-b border-zinc-700/50 shrink-0",
                "bg-gradient-to-r from-zinc-800 to-zinc-800/80",
                isDragging && "cursor-grabbing"
              )}
              onMouseDown={onMouseDown}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripIcon className="size-4 text-zinc-500" />
                  <CardTitle className="text-sm font-medium text-zinc-200">
                    实时日志
                  </CardTitle>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                      isConnected
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        isConnected ? "bg-emerald-400" : "bg-red-400"
                      )}
                    />
                    {isConnected ? "已连接" : "未连接"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setIsOpen(false)}
                    className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* 日志内容区域 */}
            <CardContent className="p-0 overflow-hidden flex-1 min-h-0">
              <LogContent />
            </CardContent>
          </Card>
        )}
      </ResizablePanel>
    </>
  );
}

const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case "error":
      return "text-red-500";
    case "warn":
    case "warning":
      return "text-amber-500";
    case "debug":
      return "text-blue-400";
    default:
      return "text-emerald-400";
  }
};

const formatTime = (timestamp: string) => {
  try {
    return new Date(timestamp).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return timestamp;
  }
};


function LogContent() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // 处理日志消息
  const handleLogMessage = useCallback((data: LogData) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: data.timestamp || new Date().toISOString(),
      level: data.level || "info",
      message: data.message || JSON.stringify(data),
      context: data.context,
    };
    setLogs((prev) => [...prev.slice(-499), newLog]);
  }, []);

  // 使用全局 WebSocket 监听 log 事件
  useWebSocketEvent<LogData>("log", handleLogMessage);

  // 自动滚动到底部
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return <div className="overflow-y-auto font-mono text-xs leading-relaxed h-full">
    {logs.length === 0 ? (
      <div className="flex items-center justify-center h-full text-zinc-500">
        暂无日志
      </div>
    ) : (
      <div className="divide-y divide-zinc-800/50">
        {logs.map((log) => (
          <LogItem key={log.id} log={log} />
        ))}
        <div ref={logsEndRef} />
      </div>
    )}
  </div>
}

function LogItem({ log }: { log: LogEntry }) {
  return (
    <div
      className="px-4 py-0.5 hover:bg-zinc-800/30 transition-colors"
    >
      <div className="flex items-start gap-2">
        <span className="text-zinc-500 shrink-0">
          {formatTime(log.timestamp)}
        </span>
        <span
          className={cn(
            "font-semibold uppercase shrink-0 w-12",
            getLevelColor(log.level)
          )}
        >
          {log.level}
        </span>
        {log.context && (
          <span className="text-violet-400 shrink-0">
            [{log.context}]
          </span>
        )}
        <span className="text-zinc-300 break-all">
          {log.message}
        </span>
      </div>
    </div>
  );
}
