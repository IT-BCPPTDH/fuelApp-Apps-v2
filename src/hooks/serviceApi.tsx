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

interface PostOpeningParams {
    date: string; 
    shift: string;
    hm_start: number;
    site: string;
    jde: string;
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

        // Ensure the response is not empty
        const responseData = await response.text();
        const parsedResponseData = responseData ? JSON.parse(responseData) : {};

        console.log('Server Response Data:', parsedResponseData); // Log the response data

        if (!response.ok) {
            // Handle non-200 status codes
            console.error('Response Error:', parsedResponseData);
            throw new ResponseError('Failed to post opening data', response, parsedResponseData);
        }

        // Save the response data to localStorage if status is 201 and message is "Data Created"
        if (response.status === 201 && parsedResponseData.message === 'Data Created') {
            localStorage.setItem('postedData', JSON.stringify(parsedResponseData));
        }

        return parsedResponseData;
    } catch (error) {
        if (error instanceof ResponseError) {
            throw error;
        } else {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error Details:', message);
            // Provide a default response for the ResponseError
            const defaultResponse = new Response(null, { status: 500, statusText: 'Internal Server Error' });
            throw new ResponseError(`Error during postOpening: ${message}`, defaultResponse);
        }
    }
};
