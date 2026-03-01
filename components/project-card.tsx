import React, { memo } from "react";
import { ProjectType } from "@/types/project";
import { FolderOpenIcon, MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteProject } from "@/hooks/use-project-id";

export const ProjectCard = memo(({ project }: { project: ProjectType }) => {
  const router = useRouter();
  const createdAt = new Date(project.createdAt);
  const time = formatDistanceToNow(createdAt, { addSuffix: true });
  const thumbnail = project.thumbnail || null;
  const { mutate: deleteProject, isPending } = useDeleteProject();

  const onRoute = () => {
    router.push(`/project/${project.id}`);
  };

  return (
    <div className="w-full flex flex-col border rounded-xl cursor-pointer hover:shadow-md dark:hover:border-accent-foreground/20 overflow-hidden relative">
      {/* 3-dot menu */}
      <div
        className="absolute top-2 right-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-md bg-black/10 hover:bg-black/40 text-white">
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{project.name}</strong> and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => deleteProject(project.id)}
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Card content */}
      <div
        role="button"
        onClick={onRoute}
        className="w-full flex flex-col"
      >
        <div className="h-40 bg-[#eee] relative overflow-hidden flex items-center justify-center">
          {thumbnail ? (
            <img src={thumbnail} className="w-full h-full object-cover object-left" />
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
    </div>
  );
});

ProjectCard.displayName = "ProjectCard";