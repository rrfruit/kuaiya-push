import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PanelState {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DragHandleProps {
  /** 绑定到拖动区域的 onMouseDown 事件 */
  onMouseDown: (e: React.MouseEvent) => void;
  /** 是否正在拖动 */
  isDragging: boolean;
  /** 是否正在调整大小 */
  isResizing: boolean;
}

export interface ResizablePanelProps {
  /** localStorage 存储键名，不传则不持久化 */
  storageKey?: string;
  /** 默认位置和大小 */
  defaultState?: Partial<PanelState>;
  /** 最小宽度 */
  minWidth?: number;
  /** 最小高度 */
  minHeight?: number;
  /** 面板内容（render prop，可接收拖动相关 props） */
  children: ReactNode | ((props: DragHandleProps) => ReactNode);
  /** 容器 className */
  className?: string;
  /** 是否显示 */
  open?: boolean;
  /** 调整大小手柄的高亮颜色 */
  handleColor?: string;
}

type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const DEFAULT_MIN_WIDTH = 200;
const DEFAULT_MIN_HEIGHT = 150;

function getDefaultState(
  defaults?: Partial<PanelState>,
  minWidth = DEFAULT_MIN_WIDTH,
  minHeight = DEFAULT_MIN_HEIGHT
): PanelState {
  return {
    x: defaults?.x ?? 100,
    y: defaults?.y ?? 100,
    width: Math.max(defaults?.width ?? 400, minWidth),
    height: Math.max(defaults?.height ?? 300, minHeight),
  };
}

function loadState(
  storageKey: string | undefined,
  defaults?: Partial<PanelState>,
  minWidth = DEFAULT_MIN_WIDTH,
  minHeight = DEFAULT_MIN_HEIGHT
): PanelState {
  const defaultState = getDefaultState(defaults, minWidth, minHeight);

  if (!storageKey) return defaultState;

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const state = JSON.parse(saved) as PanelState;
      return {
        x: Math.max(0, Math.min(state.x, window.innerWidth - state.width)),
        y: Math.max(0, Math.min(state.y, window.innerHeight - state.height)),
        width: Math.max(minWidth, state.width),
        height: Math.max(minHeight, state.height),
      };
    }
  } catch {
    // 忽略解析错误
  }
  return defaultState;
}

function saveState(storageKey: string | undefined, state: PanelState) {
  if (!storageKey) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // 忽略存储错误
  }
}

