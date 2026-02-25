import { useCanvas } from "@/context/canvas-provider";
import CanvasLoader from "./canvas-loader";
import { cn } from "@/lib/utils";
import CanvasFloatingToolbar from "./canvas-floating-toolbar";

interface CanvasProps {
  projectId: string;
  projectName: string | null;
  isPending: boolean;
}

const Canvas = ({ projectId, projectName, isPending }: CanvasProps) => {
  const { theme, frames, selectedFrame, setSelectedFrameId, loadingStatus } =
    useCanvas();
  const currentStatus = isPending
    ? "fetching"
    : loadingStatus !== "idle" && loadingStatus !== "completed"
      ? loadingStatus
      : null;

  return (
    <>
      <div className="relative w-full h-full overflow-hidden">
        <CanvasFloatingToolbar />

        {currentStatus && <CanvasLoader status={currentStatus} />}
        <div
          className={cn(
            `absolute inset-0 w-full h-full bg-[#eee] dark:bg-[#242423] p-3`,
          )}
          style={{
            backgroundImage:
              "radical-gradient(circle, var(--primary)) 1px, transparent 1px",
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>
    </>
  );
};

export default Canvas;
