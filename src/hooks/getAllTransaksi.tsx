const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function getTrasaksiSemua() {
  const today = new Date();
  const currentDate = today.toISOString().split("T")[0];
  const url = `${VITE_BACKEND_URL}/api/operator/get-data-prev/${currentDate}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the response status is 200 (OK)
    if (!response.ok) {
      throw new Error(`Failed to fetch data. Status: ${response.status}`);
    }

    const data = await response.json(); // Parse JSON response

    console.log("Data received:", data);
    if (!data || !Array.isArray(data.data)) {
      throw new Error("Received data is empty or not in the expected format.");
    }
    return data; // Return the fetched data
  } catch (error) {
    console.error("Error fetching transaksi data:", error); // Log the error for debugging
    throw new Error(
      "An unexpected error occurred while fetching transaksi data."
    );
  }
}
