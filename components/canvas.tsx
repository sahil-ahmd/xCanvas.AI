import { useCallback, useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { LoadingStatusType, useCanvas } from "@/context/canvas-provider";
import CanvasLoader from "./canvas-loader";
import { cn } from "@/lib/utils";
import CanvasFloatingToolbar from "./canvas-floating-toolbar";
import { TOOL_MODE_ENUM, ToolModeType } from "@/constant/canvas";
import CanvasControls from "./canvas-controls";
import DeviceFrame from "./device-frame";
import DeviceFrameSkeleton from "./frame-skeleton";
import HtmlDialog from "./html-dialog";
import { toast } from "sonner";
import axios from "axios";

const DEMO_HTML = `
<div style="font-family: sans-serif; padding: 24px; display: flex; flex-direction: column; gap: 16px;">
  <!-- Header -->
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--primary); border-radius: 12px; color: white;">
    <h1 style="margin: 0; font-size: 20px; font-weight: 700;">My App</h1>
    <div style="width: 36px; height: 36px; border-radius: 50%; background: white; opacity: 0.3;"></div>
  </div>

  <!-- Card -->
  <div style="padding: 20px; background: var(--card); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <p style="margin: 0 0 8px; font-size: 13px; color: var(--muted-foreground);">Total Balance</p>
    <h2 style="margin: 0; font-size: 32px; font-weight: 700; color: var(--primary);">$12,430.00</h2>
  </div>

  <!-- Action Buttons -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
    <button style="padding: 12px; background: var(--primary); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;">Send</button>
    <button style="padding: 12px; background: var(--secondary); color: var(--secondary-foreground); border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;">Receive</button>
  </div>

  <!-- List -->
  <div style="display: flex; flex-direction: column; gap: 10px;">
    <p style="margin: 0; font-size: 13px; font-weight: 600; color: var(--muted-foreground);">Recent Transactions</p>
    ${[
      { label: "Netflix", amount: "-$14.99", icon: "🎬" },
      { label: "Spotify", amount: "-$9.99", icon: "🎵" },
      { label: "Salary", amount: "+$3,200.00", icon: "💼" },
      { label: "Amazon", amount: "-$42.50", icon: "📦" },
    ]
      .map(
        ({ label, amount, icon }) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px; background: var(--card); border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 20px;">${icon}</span>
          <span style="font-size: 14px; font-weight: 500;">${label}</span>
        </div>
        <span style="font-size: 14px; font-weight: 600; color: ${amount.startsWith("+") ? "green" : "var(--foreground)"};">${amount}</span>
      </div>
    `,
      )
      .join("")}
  </div>

  <!-- Bottom Nav -->
  <div style="display: flex; justify-content: space-around; padding: 14px; background: var(--card); border-radius: 12px; margin-top: 8px;">
    ${["🏠", "📊", "💳", "👤"]
      .map(
        (icon) => `
      <span style="font-size: 22px; cursor: pointer;">${icon}</span>
    `,
      )
      .join("")}
  </div>
