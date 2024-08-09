import { useQuery, QueryClient } from "@tanstack/react-query"; 
import { QUERY_KEY } from "../helper/queryKeys";
import { ResponseError } from "../helper/responseError";
import * as userLocalStorage from '../data/user.storage';

export interface User {
    accessToken: string;
    user: {
        id: number;
        station: string;
        jde_operator: string;
    };
}

export async function getUser(user: User): Promise<User | null> {
    if (!user) return null;
    const response = await fetch(`/api-user/get-all${user.user.id}`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    });
    if (!response.ok) {
        throw new ResponseError('Failed on get user request', response);
    }

    return await response.json();
}


