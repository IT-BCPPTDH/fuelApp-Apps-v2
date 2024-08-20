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

type PostAuthParams = {
    from_data_id: number;
    unit_no: string;
    model: string;
    owner: string;
    date_trx: string;
    hm_last: number;
    hm_km: number;
    qty_last: number;
    qty: number;
    name_operator: string;
    fbr: number;
    signature?: string | null; // Allow `null` if appropriate
    type: string;
    lkf_id?: number;
    start_time: string;
    end_time: string;
    status: boolean;
    jde_operator: string;
    fuelman_id: string;
    flow_start:string
    flow_end:string
    
};



export const postTransaksi = async (params: PostAuthParams) => {
    const url = `${LINK_BACKEND}/api/operator/post-data`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params), 
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Response Error:', errorData);
            throw new ResponseError('Failed to post transaction', response, errorData);
        }

        return response.json();
    } catch (error: unknown) {
        if (error instanceof ResponseError) {
            throw error;
        } else {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error Details:', message);
            throw new ResponseError(`Error during transaction: ${message}`, new Response());
        }
    }
};
