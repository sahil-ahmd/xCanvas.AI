import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useCreateProject = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (prompt: string) => {
      const res = await axios.post("/api/project", { prompt });
      return res.data;
    },
    onSuccess: (data) => {
      router.push(`/project/${data.data.id}`);
    },
    onError: (error) => {
      console.log("Project failed", error);
      toast.error("Failed to create project");
    },
  });
};
