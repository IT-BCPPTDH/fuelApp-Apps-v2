import { CapacitorHttp } from '@capacitor/core';
import { ResponseError } from "../helper/responseError";
const LINK_BACKEND =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3033";

const BELinkMaster = import.meta.env.VITE_BACKEND_URL;
export async function getAllQuota(date:String) {
    const url = `${BELinkMaster}/api/quota-usage/get-active/${date}`;
    try {
        const response = await CapacitorHttp.get({
            url,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new ResponseError(`Failed to fetch data. Status: ${response.status} ${response.data?.statusText || 'Error'}`, response);
        }
        const data = response.data;
        return data;
    } catch (error: unknown) {
        if (error instanceof ResponseError) {
            throw error;
        } else if (error instanceof Error) {
            console.error('An unexpected error occurred:', error.message);
            throw new Error('An unexpected error occurred while fetching quota data.');
        } else {
            console.error('Unknown error occurred');
            throw new Error('An unknown error occurred while fetching quota data.');
        }
    }
}

interface UpdateData {
    id:String,
    used:Number,
    status:String
  }

export const updateQuota = async (params: UpdateData): Promise<any> => {
    const url = `${LINK_BACKEND}/api/quota-usage/update-from-tab`;
  
    try {
      const response = await CapacitorHttp.put({
        url,
        headers: {
          "Content-Type": "application/json",
        },
        data: params,
      });
  
      const responseData = response.data || {};
      console.log("kotakota:", responseData);
  
      if (response.status !== 200) {
        console.error("Response Error:", {
          status: response.status,
          data: responseData,
        });
        throw new ResponseError("Failed to update data", response, responseData);
      }
  
      return responseData;
    } catch (error) {
      if (error instanceof ResponseError) {
        console.error("ResponseError Details:", {
          message: error.message,
          status: error.response.status,
          statusText: error.response.statusText,
        //   responseData: error.errorData,
        });
        throw error;
      } else {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error("General Error Details:", { message });
        throw new ResponseError(`Error during updateData: ${message}`, {
          status: 500,
          statusText: "Internal Server Error",
        });
      }
    }
  };


// export async function getUnitQuotaActive(date:String) {
//     const url = `${BELinkMaster}/api/quota-usage/get-active/${date}`;

//     try {
//         const response = await CapacitorHttp.get({
//             url,
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });

//         if (response.status !== 200) {
//             throw new ResponseError(`Failed to. Status: ${response.status} ${response.data?.statusText || 'Error'}`, response);
//         }

//         const data = response.data;



//         return data;
//     } catch (error: unknown) {
//         if (error instanceof ResponseError) {
//             throw error;
//         } else if (error instanceof Error) {
//             console.error('An unexpected error occurred:', error.message);
//             throw new Error('An unexpected error occurred while fetching quota data.');
//         } else {
//             console.error('Unknown error occurred');
//             throw new Error('An unknown error occurred while fetching quota data.');
//         }
//     }
// }