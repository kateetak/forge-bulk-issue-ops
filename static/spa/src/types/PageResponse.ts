
export type PageResponse<T> = {
  isLast: boolean; // e.g. true,
  maxResults: number; // e.g. 50,
  startAt: number // e.g. 0,
  total: number; // e.g. 5,
  values: T[]
}
