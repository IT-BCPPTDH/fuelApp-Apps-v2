import { CapacitorHttp } from "@capacitor/core";
import { ResponseError } from "../helper/responseError";

const BELinkMaster = import.meta.env.VITE_BELINK_MASTER_URL;
export async function getAllUnit() {
  const url = `${BELinkMaster}/master/unit`;

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