</div>
`;

interface CanvasProps {
  projectId: string;
  projectName: string | null;
  isPending: boolean;
}

const Canvas = ({ projectId, projectName, isPending }: CanvasProps) => {
  const { theme, frames, selectedFrame, setSelectedFrameId, loadingStatus } =
    useCanvas();
  const [toolMode, setToolMode] = useState<ToolModeType>(TOOL_MODE_ENUM.SELECT);
  const [zoomPercent, setZoomPercent] = useState<number>(53);
  const [currentScale, setCurrentScale] = useState<number>(0.53);
  const [openHtmlDialog, setOpenHtmlDialog] = useState<boolean>(false);
  const [isScreenShotting, setIsScreenShotting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canvasRootRef = useRef<HTMLDivElement>(null);

  const onOpenHtmlDialog = () => {
    setOpenHtmlDialog(true);
  };

  const saveThumbnailToProject = useCallback(
    async (projectId: string | null) => {
      try {
        if (!projectId) return null;

        const result = getCanvasHtmlContent();
        if (!result?.html) return null;
        setSelectedFrameId(null);
        setIsSaving(true);

        const response = await axios.post("/api/screenshot", {
          html: result.html,
          width: result.element.scrollWidth,
          height: 700,
          projectId,
        });
        if (response) {
          console.log("Thumbnail saved", response.data);
        }
        toast.success("Thumbnail Saved!");
      } catch (error) {
        console.log(error);
        toast.error("Failed to Screenshot the Canvas");
      } finally {
        setIsSaving(false);
      }
    },
    [setSelectedFrameId],
  );

  useEffect(() => {
    if (!projectId) return;
    if (loadingStatus !== "completed") return;
    saveThumbnailToProject(projectId);
  }, [loadingStatus, projectId, saveThumbnailToProject]);

  const handleScreenShot = useCallback(async () => {
    try {
      const result = getCanvasHtmlContent();
      if (!result?.html) {
        toast.error("Failed to get canvas content");
        return null;
      }
      setSelectedFrameId(null);
      setIsScreenShotting(true);

      const response = await axios.post(
        "/api/screenshot",
        {
          html: result.html,
          width: result.element.scrollWidth,
          height: 700,
        },
        {
          responseType: "blob",
          validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
        },
      );

      const title = projectName || "Canvas";
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Screenshot downloaded");
    } catch (error) {
      console.log(error);
      toast.error("Failed to Screenshot the Canvas");
    } finally {
      setIsScreenShotting(false);
    }
  }, [projectName, setSelectedFrameId]);

  function getCanvasHtmlContent() {
    const el = canvasRootRef.current;
    if (!el) {
      toast.error("Canvas element not found");
      return null;
    }
    let styles = "";
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) styles += rule.cssText;
      } catch (error) {}
    }

    return {
      element: el,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              margin: 0
            }
            * {
              box-sizing: border-box
            }
            ${styles}
          </style>
        </head>
        <body>${el.outerHTML}</body>
        </html>
      `,
    };
  }

  const currentStatus = isSaving
    ? "finalizing"
    : isPending
    ? "fetching"
    : loadingStatus !== "idle" && loadingStatus !== "completed"
    ? loadingStatus
    : null;

  return (
    <>
      <div className="relative w-full h-full overflow-hidden">
        <CanvasFloatingToolbar
          projectId={projectId}
          isScreenShotting={isScreenShotting}
          onScreenShot={handleScreenShot}
        />

        {currentStatus && <CanvasLoader status={currentStatus} />}

        <TransformWrapper
          initialScale={0.53}
          initialPositionX={40}
          initialPositionY={5}
          minScale={0.1}
          maxScale={3}
          wheel={{ step: 0.1 }}
          pinch={{ step: 0.1 }}
          doubleClick={{ disabled: true }}
          centerZoomedOut={false}
          centerOnInit={false}
          smooth={true}
          limitToBounds={false}
          panning={{
            disabled: toolMode !== TOOL_MODE_ENUM.HAND,
          }}
          onTransformed={(ref) => {
            setZoomPercent(Math.round(ref.state.scale * 100));
            setCurrentScale(ref.state.scale);
          }}
        >
          {({ zoomIn, zoomOut }) => (
            <>
              <div
                ref={canvasRootRef}
                className={cn(
                  `absolute inset-0 w-full h-full bg-[#eee] dark:bg-[#242423] p-3`,
                  toolMode === TOOL_MODE_ENUM.HAND
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-default",
                )}
                style={{
                  backgroundImage:
                    "radial-gradient(circle, color-mix(in srgb, var(--primary) 30%, transparent) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              >
                <TransformComponent
                  wrapperStyle={{
                    width: "100%",
                    height: "100%",
                    overflow: "unset",
                  }}
                  contentStyle={{
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <div>
                    {frames?.map((frame, index: number) => {
                      const baseX = 100 + index * 480;
                      const y = 100;

                      if (frame.isLoading) {
                        return (
                          <DeviceFrameSkeleton
                            key={index}
                            style={{
                              transform: `translate(${baseX}px, 100px)`,
                            }}
                          />
                        );
                      }

                      return (
                        <DeviceFrame
                          key={frame.id}
                          frameId={frame.id}
                          title={frame.title}
                          html={frame.htmlContent}
                          isLoading={frame.isLoading}
                          scale={currentScale}
                          initialPosition={{
                            x: baseX,
                            y,
                          }}
                          toolMode={toolMode}
                          theme_style={theme?.style}
                          onOpenHtmlDialog={onOpenHtmlDialog}
                        />
                      );
                    })}
                  </div>
                  {/** This is only for demo purpose */}
                  {/* <DeviceFrame
                    frameId="demo"
                    title="Demo Screen"
                    html={DEMO_HTML}
                    scale={currentScale}
                    initialPosition={{ x: 1000, y: 100 }}
                    toolMode={toolMode}
                    theme_style={theme?.style}
                    onOpenHtmlDialog={onOpenHtmlDialog}
                  /> */}
                </TransformComponent>
              </div>
              <CanvasControls
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                zoomPercent={zoomPercent}
                toolMode={toolMode}
                setToolMode={setToolMode}
              />
            </>
          )}
        </TransformWrapper>
      </div>

      <HtmlDialog
        html={selectedFrame?.htmlContent || DEMO_HTML}
        theme_style={theme?.style}
        open={openHtmlDialog}
        onOpenChange={setOpenHtmlDialog}
      />
    </>
  );
};

export default Canvas;
