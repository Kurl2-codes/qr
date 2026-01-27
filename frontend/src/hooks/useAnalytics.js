import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

export const useAnalytics = () => {
    return useQuery({
        queryKey: ['analytics', 'overview'],
        queryFn: async () => {
            const { data } = await client.get('/analytics/overview');
            return data;
        },
        refetchInterval: 30000, // Auto refresh every 30s
    });
};
