const LINK_BACKEND = 'http://localhost:3033';

interface PostAuthParams {
    date: string;
    station: string;
    JDE: string; 
  
  
}

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

export const postAuthLogin = async (params: PostAuthParams): Promise<any> => {
    const url = `${LINK_BACKEND}/api/login`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        // Check if the response is not OK
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Response Error:', {
                status: response.status,
                statusText: response.statusText,
                ...errorData,
            });
            throw new ResponseError('Failed to post auth login data', response, errorData);
        }

        // Return parsed JSON result
        const data = await response.json();
        console.log('API response data:', data);
        return data;
    } catch (error) {
        if (error instanceof ResponseError) {
            throw error;
        } else {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error Details:', message);
            throw new ResponseError(`Error during postAuthLogin: ${message}`, new Response());
        }
    }
};
