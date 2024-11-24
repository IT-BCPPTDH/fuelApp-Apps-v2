import { CapacitorHttp } from "@capacitor/core";

const LINK_BACKEND =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3033";

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

interface PostOpeningParams {
  date: string;
  shift: string;
  hm_start: number;
  site: string;
  jde: string;
  fuelman_id: string;
  station: string;
  opening_dip: number;
  opening_sonding: number;
  flow_meter_start: number;
}

interface UpdateData {
  date: string;
  shift: string;
  hm_start: number;
  site: string;
  jde: string;
  fuelman_id: string;
  station: string;
  opening_dip: number;
  opening_sonding: number;
  flow_meter_start: number;
  hm_end: number;
  closing_dip: number;
  flow_meter_end: number;
  note: string; // Update type here
  signature: string;
  lkf_id: string;
}

export const postOpening = async (params: PostOpeningParams): Promise<any> => {
  const url = `${LINK_BACKEND}/api/operator/post-lkf`;
  try {
    const response = await CapacitorHttp.post({
      url,
      headers: {
        "Content-Type": "application/json",
      },
      data: params,
    });
    const responseData = response.data || {};
    if (response.status !== 201 || responseData.message !== "Data Created") {
      console.error("Response Error:", responseData);
      throw new ResponseError(
        "Failed to post opening data",
        response,
        responseData
      );
    }
  } catch (error) {
    console.error("Error during postOpening:", error);
    if (error instanceof ResponseError) {
      throw error; // Rethrow if it's a known ResponseError
    } else {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error Details:", message);
      throw new ResponseError(`Error during postOpening: ${message}`, {
        status: 500,
        statusText: "Internal Server Error",
      });
    }
  }
};

export const updateData = async (params: UpdateData): Promise<any> => {
  const url = `${LINK_BACKEND}/api/operator/close-lkf`;

  try {
    const response = await CapacitorHttp.put({
      url,
      headers: {
        "Content-Type": "application/json",
      },
      data: params,
    });

    const responseData = response.data || {};
    console.log("Server Response Data:", responseData);

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
        responseData: error.errorData,
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
