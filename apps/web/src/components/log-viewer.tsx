import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { cn } from "@/lib/utils";
import { ScrollTextIcon, XIcon, Trash2Icon, GripIcon } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";

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

interface PanelState {
  x: number;
  y: number;
  width: number;
  height: number;
}

const STORAGE_KEY = "log-viewer-panel-state";
const BUTTON_SIZE = 56; // size-14 = 3.5rem = 56px
const BUTTON_MARGIN = 24; // bottom-6 right-6 = 1.5rem = 24px
const GAP = 16; // 按钮和日志框之间的间距

const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 400;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;

// 计算默认位置：在按钮左边，底部对齐
function getDefaultState(): PanelState {
  const x = window.innerWidth - BUTTON_MARGIN - BUTTON_SIZE - GAP - DEFAULT_WIDTH;
  const y = window.innerHeight - BUTTON_MARGIN - DEFAULT_HEIGHT;
  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  };
}

function loadState(): PanelState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved) as PanelState;
      // 确保位置在可视范围内
      return {
        x: Math.max(0, Math.min(state.x, window.innerWidth - state.width)),
        y: Math.max(0, Math.min(state.y, window.innerHeight - state.height)),
        width: Math.max(MIN_WIDTH, state.width),
        height: Math.max(MIN_HEIGHT, state.height),
      };
    }
  } catch {
    // 忽略解析错误
  }
  return getDefaultState();
}

function saveState(state: PanelState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 忽略存储错误
  }
}

type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | null;

export function LogViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [panelState, setPanelState] = useState<PanelState>(loadState);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<ResizeDirection>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialState, setInitialState] = useState<PanelState | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
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

  // 使用全局 WebSocket 监听 log 事件（仅在面板打开时订阅）
  const { status } = useWebSocket<LogData>(
    isOpen ? "log" : "", // 空字符串时不会订阅
    handleLogMessage
  );

  const isConnected = status === "connected";

  // 保存状态到 localStorage
  useEffect(() => {
    if (!isDragging && !isResizing) {
      saveState(panelState);
    }
  }, [panelState, isDragging, isResizing]);

  // 自动滚动到底部
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // 拖动开始
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialState({ ...panelState });
    },
    [panelState]
  );

  // 调整大小开始
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: ResizeDirection) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeDir(direction);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialState({ ...panelState });
    },
    [panelState]
  );

  // 处理鼠标移动
  useEffect(() => {
    if (!isDragging && !isResizing) return;
    if (!initialState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      if (isDragging) {
        const newX = Math.max(0, Math.min(initialState.x + deltaX, window.innerWidth - panelState.width));
        const newY = Math.max(0, Math.min(initialState.y + deltaY, window.innerHeight - panelState.height));
        setPanelState((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (isResizing && resizeDir) {
        let newX = initialState.x;
        let newY = initialState.y;
        let newWidth = initialState.width;
        let newHeight = initialState.height;

        // 处理宽度调整
        if (resizeDir.includes("e")) {
          newWidth = Math.max(MIN_WIDTH, initialState.width + deltaX);
        }
        if (resizeDir.includes("w")) {
          const maxDeltaX = initialState.width - MIN_WIDTH;
          const clampedDeltaX = Math.max(-maxDeltaX, Math.min(deltaX, initialState.x));
          newX = initialState.x + clampedDeltaX;
          newWidth = initialState.width - clampedDeltaX;
        }

        // 处理高度调整
        if (resizeDir.includes("s")) {
          newHeight = Math.max(MIN_HEIGHT, initialState.height + deltaY);
        }
        if (resizeDir.includes("n")) {
          const maxDeltaY = initialState.height - MIN_HEIGHT;
          const clampedDeltaY = Math.max(-maxDeltaY, Math.min(deltaY, initialState.y));
          newY = initialState.y + clampedDeltaY;
          newHeight = initialState.height - clampedDeltaY;
        }

        // 限制在窗口范围内
        newX = Math.max(0, newX);
        newY = Math.max(0, newY);
        newWidth = Math.min(newWidth, window.innerWidth - newX);
        newHeight = Math.min(newHeight, window.innerHeight - newY);

        setPanelState({ x: newX, y: newY, width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDir(null);
      setInitialState(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, resizeDir, dragStart, initialState, panelState.width, panelState.height]);

  const clearLogs = () => {
    setLogs([]);
  };

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

  // 调整大小手柄的通用样式
  const resizeHandleClass = "absolute z-10 hover:bg-violet-500/30 transition-colors";

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
      {isOpen && (
        <Card
          ref={panelRef}
          className={cn(
            "fixed z-50 shadow-2xl border-0 flex flex-col",
            "bg-zinc-900/95 backdrop-blur-sm text-zinc-100",
            (isDragging || isResizing) && "select-none"
          )}
          style={{
            left: panelState.x,
            top: panelState.y,
            width: panelState.width,
            height: panelState.height,
          }}
        >
          {/* 调整大小的手柄 */}
          {/* 四角 */}
          <div
            className={cn(resizeHandleClass, "top-0 left-0 w-3 h-3 cursor-nw-resize rounded-tl-xl")}
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
          <div
            className={cn(resizeHandleClass, "top-0 right-0 w-3 h-3 cursor-ne-resize rounded-tr-xl")}
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div
            className={cn(resizeHandleClass, "bottom-0 left-0 w-3 h-3 cursor-sw-resize rounded-bl-xl")}
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div
            className={cn(resizeHandleClass, "bottom-0 right-0 w-3 h-3 cursor-se-resize rounded-br-xl")}
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
          {/* 四边 */}
          <div
            className={cn(resizeHandleClass, "top-0 left-3 right-3 h-1 cursor-n-resize")}
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
          <div
            className={cn(resizeHandleClass, "bottom-0 left-3 right-3 h-1 cursor-s-resize")}
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          <div
            className={cn(resizeHandleClass, "left-0 top-3 bottom-3 w-1 cursor-w-resize")}
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
          <div
            className={cn(resizeHandleClass, "right-0 top-3 bottom-3 w-1 cursor-e-resize")}
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />

          {/* 头部 - 可拖动区域 */}
          <CardHeader
            className={cn(
              "cursor-grab py-3 border-b border-zinc-700/50 shrink-0",
              "bg-gradient-to-r from-zinc-800 to-zinc-800/80 rounded-t-xl",
              isDragging && "cursor-grabbing"
            )}
            onMouseDown={handleDragStart}
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
                  onClick={clearLogs}
                  className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
                >
                  <Trash2Icon className="size-4" />
                </Button>
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
            <div className="overflow-y-auto font-mono text-xs leading-relaxed h-full">
              {logs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-zinc-500">
                  暂无日志
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="px-4 py-2 hover:bg-zinc-800/30 transition-colors"
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
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
