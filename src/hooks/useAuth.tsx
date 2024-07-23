
import { ResponseError } from "../helper/responseError";


export const postAuth = async ({email, password} : any) => {
    try {
        const response = await fetch('/api/v1/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new ResponseError('Failed on sign in request', response);
        }

        return response.json();
    } catch (error:any) {
        throw new ResponseError(`Error during login:`, error);
    }
}
