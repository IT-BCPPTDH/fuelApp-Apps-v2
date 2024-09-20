import { CapacitorHttp } from '@capacitor/core';
import { ResponseError } from "../helper/responseError";

const BELinkMaster = import.meta.env.VITE_BELINK_MASTER_URL;

export async function getStationData(station: string) {
    const url = `${BELinkMaster}/api/operator/last-lkf/${station}`; // Corrected URL with station parameter

    try {
        const response = await CapacitorHttp.get({
            url,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new ResponseError(
                `Failed to fetch station data. Status: ${response.status} ${response.data?.statusText || 'Error'}`,
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
