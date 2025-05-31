
export type OutcomeError = {
  message: string;
}

export type TaskRequestOutcome = {
  statusCode: number;
  taskId?: string;
  errors?: OutcomeError[];
}
