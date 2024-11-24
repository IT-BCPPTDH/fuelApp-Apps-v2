import { CapacitorHttp } from "@capacitor/core";

const LINK_BACKEND = import.meta.env.VITE_BACKEND_URL;

// Custom error class for handling API response errors
export class ResponseError extends Error {
  response: any;

  constructor(message: string, response: any) {
    super(message);
    this.response = response;
    this.name = "ResponseError";
  }
}

// Function to fetch home summary by Lkf ID
// Function to fetch home summary by LKF ID
export async function getHomeByIdLkf(lkf_id: string): Promise<any> {
  const url = `${LINK_BACKEND}/api/operator/get-home-summary-tab/${lkf_id}`;
  try {
    const response = await CapacitorHttp.get({
      url,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status !== 200) {
      throw new ResponseError(
        `Failed to fetch home summary. Status: ${response.status} ${
          response.data?.statusText || "Error"
        }`,
        response
      );
    }
    const data = response.data;
    return data;
  } catch (error) {}
}

export async function getHomeTable(lkf_id: string) {
  const url = `${LINK_BACKEND}/api/operator/get-home-table/${lkf_id}`;
  try {
    const response = await CapacitorHttp.get({
      url,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status !== 200) {
      throw new ResponseError(
        `Failed to fetch Tabek data. Status: ${response.status} ${
          response.data?.statusText || "Error"
        }`,
        response
      );
    }
    const data = response.data;
    if (data && Array.isArray(data.data)) {
      if (data.data.length === 0) {
        return { status: "200", message: "No data available", data: [] };
      }
      return data;
    } else {
      console.warn("Data is in unexpected format:", data);
      return { status: "200", message: "Unexpected data format", data: [] };
    }
  } catch (error) {
    if (error instanceof ResponseError) {
      console.error("ResponseError:", error.message);
      throw error; // Rethrow or handle the error as needed
    } else if (error instanceof Error) {
      console.error("Error:", error.message);
      throw new Error("An unexpected error occurred."); // General error message
    } else {
      console.error("Unknown error:", error);
      throw new Error("An unexpected error occurred.");
    }
  }
}
