import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export const useGetProjectById = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await axios.get(`/api/project/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
  });
};

export const useGenerateDesignById = (projectId: string) => {
  return useMutation({
    mutationFn: async (prompt: string) => {
      const res = await axios.post(`/api/project/${projectId}`, { prompt });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Generation Started");
    },
    onError: (error) => {
      console.log("Project failed", error);
      toast.error("Failed to generate screen");
    },
  });
};

export const useUpdateProject = (projectId: string) => {
  return useMutation({
    mutationFn: async (themeId: string) => {
      const res = await axios.patch(`/api/project/${projectId}`, { themeId });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Project Updated");
    },
    onError: (error) => {
      console.log("Project failed", error);
      toast.error("Failed to update project");
    },
  });
};

export const useDeleteProject = () => {
  return useMutation({
    mutationFn: async (projectId: string) => {
      const res = await axios.delete(`/api/project/${projectId}`);
      return res.data;
    },
    onSuccess: () => toast.success("Project deleted"),
    onError: () => toast.error("Failed to delete project"),
  });
};