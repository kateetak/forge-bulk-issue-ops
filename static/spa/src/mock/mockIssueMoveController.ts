import { TaskOutcome, TaskStatus } from "../types/TaskOutcome";
import { BulkIssueMoveRequestDataBuilder, ProjectIssueTypeClassificationBuilder } from "../controller/BulkIssueMoveRequestDataBuilder";
import { IssueMoveRequestOutcome } from "../types/IssueMoveRequestOutcome";
// import projectSearchInfoCache from "../model/projectSearchInfoCache";
import { IssueType } from "../types/IssueType";
import { IssueSearchInfo } from "../types/IssueSearchInfo";
import { Issue } from "../types/Issue";

const issueMovePollPeriodMillis = 2000;

type TaskInfo = {
  taskId: string,
  status: TaskStatus,
  numIssues: number;
  startTime: number;
  targetEndTime: number;
  targetEndStatus: TaskStatus;
}

class IssueMoveController {

  private taskIdsToTaskInfos = new Map<string, TaskInfo>();

  initiateMove = async (
    invoke: any,
    destinationProjectId: string,
    issueKeys: string[],
    issueSearchInfo: IssueSearchInfo
  ): Promise<IssueMoveRequestOutcome> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const taskId = `task-${Math.floor(Math.random() * 100000)}`;
        const taskInfo: TaskInfo = {
          taskId: taskId,
          status: 'ENQUEUED',
          startTime: Date.now(),
          numIssues: 100,
          targetEndTime: Date.now() + (1000 * 10),
          targetEndStatus: 'COMPLETE'
        }
        this.taskIdsToTaskInfos.set(taskId, taskInfo);
        const requestOutcome: IssueMoveRequestOutcome = {
          statusCode: 201,
          taskId: taskId
        }
        resolve(requestOutcome);  
      }, 2000);
    });
  }

  pollMoveProgress = async (invoke: any, taskId: string): Promise<TaskOutcome> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const requestOutcome = this.buildMockMoveOutcome(taskId);
        resolve(requestOutcome);  
      }, 2000);
    });
  }

  awaitMoveCompletion = async (invoke: any, taskId: string): Promise<TaskOutcome> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const requestOutcome = this.buildMockMoveOutcome(taskId);
        resolve(requestOutcome);  
      }, 2000);
    });
  }

  buildMockMoveOutcome = (taskId: string): any => {
    const taskInfo = this.taskIdsToTaskInfos.get(taskId);
    if (!taskInfo) {
      throw new Error(`Task ID ${taskId} not found`);
    }
    const now = Date.now();
    const targetDuration = taskInfo.targetEndTime - taskInfo.startTime;
    const elapsedDuration = now - taskInfo.startTime;
    const progress = Math.min(Math.round((elapsedDuration / targetDuration) * 100), 100);
    const status = progress < 100 ? 'RUNNING' : taskInfo.targetEndStatus;

    // const successCount = Math.round(1 + Math.random() * 55);
    const successCount = Math.round((progress / 100) * taskInfo.numIssues);
    const successfulIssues: number[] = [];
    for (let i = 0; i < successCount; i++) {
      successfulIssues.push(10000 + i);
    }
    const totalCount = successCount;

    const moveOutcome: any /* extension of TaskOutcome */ = {
      "self": "https://api.atlassian.com/ex/jira/d5798e84-0911-42ba-8965-1ede16eb86bd/rest/api/3/task/10472",
      "id": "10472",
      "description": "bulkMove",
      "status": status,
      "message": "bulk.operation.progress.percent.complete",
      "result": {
        "successfulIssues": successfulIssues,
        "failedIssues": {},
        "totalIssueCount": totalCount,
      },
      "submittedBy": 10000,
      "progress": progress,
      "elapsedRuntime": 743,
      "submitted": 1747831249033,
      "started": 1747831249158,
      "finished": 1747831249901,
      "lastUpdate": 1747831249901
    }
    return moveOutcome;
  }

  isDone = (status: TaskStatus): boolean => {
    if (status === 'ENQUEUED' || status === 'RUNNING') {
      return false;
    } else if (status === 'COMPLETE' || status === 'FAILED' || status === 'CANCEL_REQUESTED' || status === 'CANCELLED' || status === 'DEAD') {
      return true;
    } else {
      throw new Error(`Unknown status: ${status}`);
    }
  }

}

export default new IssueMoveController();
