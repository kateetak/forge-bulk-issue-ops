
export type ProgressInfo = {
  state: 'waiting' | 'in_progress' | 'complete' | 'error';
  percentComplete: number;
  message?: string
}
