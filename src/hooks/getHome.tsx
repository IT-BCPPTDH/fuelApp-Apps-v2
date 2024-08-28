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
  const url = `${LINK_BACKEND}/api/operator/get-home-summary/${lkfId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new ResponseError(`Failed to fetch station data. Status: ${response.status} ${response.statusText}`, response);
    }

    const data = await response.json();
    
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
