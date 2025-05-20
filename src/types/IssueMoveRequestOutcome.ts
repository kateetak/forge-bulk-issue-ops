
export type Error = {
  message: string;
}

export type IssueMoveRequestOutcome = {
  statusCode: number;
  taskId?: string;
  errors?: Error[];
}
