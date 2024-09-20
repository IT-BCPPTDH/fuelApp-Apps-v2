import { ResponseError } from "../helper/responseError";

const BELinkMaster = 'http://localhost:3303';

export async function getStationData(station: string) {
    const url = `${BELinkMaster}/api/operator/last-lkf/:station`;

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
