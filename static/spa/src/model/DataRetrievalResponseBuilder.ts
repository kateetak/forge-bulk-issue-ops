import { DataRetrievalResponse } from "../types/DataRetrievalResponse";

export class DataRetrievalResponseBuilder<T> {

  private data?: T;
  private errorMessage?: string;

  public setData(data: T): DataRetrievalResponseBuilder<T> {
    this.data = data;
    return this;
  }

  public setErrorMessage(errorMessage: string): DataRetrievalResponseBuilder<T> {
    this.errorMessage = errorMessage;
    return this;
  }

  public build(): DataRetrievalResponse<T> {
    return {
      data: this.data,
      errorMessage: this.errorMessage
    };
  }
  
}