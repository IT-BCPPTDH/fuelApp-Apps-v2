// Assume `User` is an interface defining the user object
const BE_USER = 'http://localhost:9001';


export interface User {
    accessToken: string;
    // other user fields if needed
  }
  
  export class ResponseError extends Error {
    public response: Response;
  
    constructor(message: string, response: Response) {
      super(message);
      this.response = response;
      this.name = 'ResponseError';
    }
  }
  
  export async function getAlllUser(user: User): Promise<User | null> {
    const url = `${BE_USER}/api-user/get-all`; 
    if (!user) return null;
  
    const response = await fetch(url, {
      headers: {
        method: 'GET',
      },
    });
  
    if (!response.ok) {
      throw new ResponseError('Failed on get user request', response);
    }
  
    return await response.json();
  }
  