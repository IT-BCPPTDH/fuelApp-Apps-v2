
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
    
}
export const postAuth = async ({ station, jde_operator }: { station: string; jde_operator: string }) => {
    const url = `${LINK_BACKEND}/api/login`; 

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ station, jde_operator }),
        });

        
        if (!response.ok) {
            
            const errorData = await response.json();
            console.error('Response Error:', errorData);
            throw new ResponseError('Failed to sign in', response, errorData);
        }

      
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


export const postOpening = async ({ station, jde_operator }: { station: string; jde_operator: string }) => {
    const url = `${LINK_BACKEND}/api/operator/post-lkf`; 

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ station, jde_operator }),
        });

        
        if (!response.ok) {
            
            const errorData = await response.json();
            console.error('Response Error:', errorData);
            throw new ResponseError('Failed to sign in', response, errorData);
        }

      
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



export async function getDataLastLkfByStation(station: string): Promise<any> {
    const url = `${LINK_BACKEND}/api/operator/last-lkf/station}`;

    try {
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            throw new ResponseError(`Failed to fetch station data. Status: ${response.status} ${response.statusText}`, response);
        }

        const data = await response.json();

        // Ensure data is an object with a data field that's an array
        if (data && data.data && Array.isArray(data.data)) {
            return data; // Return the full response object
        } else {
            console.error('Unexpected data format from API:', data);
            return { data: [] }; // Return a default structure
        }
    } catch (error: unknown) {
        if (error instanceof ResponseError) {
            console.error('ResponseError:', error.message);
        } else if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.error('Unknown error:', error);
        }
        return { data: [] }; // Return a default structure
    }
}

