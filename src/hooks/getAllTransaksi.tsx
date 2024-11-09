import { CapacitorHttp } from '@capacitor/core';
import { ResponseError } from "../helper/responseError";

const BELinkMaster = import.meta.env.VITE_BACKEND_URL;

export async function getTrasaksiSemua() {
    // Get the current date in YYYY-MM-DD format
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];

    // Construct the URL with the current date
    const url = `${BELinkMaster}/api/operator/get-data-prev/${currentDate}`;

    try {
        const response = await CapacitorHttp.get({
            url,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new ResponseError(`Failed to fetch data. Status: ${response.status} ${response.data?.statusText || 'Error'}`, response);
        }

        const data = response.data;

        console.log('Successfully fetched transaksi data:', data);

        return data;
    } catch (error: unknown) {
        if (error instanceof ResponseError) {
            throw error;
        } else if (error instanceof Error) {
            console.error('An unexpected error occurred:', error.message);
            throw new Error('An unexpected error occurred while fetching quota data.');
        } else {
            console.error('Unknown error occurred');
            throw new Error('An unknown error occurred while fetching quota data.');
        }
    }
}






