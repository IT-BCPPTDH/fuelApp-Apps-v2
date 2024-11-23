import { CapacitorHttp } from '@capacitor/core';

const LINK_BACKEND = import.meta.env.VITE_BACKEND_URL;

export class ResponseError extends Error {
    public response: any;
    public errorData?: any;

    constructor(message: string, response: any, errorData?: any) {
        super(message);
        this.response = response;
        this.errorData = errorData;
        this.name = "ResponseError";
    }
}

interface PostAuthParams {
    station: string;
    jde_operator: string;
}

// Post login request
export const postAuth = async ({ station, jde_operator }: PostAuthParams) => {
    const url = `${LINK_BACKEND}/api/login`;

    try {
        const response = await CapacitorHttp.post({
            url,
            headers: {
                'Content-Type': 'application/json',
            },
            data: { station, jde_operator },
        });

        if (response.status !== 200) {
            console.error('Response Error:', response.data);
            throw new ResponseError('Failed to sign in', response, response.data);
        }

        return response.data;
    } catch (error: unknown) {
        if (error instanceof ResponseError) {
            throw error;
        } else {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error Details:', message);
            throw new ResponseError(`Error during login: ${message}`, { status: 500, statusText: 'Internal Server Error' });
        }
    }
};

// // Post opening request
// export const postOpening = async ({ station, jde_operator }: PostAuthParams) => {
//     const url = `${LINK_BACKEND}/api/operator/post-lkf`;

//     try {
//         const response = await CapacitorHttp.post({
//             url,
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             data: { station, jde_operator },
//         });

//         if (response.status !== 200) {
//             console.error('Response Error:', response.data);
//             throw new ResponseError('Failed to post opening data', response, response.data);
//         }

//         return response.data;
//     } catch (error: unknown) {
//         if (error instanceof ResponseError) {
//             throw error;
//         } else {
//             const message = error instanceof Error ? error.message : 'Unknown error occurred';
//             console.error('Error Details:', message);
//             throw new ResponseError(`Error during post opening: ${message}`, { status: 500, statusText: 'Internal Server Error' });
//         }
//     }
// };

// Get last LKF data by station
export async function getDataLastLkfByStation(station: string): Promise<any> {
    const url = `${LINK_BACKEND}/api/operator/last-lkf/station}`;

    try {
        const response = await CapacitorHttp.get({
            url,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new ResponseError(`Failed to fetch station data. Status: ${response.status} ${response.data?.statusText || 'Error'}`, response);
        }

        const data = response.data;

        // Ensure data is an object with a data field that's an array
        if (data && data.data && Array.isArray(data.data)) {
            return data; // Return the full response object
        } else {
            console.error('Unexpected data format from API:', data);
            return { data: [] }; // Return a default structure
        }
    } catch (error: unknown) {
        if (error instanceof ResponseError) {
            console.error('ResponseError:', error.message);
        } else if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.error('Unknown error:', error);
        }
        return { data: [] }; // Return a default structure
    }
}
