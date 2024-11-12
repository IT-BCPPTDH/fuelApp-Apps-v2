import { CapacitorHttp } from '@capacitor/core';
import { ResponseError } from "../helper/responseError";

const BE_USER = import.meta.env.VITE_BE_USER_URL;

export async function getOperator() {
    // const url = `${BE_USER}/master/operator`;
    const url = `${BE_USER}/api-user/get-user-fuel`;

    try {
        const response = await CapacitorHttp.get({
            url,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new ResponseError(`Failed to fetch operator data. Status: ${response.status} ${response.data?.statusText || 'Error'}`, response);
        }

        const data = response.data;

        // console.log('Successfully fetched operator data:', data);

        return data;
    } catch (error: unknown) {
        if (error instanceof ResponseError) {
            throw error;
        } else if (error instanceof Error) {
            console.error('An unexpected error occurred:', error.message);
            throw new Error('An unexpected error occurred while fetching operator data.');
        } else {
            console.error('Unknown error occurred');
            throw new Error('An unknown error occurred while fetching operator data.');
        }
    }
}
