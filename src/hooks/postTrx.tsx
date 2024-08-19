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
    id?: number;
    from_data_id: number;
    unit_no: string;
    model_unit: string;
    owner: string;
    date_trx: any;
    hm_last: number;
    hm_km: number;
    qty_last: number;
    qty: number;
    jde_operator: string;
    name_operator: string;
    fbr: number;
    lkf_id: number;
    type: string;
    fuelman_id: string;
    signature?: string;
    photo?: string;
}




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
