
export type InvocationResult<T> = {
  ok: boolean;
  status: number;
  data?: T;
  errorMessage?: string;
}