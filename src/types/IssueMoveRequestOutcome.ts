
export type OutcomeError = {
  message: string;
}

export type IssueMoveRequestOutcome = {
  statusCode: number;
  taskId?: string;
  errors?: OutcomeError[];
}
