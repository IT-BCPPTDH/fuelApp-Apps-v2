const LINK_BACKEND = 'http://localhost:3033';

// Define the shape of the request body
interface PostAuthRequestBody {
    station: string;
    jde_operator: string;
}

// Define the shape of the response from the API
interface PostAuthResponse {
    token: string; // Adjust this based on your actual API response
    // Add other fields if necessary
}

// Define a custom error class for handling API errors
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
export const postAuth = async (requestBody: PostAuthRequestBody): Promise<PostAuthResponse> => {
    const url = `${LINK_BACKEND}/api/login`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Response Error:', errorData);
            throw new ResponseError('Failed to sign in', response, errorData);
        }

        // Assuming the response body is JSON and contains the necessary data
        return response.json();
    } catch (error: unknown) {
        if (error instanceof ResponseError) {
            throw error;
        } else {
            // Wrap other errors in a ResponseError
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error Details:', message);
            throw new ResponseError(`Error during login: ${message}`, new Response());
        }
    }
};
