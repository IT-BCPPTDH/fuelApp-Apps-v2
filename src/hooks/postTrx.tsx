import { CapacitorHttp } from '@capacitor/core';
import { ResponseError } from './serviceApi';

const LINK_BACKEND = import.meta.env.VITE_BACKEND_URL;



type PostAuthParams = {
    from_data_id: string;
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
    signature?: string | null; // Allow `null` if appropriate
    type: string;
    lkf_id?: string;
    status: number;
    jde_operator: string;
    fuelman_id: string;
    flow_start: number;
    flow_end: number;
    foto: string;
    end: string;
    sonding_start: number;
};

export const postTransaksi = async (params: PostAuthParams) => {
    const url = `${LINK_BACKEND}/api/operator/post-data`;

    try {
        const response = await CapacitorHttp.post({
            url,
            headers: {
                'Content-Type': 'application/json',
            },
            data: params,
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
