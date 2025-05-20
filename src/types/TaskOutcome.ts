
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-tasks/#api-rest-api-3-task-taskid-get

export type TaskStatus = 'ENQUEUED' | 'RUNNING' | 'COMPLETE' | 'FAILED' | 'CANCEL_REQUESTED' | 'CANCELLED' | 'DEAD';

export type TaskOutcome = {
  description: string;
  message: string;
  progress: number;
  result: any;
  status: TaskStatus
}
