const LINK_BACKEND = 'http://localhost:3033';

// Custom error class for handling API response errors
export class ResponseError extends Error {
  response: Response;
  
  constructor(message: string, response: Response) {
    super(message);
    this.response = response;
    this.name = 'ResponseError';
  }
}

// Function to fetch home summary by LKf ID
export async function getHomeByIdLkf(lkfId: string): Promise<any> {
  const url = `${LINK_BACKEND}/api/operator/get-home-summary/${lkfId}`;  // Correct URL with lkfId

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new ResponseError(`Failed to fetch station data. Status: ${response.status} ${response.statusText}`, response);
    }

    const data = await response.json();

    if (data && Object.keys(data).length === 0) {
      console.warn('Data is empty:', data);
      // Handle empty data case if necessary
      return null;  // Return null or any default value you see fit
    }

    console.log('Successfully fetched station data:', data);
    return data;
  } catch (error) {
    if (error instanceof ResponseError) {
      console.error('ResponseError:', error.message);
      throw error;  // Rethrow or handle the error as needed
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
      throw new Error('An unexpected error occurred.');  // General error message
    } else {
      console.error('Unknown error:', error);
      throw new Error('An unexpected error occurred.');
    }
  }
}

export async function getHomeTable(lkfId: string): Promise<any> {
  // Correct URL with lkfId
  const url = `${LINK_BACKEND}/api/operator/get-home-table/${lkfId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new ResponseError(`Failed to fetch station data. Status: ${response.status} ${response.statusText}`, response);
    }

    const data = await response.json();

    if (data && Array.isArray(data.data)) {
      // Check if the data array is empty
      if (data.data.length === 0) {
        console.warn('Data is empty:', data);
        return { status: '200', message: 'No data available', data: [] };
      }
      console.log('Successfully fetched station data:', data);
      return data;
    } else {
      console.warn('Data is in unexpected format:', data);
      // Handle unexpected data format
      return { status: '200', message: 'Unexpected data format', data: [] };
    }
  } catch (error) {
    if (error instanceof ResponseError) {
      console.error('ResponseError:', error.message);
      throw error;  // Rethrow or handle the error as needed
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
      throw new Error('An unexpected error occurred.');  // General error message
    } else {
      console.error('Unknown error:', error);
      throw new Error('An unexpected error occurred.');
    }
  }
}
