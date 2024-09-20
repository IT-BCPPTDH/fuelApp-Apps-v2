import { CapacitorHttp } from '@capacitor/core';
import { ResponseError } from '../helper/responseError';

const BELinkMaster = import.meta.env.VITE_BELINK_MASTER_URL ;

export async function getAllUnit() {
    const url = `${BELinkMaster}/master/unit`;

    try {
        const response = await CapacitorHttp.get({
            url,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new ResponseError(`Failed to fetch unit data. Status: ${response.status} ${response.data?.statusText || 'Error'}`, response);
        }

        console.log('Successfully fetched unit data:', response.data);

        return response.data;
    } catch (error: unknown) {
        if (error instanceof ResponseError) {
            throw error;
        } else if (error instanceof Error) {
            console.error('An unexpected error occurred:', error.message);
            throw new ResponseError(`Unexpected error occurred: ${error.message}`, null);
        } else {
            console.error('An unknown error occurred');
            throw new ResponseError('An unknown error occurred while fetching unit data', null);
        }
    }
}



// import { CapacitorHttp } from '@capacitor/core';

// export async function getAllUnitCapacitor() {
//     const url = `${BELinkMaster}/master/unit`;

//     try {
//         const response = await CapacitorHttp.get({ url });

//         if (response.status !== 200) {
//            console.log('data', response)
//         }

//         const data = response.data; 

//         console.log('Successfully fetched station data:', data);

//         return data;
//     } catch (error: unknown) {
//         if (error instanceof ResponseError) {
//             throw error;
//         } else if (error instanceof Error) {
//             console.error('An error occurred:', error.message);
//             throw new Error(`Error fetching units: ${error.message}`);
//         } else {
//             console.error('An unexpected error occurred:', error);
//             throw new Error('An unexpected error occurred while fetching units');
//         }
//     }
// }



