import { CapacitorHttp } from '@capacitor/core';

const LINK_BACKEND = import.meta.env.VITE_BACKEND_URL;

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

type PostBulkInsert = {
    from_data_id: number;
    no_unit: string;
    model_unit: string;
    owner: string;
    date_trx: string;
    hm_last: number;
    hm_km: number;
    qty_last: number;
    qty: number;
    name_operator: string;
    fbr?: number;
    signature?: string | null;
    type: string;
    lkf_id?: string;
    status?: number;
    // jde_operator: string;
    flow_start: number;
    flow_end: number;
    foto?: string;
    end: string;
    sonding_start?: number;
    created_by?: string;
};

// Function to post bulk data
export const postBulkData = async (bulkData: PostBulkInsert[]) => {
    const url = `${LINK_BACKEND}/api/operator/bulk-insert`;

    try {
        const response = await CapacitorHttp.post({
            url,
            headers: {
                'Content-Type': 'application/json',
            },
            data: bulkData, // Send bulkData directly in the 'data' field
        });

        if (response.status !== 200) {
            console.error('Response Error:', response.data);
            throw new ResponseError('Failed to post transaction', response, response.data);
        }

        return response.data;
    } catch (error: unknown) {
        if (error instanceof ResponseError) {
            throw error;
        } else {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error Details:', message);
            throw new ResponseError(`Error during transaction: ${message}`, { status: 500, statusText: 'Internal Server Error' });
        }
    }
};
