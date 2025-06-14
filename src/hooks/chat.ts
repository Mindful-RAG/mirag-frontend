import { API_URL } from "@/lib/constants";
import type { Health } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useHealth = (): { data: Health } => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["health"],
    queryFn: async (): Promise<Health> => {
      const response = await fetch(`${API_URL}/health`);
      if (!response.ok) {
        throw new Error("Failed to query API");
      }
      return response.json();
    },
    initialData: () => {
      const state = queryClient.getQueryState(["health"]);

      if (state && Date.now() - state.dataUpdatedAt <= 1000) {
        return state.data;
      }

      return {
        status: "error",
        message: "Cannot get to server",
      };
    },
    refetchInterval: 10 * 1000,
  });
};

export const useMiRAGChat = () => {
  return useMutation({
    mutationFn: async ({
      query,
      session_id,
    }: {
      query: string;
      session_id: string;
    }) => {
      const response = await fetch(`${API_URL}/chat/mirag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, session_id }),
        credentials: "include", // Important for auth cookies
      });
      if (!response.ok) {
        throw new Error("Failed to query API");
      }
      return response;
    },
  });
};

export const useLongRAGChat = () => {
  return useMutation({
    mutationFn: async ({
      query,
      session_id,
    }: {
      query: string;
      session_id: string;
    }) => {
      const response = await fetch(`${API_URL}/chat/longrag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          session_id,
        }),
        credentials: "include", // Important for auth cookies
      });

      if (!response.ok) {
        throw new Error("Failed to query API");
      }

      return response;
    },
  });
};

export const useUploadPDF = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/chat/upload`, {
        method: "POST",
        body: formData,
        credentials: "include", // Important for auth cookies
      });

      if (!response.ok) {
        throw new Error("Failed to upload PDF");
      }

      return response.json();
    },
  });
};
