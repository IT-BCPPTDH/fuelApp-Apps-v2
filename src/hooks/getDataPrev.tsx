import { CapacitorHttp } from '@capacitor/core';
import { ResponseError } from "../helper/responseError";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function getPrevUnitTrx(station: string) {
    // Use template literal to include the station variable in the URL
    const url = `${VITE_BACKEND_URL}/api/operator/get-data/${station}`;
    try {
        const response = await CapacitorHttp.get({
            url,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.status !== 200) {
            throw new ResponseError(
                `Failed to fetch Unit data. Status: ${response.status} ${response.data?.statusText || 'Error'}`,
                response,
                response.data
            );
        }
        const data = response.data;
        console.log('Successfully fetched station data:', data);

        return data;
    } catch (error: unknown) {
        if (error instanceof ResponseError) {
            console.error('ResponseError:', error.message, 'Data:', error.data);
            throw error;
        } else if (error instanceof Error) {
            console.error('An unexpected error occurred:', error.message);
            throw new Error('An unexpected error occurred while fetching station data.');
        } else {
            console.error('Unknown error occurred');
            throw new Error('An unknown error occurred while fetching station data.');
        }
    }
}
