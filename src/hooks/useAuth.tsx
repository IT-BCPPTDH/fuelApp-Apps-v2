import { CapacitorHttp } from '@capacitor/core';
const LINK_BACKEND = import.meta.env.VITE_BACKEND_URL;
import { saveDataToStorage } from '../services/dataService';
interface PostAuthParams {
    date: string;
    station: string;
    JDE: string; 
    // userId: string;
    // session_token: string;
    // logId: string;
}

interface PostLogoutParams {
    logout_time: string;
    station: string;
    JDE: string;
    userId: string;
    isLoggin: string;
    logId: string;
    isLogging: string;
}

export class ResponseError extends Error {
    public response: any;
    public errorData?: any;

    constructor(message: string, response: any, errorData?: any) {
        super(message);
        this.response = response;
        this.errorData = errorData;
        this.name = "ResponseError";
    }
}

// export const postAuthLogin = async (params: PostAuthParams): Promise<any> => {
//     console.log(LINK_BACKEND)
//     const url = `${LINK_BACKEND}/api/login`;

//     try {
//         const response = await CapacitorHttp.post({
//             url,
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             data: params,
//         });

//         // Check if the response status is not 200 (OK)
//         if (response.status !== 200) {
//             console.error('Response Error:', {
//                 status: response.status,
//                 statusText: response.data?.statusText || 'Error',
//                 ...response.data,
//             });
//             throw new ResponseError('Failed to post auth login data', response, response.data);
//         }

//         // Return parsed JSON result
//         console.log('API response data:', response.data);
//         return response.data;
//     } catch (error) {
//         if (error instanceof ResponseError) {
//             throw error;
//         } else {
//             const message = error instanceof Error ? error.message : 'Unknown error occurred';
//             console.error('Error Details:', message);
//             throw new ResponseError(`Error during postAuthLogin: ${message}`, null);
//         }
//     }
// };


export const postAuthLogin = async (params: PostAuthParams): Promise<any> => {
    const url = `${LINK_BACKEND}/api/login`;
  
    try {
      const response = await CapacitorHttp.post({
        url,
        headers: {
          'Content-Type': 'application/json',
        },
        data: params,
      });
  
      // Check if the response status is not 200 (OK)
      if (response.status !== 200) {
        console.error('Response Error:', {
          status: response.status,
          statusText: response.data?.statusText || 'Error',
          ...response.data,
        });
        throw new ResponseError('Failed to post auth login data', response, response.data);
      }
  
      // Parse and log the API response data
      console.log('API response data:', response.data);
  
      // Save the response data to local storage (assuming a token or similar data is returned)
      const { token, userData } = response.data; // Adjust based on your API's response format
      if (token) {
        await saveDataToStorage('session_token', token);
      }
  
      if (userData) {
        await saveDataToStorage('logLogin', userData);
      }
  
      // Return parsed JSON result
      return response.data;
    } catch (error) {
      if (error instanceof ResponseError) {
        throw error;
      } else {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error Details:', message);
        throw new ResponseError(`Error during postAuthLogin: ${message}`, null);
      }
    }
  };

export const logoutUser = async (params: PostLogoutParams): Promise<any> => {
    const url = `${LINK_BACKEND}/api/logout`;

    try {
        const response = await CapacitorHttp.post({
            url,
            headers: {
                'Content-Type': 'application/json',
            },
            data: params,
        });

        // Check if the response status is not 200 (OK)
        if (response.status !== 200) {
            console.error('Response Error:', {
                status: response.status,
                statusText: response.data?.statusText || 'Error',
                ...response.data,
            });
            throw new ResponseError('Failed to post logout data', response, response.data);
        }

        // Return parsed JSON result
        console.log('API response data:', response.data);
        return response.data;
    } catch (error) {
        if (error instanceof ResponseError) {
            throw error;
        } else {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error Details:', message);
            throw new ResponseError(`Error during logoutUser: ${message}`, null);
        }
    }
};
