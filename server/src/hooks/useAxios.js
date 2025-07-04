import { useCallback } from 'react';
import axios from 'axios';

export default function useAxios() {
    const post = useCallback(async (url, data, config) => {
        try {
            return await axios.post(url, data, config);
        } catch (error) {
            if (
                error.response &&
                !url.endsWith('/switchbot/refreshToken')
            ) {
                try {
                    await axios.post(`${process.env.REACT_APP_SERVER_URL}/switchbot/refreshToken`);
                    return await axios.post(url, data, config);
                } catch (refreshError) {
                    throw refreshError;
                }
            }
            throw error;
        }
    }, []);

    return { post };
}