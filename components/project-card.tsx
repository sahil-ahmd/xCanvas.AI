import React, { memo } from "react";
import { ProjectType } from "@/types/project";
import { FolderOpenIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export const ProjectCard = memo(({ project }: { project: ProjectType }) => {
  const router = useRouter();
  const createdAt = new Date(project.createdAt);
  const time = formatDistanceToNow(createdAt, { addSuffix: true });
  const thumbnail = project.thumbnail || null;

  const onRoute = () => {
    router.push(`/project/${project.id}`);
  };

  return (
    <div
      role="button"
      onClick={onRoute}
      className="w-full flex flex-col border rounded-xl cursor-pointer hover:shadow-md dark:hover:border-accent-foreground/20 overflow-hidden"
    >
      <div className="h-40 bg-[#eee] relative overflow-hidden flex items-center justify-center">
        {thumbnail ? (
          <img
            src={thumbnail}
            className="w-full h-full object-cover object-left"
          />
        ) : (
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20">
            <FolderOpenIcon />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col">
        <h3 className="font-semibold text-sm truncate w-full mb-1 line-clamp-1">
          {project.name}
        </h3>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
});

ProjectCard.displayName = "ProjectCard";
