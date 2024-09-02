// In ResponseError.ts or equivalent file
export class ResponseError extends Error {
  response: Response;
  data?: any;
    responseData: any;

  constructor(message: string, response: Response, data?: any) {
      super(message);
      this.name = "ResponseError";
      this.response = response;
      this.data = data;
      Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
  }
}
