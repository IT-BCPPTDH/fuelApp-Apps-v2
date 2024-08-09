
const LINK_BACKEND = 'http://localhost:3033';


export class ResponseError extends Error {
    public response: Response;
    public errorData?: any;

    constructor(message: string, response: Response, errorData?: any) {
        super(message);
        this.response = response;
        this.errorData = errorData;
        this.name = "ResponseError";
    }
}

interface PostAuthParams {
    date:string;
    station:string;
    jde_operator:string;
}

interface PostOpeningParams {
    date: string; // Use ISO string or adjust as needed
    shift: string;
    hm_start: number;
    site: string;
    fuelman_id: string;
    station: string;
    opening_dip: number;
    opening_sonding: number;
    flow_meter_start: number;
}

export const postOpening = async (params: PostOpeningParams): Promise<any> => {
    const url = `${LINK_BACKEND}/api/operator/post-lkf`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Response Error:', errorData);
            throw new ResponseError('Failed to post opening data', response, errorData);
        }

        // Return parsed JSON result
        return response.json();
    } catch (error) {
        if (error instanceof ResponseError) {
            throw error;
        } else {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error Details:', message);
            throw new ResponseError(`Error during postOpening: ${message}`, new Response());
        }
    }
};


export const postAuth = async (params: PostAuthParams): Promise<any> => {
    const url = `${LINK_BACKEND}/api/login`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Response Error:', errorData);
            throw new ResponseError('Failed to post opening data', response, errorData);
        }

        // Return parsed JSON result
        return response.json();
    } catch (error) {
        if (error instanceof ResponseError) {
            throw error;
        } else {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error Details:', message);
            throw new ResponseError(`Error during postOpening: ${message}`, new Response());
        }
    }
};













