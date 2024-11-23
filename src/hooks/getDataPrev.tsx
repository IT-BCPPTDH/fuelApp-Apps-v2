import { CapacitorHttp } from "@capacitor/core";
import { ResponseError } from "../helper/responseError";

const BELinkMaster = import.meta.env.VITE_BACKEND_URL;
export async function getPrevUnitTrx(unit_no: string) {
  const url = `${BELinkMaster}/api/operator/get-data/${unit_no}`;
  try {
    const response = await CapacitorHttp.get({
      url,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      throw new ResponseError(
        `Failed to fetch Unit data. Status: ${response.status} ${
          response.data?.statusText || "Error"
        }`,
        response,
        response.data
      );
    }

    const data = response.data;
    return data;
  } catch (error: unknown) {
    if (error instanceof ResponseError) {
      console.error("ResponseError:", error.message, "Data:", error.data);
      throw error;
    } else if (error instanceof Error) {
      console.error("An unexpected error occurred:", error.message);
      throw new Error("An unexpected error occurred while fetching unit data.");
    } else {
      console.error("Unknown error occurred");
      throw new Error("An unknown error occurred while fetching unit data.");
    }
  }
}

export async function getDataLastTrx() {
  const url = `${BELinkMaster}/api/operator/get-last-trx`;

  try {
    const response = await CapacitorHttp.get({
      url,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      throw new ResponseError(
        `Failed to fetch unit data. Status: ${response.status} ${
          response.data?.statusText || "Error"
        }`,
        response
      );
    }

    // console.log('Successfully fetched unit data:', response.data);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof ResponseError) {
      throw error;
    } else if (error instanceof Error) {
      console.error("An unexpected error occurred:", error.message);
      throw new ResponseError(
        `Unexpected error occurred: ${error.message}`,
        null
      );
    } else {
      console.error("An unknown error occurred");
      throw new ResponseError(
        "An unknown error occurred while fetching unit data",
        null
      );
    }
  }
}

export async function getDataLastLKF() {
  const url = `${BELinkMaster}/api/operator/last-lkf-all`;

  try {
    const response = await CapacitorHttp.get({
      url,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      throw new ResponseError(
        `Failed to fetch unit data. Status: ${response.status} ${
          response.data?.statusText || "Error"
        }`,
        response
      );
    }

    // console.log('Successfully fetched unit data:', response.data);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof ResponseError) {
      throw error;
    } else if (error instanceof Error) {
      console.error("An unexpected error occurred:", error.message);
      throw new ResponseError(
        `Unexpected error occurred: ${error.message}`,
        null
      );
    } else {
      console.error("An unknown error occurred");
      throw new ResponseError(
        "An unknown error occurred while fetching unit data",
        null
      );
    }
  }
}
