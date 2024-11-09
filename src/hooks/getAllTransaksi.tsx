const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function getTrasaksiSemua() {
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];  
    const url = `${VITE_BACKEND_URL}/api/operator/get-data-prev/${currentDate}`;

    console.log("Backend URL:", url);  // Log URL for debugging

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Check if the response status is 200 (OK)
        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }

        const data = await response.json(); // Parse JSON response
        
        console.log('ini datanya:', data);

        // Handle the case where the response might not contain data in the expected format
        if (!data || !Array.isArray(data.data)) {
            throw new Error('Received data is empty or not in the expected format.');
        }

        console.log('Successfully fetched transaksi data:', data); // Log the successful response

        // Save to localStorage after successful fetch
        localStorage.setItem('transaksiData', JSON.stringify(data)); // Save the entire object

        return data; // Return the fetched data

    } catch (error) {
       
        throw new Error('An unexpected error occurred while fetching transaksi data.');
    }
}

// Function to retrieve the data from localStorage
const getDataFromLocalStorage = () => {
    const data = localStorage.getItem('transaksiData');
    if (data) {
        return JSON.parse(data); // Parse the stored JSON string back into an object
    }
    return null; // Return null if there's no data in localStorage
}

// Call the function to fetch and save data
getTrasaksiSemua().then(() => {
    const storedData = getDataFromLocalStorage();
    console.log('Data from localStorage:', storedData);
});
