import { cn } from "@/lib/utils";
import { CodeIcon, DownloadIcon, GripVertical } from "lucide-react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

type PropsType = {
  title: string;
  isSelected?: boolean;
  disabled?: boolean;
  scale?: number;
  isDownloading: boolean;
  onOpenHtmlDialog: () => void;
  onDownloadPng?: () => void;
};

const FrameToolbar = ({
  title,
  isSelected,
  disabled,
  scale = 1.7,
  isDownloading,
  onOpenHtmlDialog,
  onDownloadPng,
}: PropsType) => {
  return (
    <div
      className={cn(
        `absolute flex items-center gap-2 rounded-full z-50`,
        isSelected
          ? `left-1/2 -translate-x-1/2 border dark:border-neutral-700 bg-card dark:bg-muted pl-2 pr-4 py-1 shadow-sm min-w-[240px] h-[32px]`
          : "w-[150px] h-auto left-10",
      )}
      style={{
        top: isSelected ? "-70px" : "-38px",
        transformOrigin: "center top",
        transform: `scale(${scale})`,
      }}
    >
      <div
        role="button"
        className="flex items-center justify-start flex-1 cursor-grab gap-1.5 active:cursor-grabbing"
      >
        <GripVertical className="size-4 text-muted-foreground" />
        <div
          className={cn(
            `min-w-20 font-medium text-xs mx-px truncate`,
            isSelected && "w-[100px]",
          )}
        >
          {title}
        </div>
      </div>

      {isSelected && (
        <>
          <Separator orientation="vertical" className="h-5! bg-border dark:bg-neutral-700" />
          <div className="flex items-center gap-px">
            <Button
              disabled={disabled}
              size="icon-xs"
              variant="ghost"
              className="rounded-full dark:hover:bg-white/20 hover:bg-muted cursor-pointer"
              onClick={onOpenHtmlDialog}
            >
              <CodeIcon />
            </Button>
            <Button
              disabled={disabled || isDownloading}
              size="icon-xs"
              variant="ghost"
              className="rounded-full dark:hover:bg-white/20 hover:bg-muted cursor-pointer"
              onClick={onDownloadPng}
            >
              {isDownloading ? <Spinner /> : <DownloadIcon />}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default FrameToolbar;
