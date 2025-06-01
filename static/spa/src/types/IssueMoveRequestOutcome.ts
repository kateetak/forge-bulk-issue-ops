
export type OutcomeError = {
  message: string;
}

export type IssueMoveEditRequestOutcome = {
  statusCode: number;
  taskId?: string;
  errors?: OutcomeError[];
}
