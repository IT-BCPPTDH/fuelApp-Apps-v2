import { CapacitorHttp } from '@capacitor/core';

const LINK_BACKEND = import.meta.env.VITE_BACKEND_URL;

export async function getQuotaUnit() {
    const url = `${LINK_BACKEND}/quota-usage/get-data`;
    try {
        const response = await CapacitorHttp.get({
            url,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching quota unit:', error);
        throw error; // Re-throw the error for handling in the calling function
    }
}

