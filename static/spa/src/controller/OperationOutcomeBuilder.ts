import { OperationOutcome } from "../types/OperationOutcome";

export const buildSuccessOutcome = (): OperationOutcome => {
  return {
    success: true,
  };
};

export const buildErrorOutcome = (errorMessage: string): OperationOutcome => {
  return {
    success: false,
    errorMessage: errorMessage,
  };
};
