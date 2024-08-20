import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

// Custom hook to export transactions
export const useExportTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        // Fetch the export data as a blob
        const response = await axios.get('/api/export', { responseType: 'blob' });

        // Create a URL for the blob and initiate download
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'transactions.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Cleanup the URL object after download
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      } catch (error) {
        // Handle Axios errors
        if (axios.isAxiosError(error)) {
          const statusCode = error.response?.status;
          let errorMessage = 'Failed to export transactions.';

          // Customize error messages based on status code
          if (statusCode === 500) {
            errorMessage = 'Server error occurred while exporting transactions.';
          } else if (statusCode === 404) {
            errorMessage = 'The export endpoint was not found.';
          }

          console.error('Export error:', error.message);
          throw new Error(errorMessage);
        } else {
          // Handle unexpected errors
          console.error('Unexpected error during export:', error);
          throw new Error('An unexpected error occurred while exporting transactions.');
        }
      }
    },
    onSuccess: () => {
      // Invalidate transactions query to refresh data
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transactions exported successfully!');  // Use toast for success notification
    },
    onError: (error: AxiosError) => {
      // Show error message using toast
      toast.error((error as Error).message);
    },
  });
};