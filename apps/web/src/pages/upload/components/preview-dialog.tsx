import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { UploadFile } from "@/types";
import { FileTypeEnum } from "@/types/enum";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: UploadFile | null;
}

export function PreviewDialog({
  open,
  onOpenChange,
  file,
}: PreviewDialogProps) {
  if (!file) return null;

  const fileUrl = `${import.meta.env.VITE_APP_BASE_URL}${file.path}`;
  const isImage = file.type === FileTypeEnum.IMAGE;
  const isVideo = file.type === FileTypeEnum.VIDEO;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-8" title={file.filename}>
            {file.filename}
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center">
          {isImage && (
            <img
              src={fileUrl}
              alt={file.filename}
              className="max-h-[70vh] max-w-full rounded-lg object-contain"
            />
          )}
          {isVideo && (
            <video
              src={fileUrl}
              controls
              className="max-h-[70vh] max-w-full rounded-lg"
            >
              您的浏览器不支持视频播放
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
