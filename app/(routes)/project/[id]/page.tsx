"use client";

import { useGetProjectById } from "@/hooks/use-project-id";
import { useParams } from "next/navigation";
import Header from "./_common/Header";
import Canvas from "@/components/canvas";

function Page() {
  const params = useParams();
  const id = params.id as string;

  const { data: project, isPending } = useGetProjectById(id);
  const frames = project?.frames || [];
  const theme = project?.theme || "";

  if (!isPending && !project) {
    return (
      <div></div>
    )
  }
  return (
    <div className="relative h-screen w-full flex flex-col">
      <Header projectName={project?.name} />
      <div className="flex w-fit overflow-hidden">
        <div className="relative">
          <Canvas />
        </div>
      </div>
    </div>
  )
}

export default Page