"use client";

import { useGetProjectById } from "@/hooks/use-project-id";
import { useParams } from "next/navigation";
import Header from "./_common/Header";
import Canvas from "@/components/canvas";
import { CanvasProvider } from "@/context/canvas-provider";

function Page() {
  const params = useParams();
  const id = params.id as string;

  const { data: project, isPending } = useGetProjectById(id);
  const frames = project?.frames || [];
  const themeId = project?.theme || "";
  const hasInitialData = frames.length > 0;

  if (!isPending && !project) {
    return (
      <div></div>
    )
  }
  return (
    <div className="relative h-screen w-full flex flex-col">
      <Header projectName={project?.name} />
      
      <CanvasProvider
        initialFrames={frames}
        initialThemeId={themeId}
        hasInitialData={hasInitialData}
        projectId={project?.id}
      >
        <div className="flex w-fit overflow-hidden">
        <div className="relative">
          <Canvas
            projectId={project?.id}
            projectName={project?.name}
            isPending={isPending}
          />
        </div>
      </div>
      </CanvasProvider>
    </div>
  )
}

export default Page