import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

export const useQR = () => {
    const queryClient = useQueryClient();

    const qrs = useQuery({
        queryKey: ['qrs'],
        queryFn: async () => {
            const { data } = await client.get('/qr/');
            return data;
        },
    });

    const createQR = useMutation({
        mutationFn: async (qrData) => {
            const { data } = await client.post('/qr/', qrData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['qrs']);
        },
    });

    const updateQR = useMutation({
        mutationFn: async ({ id, ...qrData }) => {
            const { data } = await client.patch(`/qr/${id}`, qrData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['qrs']);
        },
    });

    const deleteQR = useMutation({
        mutationFn: async (id) => {
            await client.delete(`/qr/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['qrs']);
        },
    });

    const uploadImage = useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await client.post('/qr/upload', formData);
            return data;
        },
    });

    return {
        qrs: qrs.data || [],
        isLoading: qrs.isLoading,
        createQR,
        updateQR,
        deleteQR,
        uploadImage
    };
};
