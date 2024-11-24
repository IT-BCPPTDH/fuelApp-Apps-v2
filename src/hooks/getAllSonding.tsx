import { CapacitorHttp } from "@capacitor/core";
import { ResponseError } from "../helper/responseError";

const BELinkMaster = import.meta.env.VITE_BELINK_MASTER_URL;
export async function getAllSonding() {
  const url = `${BELinkMaster}/master/sonding-master`;

  try {
    const response = await CapacitorHttp.get({
      url,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      throw new ResponseError(
        `Failed to fetch data. Status: ${response.status} ${
          response.data?.statusText || "Error"
        }`,
        response
      );
    }
    const data = response.data;
    return data;
  } catch (error: unknown) {
    if (error instanceof ResponseError) {
      throw error;
    } else if (error instanceof Error) {
      console.error("An unexpected error occurred:", error.message);
      throw new Error(
        "An unexpected error occurred while fetching sonding data."
      );
    } else {
      console.error("Unknown error occurred");
      throw new Error("An unknown error occurred while fetching sonding data.");
    }
  }
}
