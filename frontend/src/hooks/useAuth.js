import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

export const useAuth = () => {
    const queryClient = useQueryClient();

    const login = useMutation({
        mutationFn: async ({ username, password }) => {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            const { data } = await client.post('/token', formData);
            return data;
        },
        onSuccess: (data) => {
            localStorage.setItem('accessToken', data.accessToken);
            queryClient.invalidateQueries(['user']);
        },
    });

    const logout = useMutation({
        mutationFn: async () => {
            await client.post('/logout');
            localStorage.removeItem('accessToken');
        },
        onSuccess: () => {
            queryClient.setQueryData(['user'], null);
        },
    });

    const user = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const { data } = await client.get('/users/me');
                return data;
            } catch (error) {
                return null;
            }
        },
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    const updateProfile = useMutation({
        mutationFn: async (profileData) => {
            const { data } = await client.put('/users/me', profileData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['user']);
        },
    });

    const updatePassword = useMutation({
        mutationFn: async (passwordData) => {
            await client.put('/users/me/password', passwordData);
        },
    });

    return {
        user: user.data,
        isAuthenticated: !!user.data,
        isLoading: user.isLoading,
        login,
        logout,
        updateProfile,
        updatePassword
    };
};
