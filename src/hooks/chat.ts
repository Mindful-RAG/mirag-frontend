import { API_URL } from "@/lib/constants";
import type { Health, Query } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useHealth = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: () =>
      fetch(`${API_URL}/health`)
        .then((res) => res.json())
        .then((data) => data as Health),
    initialData: {
      status: "initializing",
      message: "System is initializing components",
    },
  });
};

export const useChat = () => {
  return useMutation({
    mutationFn: async (input: { query: string }) => {
      const response = await fetch(`${API_URL}/chat/mirag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error("Failed to query API");
      }
      return (await response.json()) as Query;
    },
  });
};
