import { CapacitorHttp } from '@capacitor/core';

const BE_USER = import.meta.env.VITE_BE_USER_URL || 'http://127.0.0.1:9001';

export interface User {
    division: string;
    position: string;
    fullname: string;
    jde: string;
    accessToken: string;
    // other user fields if needed
}

export class ResponseError extends Error {
    public response: any;

    constructor(message: string, response: any) {
        super(message);
        this.response = response;
        this.name = 'ResponseError';
    }
}

export async function getUser(user: User): Promise<User | null> {
    const url = `${BE_USER}/api-user/auth`;
    if (!user) return null;

    try {
        const response = await CapacitorHttp.get({
            url,
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new ResponseError('Failed on get user request', response);
        }

        return response.data;
    } catch (error: unknown) {
        if (error instanceof ResponseError) {
            throw error;
        } else if (error instanceof Error) {
            console.error('An unexpected error occurred:', error.message);
            throw new ResponseError(`Unexpected error occurred: ${error.message}`, null);
        } else {
            console.error('An unknown error occurred');
            throw new ResponseError('An unknown error occurred while fetching user data', null);
        }
    }
}
