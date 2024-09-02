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

interface UpdateData {
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
    hm_end: number;
    closing_dip: number;
    flow_meter_end: number;
    note: string;  // Update type here
    signature: string;
    lkf_id: string;
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

        const responseData = await response.text();
        const parsedResponseData = responseData ? JSON.parse(responseData) : {};

        console.log('Server Response Data:', parsedResponseData);

        if (!response.ok) {
            console.error('Response Error:', parsedResponseData);
            throw new ResponseError('Failed to post opening data', response, parsedResponseData);
        }

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
            const defaultResponse = new Response(null, { status: 500, statusText: 'Internal Server Error' });
            throw new ResponseError(`Error during postOpening: ${message}`, defaultResponse);
        }
    }
};

export const updateData = async (params: UpdateData): Promise<any> => {
    const url = `${LINK_BACKEND}/api/operator/close-lkf`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        const responseData = await response.text();
        const parsedResponseData = responseData ? JSON.parse(responseData) : {};

        console.log('Server Response Data:', parsedResponseData);

        if (!response.ok) {
            console.error('Response Error:', {
                status: response.status,
                statusText: response.statusText,
                data: parsedResponseData
            });
            throw new ResponseError('Failed to update data', response, parsedResponseData);
        }

        return parsedResponseData;
    } catch (error) {
        if (error instanceof ResponseError) {
            console.error('ResponseError Details:', {
                message: error.message,
                status: error.response.status,
                statusText: error.response.statusText,
                responseData: error.errorData
            });
            throw error;
        } else {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('General Error Details:', {
                message: message,
               
            });
            const defaultResponse = new Response(null, { status: 500, statusText: 'Internal Server Error' });
            throw new ResponseError(`Error during updateData: ${message}`, defaultResponse);
        }
    }
};
