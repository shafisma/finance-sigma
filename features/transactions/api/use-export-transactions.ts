// features/transactions/api/use-export-transactions.ts

import { useQuery } from "@tanstack/react-query";

export const useExportTransactions = () => {
  return useQuery({
    queryKey: ["exportTransactions"],
    queryFn: async () => {
      const response = await fetch("/api/export");
      if (!response.ok) {
        throw new Error("Failed to export transactions");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString()}.csv`;
      a.click();
    },
    enabled: false,
  });
};
