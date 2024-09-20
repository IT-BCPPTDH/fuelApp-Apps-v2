import { CapacitorHttp } from '@capacitor/core';
import { ResponseError } from "../helper/responseError";

const BE_USER = import.meta.env.VITE_BE_USER_URL;

export async function getUser() {
    const url = `${BE_USER}/api-user/get-all`;

    try {
        const response = await CapacitorHttp.get({
            url,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new ResponseError(`Failed to fetch user data. Status: ${response.status} ${response.data?.statusText || 'Error'}`, response);
        }

        const data = response.data;

        console.log('Successfully fetched user data:', data);

        return data;
    } catch (error: unknown) {
        if (error instanceof ResponseError) {
            throw error;
        } else if (error instanceof Error) {
            console.error('An unexpected error occurred:', error.message);
            throw new Error('An unexpected error occurred while fetching user data.');
        } else {
            console.error('Unknown error occurred');
            throw new Error('An unknown error occurred while fetching user data.');
        }
    }
}
