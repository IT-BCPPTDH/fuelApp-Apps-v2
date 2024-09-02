
const BELinkMaster='http://127.0.0.1:9003'

import { ResponseError } from "../helper/responseError";


export async function getAllSonding() {
    const url = `${BELinkMaster }/master/sonding-master`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new ResponseError(`Failed to fetch  data. Status: ${response.status} ${response.statusText}`, response);
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
