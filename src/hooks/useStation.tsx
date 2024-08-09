import { ResponseError } from "../helper/responseError";

const BELinkMaster = 'http://localhost:9003';

export async function getStation() {
    const url = `${BELinkMaster}/master/station`;

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
