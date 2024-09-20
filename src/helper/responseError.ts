// In ResponseError.ts or equivalent file
export class ResponseError extends Error {
  response: any; // Changed from Response to any
  data?: any;
  responseData: any;

  constructor(message: string, response: any, data?: any) {
      super(message);
      this.name = "ResponseError";
      this.response = response;
      this.data = data;
      Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
  }
}
