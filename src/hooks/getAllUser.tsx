
const BE_USER = 'http://localhost:9001';

import { ResponseError } from "../helper/responseError";


export async function getUser() {
    const url = `${BE_USER }/api-user/get-all`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new ResponseError(`Failed to fetch station data. Status: ${response.status} ${response.statusText}`, response);
        }

        const data = await response.json();

        console.log('Successfully fetched station data:', data);

        return data;
    } catch (error: unknown) {
        if (error instanceof ResponseError) {
            throw error;
        } else if (error instanceof Error) {
           
        } else {
            
        }
    }
}
