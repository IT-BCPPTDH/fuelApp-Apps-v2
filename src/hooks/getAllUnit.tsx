
const BELinkMaster='http://127.0.0.1:9003'

import { ResponseError } from "../helper/responseError";


export async function getAllUnit() {
    const url = `${BELinkMaster }/master/unit`;

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