export function ResizablePanel({
  storageKey,
  defaultState: defaults,
  minWidth = DEFAULT_MIN_WIDTH,
  minHeight = DEFAULT_MIN_HEIGHT,
  children,
  className,
  open = true,
  handleColor = "violet",
}: ResizablePanelProps) {
  const [panelState, setPanelState] = useState<PanelState>(() =>
    loadState(storageKey, defaults, minWidth, minHeight)
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<ResizeDirection | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialState, setInitialState] = useState<PanelState | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  // 当 defaults 改变时重新计算位置（仅在首次打开时）
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (open && !hasInitialized.current && !storageKey) {
      setPanelState(getDefaultState(defaults, minWidth, minHeight));
      hasInitialized.current = true;
    }
  }, [open, defaults, minWidth, minHeight, storageKey]);

  // 保存状态到 localStorage
  useEffect(() => {
    if (!isDragging && !isResizing) {
      saveState(storageKey, panelState);
    }
  }, [panelState, isDragging, isResizing, storageKey]);

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
        const newX = Math.max(
          0,
          Math.min(initialState.x + deltaX, window.innerWidth - panelState.width)
        );
        const newY = Math.max(
          0,
          Math.min(initialState.y + deltaY, window.innerHeight - panelState.height)
        );
        setPanelState((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (isResizing && resizeDir) {
        let newX = initialState.x;
        let newY = initialState.y;
        let newWidth = initialState.width;
        let newHeight = initialState.height;

        // 处理宽度调整
        if (resizeDir.includes("e")) {
          newWidth = Math.max(minWidth, initialState.width + deltaX);
        }
        if (resizeDir.includes("w")) {
          const maxDeltaX = initialState.width - minWidth;
          const clampedDeltaX = Math.max(-maxDeltaX, Math.min(deltaX, initialState.x));
          newX = initialState.x + clampedDeltaX;
          newWidth = initialState.width - clampedDeltaX;
        }

        // 处理高度调整
        if (resizeDir.includes("s")) {
          newHeight = Math.max(minHeight, initialState.height + deltaY);
        }
        if (resizeDir.includes("n")) {
          const maxDeltaY = initialState.height - minHeight;
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
  }, [
    isDragging,
    isResizing,
    resizeDir,
    dragStart,
    initialState,
    panelState.width,
    panelState.height,
    minWidth,
    minHeight,
  ]);

  if (!open) return null;

  // 调整大小手柄的通用样式
  const handleClass = cn(
    "absolute z-10 transition-colors",
    `hover:bg-${handleColor}-500/30`
  );

  // 渲染内容
  const content =
    typeof children === "function"
      ? children({ onMouseDown: handleDragStart, isDragging, isResizing })
      : children;

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed z-50 flex flex-col",
        (isDragging || isResizing) && "select-none",
        className
      )}
      style={{
        left: panelState.x,
        top: panelState.y,
        width: panelState.width,
        height: panelState.height,
      }}
    >
      {/* 调整大小的手柄 - 四角 */}
      <div
        className={cn(handleClass, "top-0 left-0 w-3 h-3 cursor-nw-resize rounded-tl-xl")}
        onMouseDown={(e) => handleResizeStart(e, "nw")}
      />
      <div
        className={cn(handleClass, "top-0 right-0 w-3 h-3 cursor-ne-resize rounded-tr-xl")}
        onMouseDown={(e) => handleResizeStart(e, "ne")}
      />
      <div
        className={cn(handleClass, "bottom-0 left-0 w-3 h-3 cursor-sw-resize rounded-bl-xl")}
        onMouseDown={(e) => handleResizeStart(e, "sw")}
      />
      <div
        className={cn(handleClass, "bottom-0 right-0 w-3 h-3 cursor-se-resize rounded-br-xl")}
        onMouseDown={(e) => handleResizeStart(e, "se")}
      />

      {/* 调整大小的手柄 - 四边 */}
      <div
        className={cn(handleClass, "top-0 left-3 right-3 h-1 cursor-n-resize")}
        onMouseDown={(e) => handleResizeStart(e, "n")}
      />
      <div
        className={cn(handleClass, "bottom-0 left-3 right-3 h-1 cursor-s-resize")}
        onMouseDown={(e) => handleResizeStart(e, "s")}
      />
      <div
        className={cn(handleClass, "left-0 top-3 bottom-3 w-1 cursor-w-resize")}
        onMouseDown={(e) => handleResizeStart(e, "w")}
      />
      <div
        className={cn(handleClass, "right-0 top-3 bottom-3 w-1 cursor-e-resize")}
        onMouseDown={(e) => handleResizeStart(e, "e")}
      />

      {/* 内容区域 */}
      {content}
    </div>
  );
}

/**
 * 计算默认位置的辅助函数
 */
export function calculateDefaultPosition(options: {
  /** 锚点元素的位置（如按钮的 right/bottom） */
  anchorRight?: number;
  anchorBottom?: number;
  /** 锚点元素的大小 */
  anchorWidth?: number;
  anchorHeight?: number;
  /** 面板大小 */
  panelWidth: number;
  panelHeight: number;
  /** 间距 */
  gap?: number;
}): { x: number; y: number } {
  const {
    anchorRight = 24,
    anchorBottom = 24,
    anchorWidth = 56,
    anchorHeight = 56,
    panelWidth,
    panelHeight,
    gap = 16,
  } = options;

  // 面板在锚点左边，底部对齐
  const x = window.innerWidth - anchorRight - anchorWidth - gap - panelWidth;
  const y = window.innerHeight - anchorBottom - panelHeight;

  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
  };
}
