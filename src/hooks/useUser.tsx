const BE_USER='http://127.0.0.1:9001'
export interface User {
    division: string;
    position: string;
    fullname: string;
    jde: string;
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
  
  export async function getUser(user: User): Promise<User | null> {
    const url = `${BE_USER}/api-user/auth`; 
    if (!user) return null;
  
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    });
  
    if (!response.ok) {
      throw new ResponseError('Failed on get user request', response);
    }
  
    return await response.json();
  }
  