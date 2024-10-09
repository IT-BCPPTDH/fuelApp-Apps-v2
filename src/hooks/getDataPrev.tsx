import { CapacitorHttp } from '@capacitor/core';
import { ResponseError } from "../helper/responseError";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function getPrevUnitTrx(no_unit: string) {
    // Use template literal to correctly include the no_unit in the URL
    const url = `${VITE_BACKEND_URL}/api/operator/get-data/${no_unit}`;
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
        console.log('Successfully fetched unit data:', data);

        return data;
    } catch (error: unknown) {
        if (error instanceof ResponseError) {
            console.error('ResponseError:', error.message, 'Data:', error.data);
            throw error;
        } else if (error instanceof Error) {
            console.error('An unexpected error occurred:', error.message);
            throw new Error('An unexpected error occurred while fetching unit data.');
        } else {
            console.error('Unknown error occurred');
            throw new Error('An unknown error occurred while fetching unit data.');
        }
    }
}
