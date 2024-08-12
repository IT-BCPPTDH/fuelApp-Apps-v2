const LINK_BACKEND = 'http://localhost:3033';



interface PostAuthParams {
    date: string;
    station: string;
    jde: string;
    site: string;
    fullname?: string;  
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

// Define the function for making the POST request
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

        if (!response.ok) {
            const errorData = await response.json(); // Parse the error response
            console.error('Response Error:', errorData);
            throw new ResponseError('Failed to post auth login data', response, errorData);
        }

        // Return parsed JSON result
        return await response.json(); 
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
