
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




