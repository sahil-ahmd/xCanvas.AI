"use client";

import { useGetProjectById } from "@/hooks/use-project-id";
import { useParams } from "next/navigation";

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
    <div>Page</div>
  )
}

export default Page