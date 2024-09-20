

const LINK_BACKEND = 'http://localhost:3033';


export async function getQoutaUnit() {
    const url = `${LINK_BACKEND}/quota-usage/get-data`;
    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Ensure you return the data here
    } catch (error) {
        console.error('Error fetching quota unit:', error);
        throw error; // Re-throw the error for handling in the calling function
    }
}



