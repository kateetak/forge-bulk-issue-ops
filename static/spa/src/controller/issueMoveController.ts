import { TaskOutcome, TaskStatus } from "src/types/TaskOutcome";
import { BulkIssueMoveRequestDataBuilder, ProjectIssueTypeClassificationBuilder } from "./BulkIssueMoveRequestDataBuilder";
import { IssueMoveRequestOutcome } from "src/types/IssueMoveRequestOutcome";
import projectSearchInfoCache from "src/model/projectSearchInfoCache";
import issueTypesCache from "src/model/issueTypesCache";
import { IssueType } from "src/types/IssueType";
import { IssueSearchInfo } from "src/types/IssueSearchInfo";
import { Issue } from "src/types/Issue";
import { getTaskOutcome, initiateBulkIssuesMove } from "./jiraClient";

const issueMovePollPeriodMillis = 2000;

class IssueMoveController {

  initiateMove = async (
    invoke: any,
    destinationProjectId: string,
    issueKeys: string[],
    issueSearchInfo: IssueSearchInfo
  ): Promise<IssueMoveRequestOutcome> => {
    const allProjectsSearchInfo = await projectSearchInfoCache.getProjectSearchInfo(invoke);
    const allIssueTypes: IssueType[] = await issueTypesCache.getissueTypes(invoke);
    const destinationProject = allProjectsSearchInfo.values.find(project => project.id === destinationProjectId);
    if (destinationProject) {
      const bulkIssueMoveRequestDataBuilder = new BulkIssueMoveRequestDataBuilder();
      const projectIssueTypeKeysToBuilders = new Map<string, ProjectIssueTypeClassificationBuilder>();
      for (const issueKey of issueKeys) {
        const issue = issueSearchInfo.issues.find((i: Issue) => i.key === issueKey);
        if (issue) {
          const issueType = allIssueTypes.find(issueType => issueType.id === issue.fields.issuetype.id);
          if (issueType) {
            const projectIssueTypeKey = `${destinationProject.id}-${issueType.id}`;
            let projectIssueTypeClassificationBuilder: undefined | ProjectIssueTypeClassificationBuilder = projectIssueTypeKeysToBuilders.get(projectIssueTypeKey);
            if (!projectIssueTypeClassificationBuilder) {
              projectIssueTypeClassificationBuilder = new ProjectIssueTypeClassificationBuilder()
                .setInferClassificationDefaults(true)
                .setInferFieldDefaults(true)
                .setInferStatusDefaults(true)
                .setInferSubtaskTypeDefault(true)
                .setTargetClassification([])
                .setTargetMandatoryFields([])
              projectIssueTypeKeysToBuilders.set(projectIssueTypeKey, projectIssueTypeClassificationBuilder);
              bulkIssueMoveRequestDataBuilder.addMapping(
                destinationProject.id,
                issueType.id,
                projectIssueTypeClassificationBuilder.build()
              );
            }
            projectIssueTypeClassificationBuilder.addIssueIdOrKey(issue.id);
          }
        }
      }
      const bulkIssueMoveRequestData = bulkIssueMoveRequestDataBuilder.build();
      console.log(` * bulkIssueMoveRequestData: ${JSON.stringify(bulkIssueMoveRequestData, null, 2)}`);
      // const params = {
      //   bulkIssueMoveRequestData: bulkIssueMoveRequestData,
      // };
      const requestOutcome: IssueMoveRequestOutcome = await initiateBulkIssuesMove(bulkIssueMoveRequestData);
      return requestOutcome;
    } else {
      throw new Error(`Destination project ${destinationProjectId} not found`);
    }
  }

  pollMoveProgress = async (invoke: any, taskId: string): Promise<TaskOutcome> => {
    const params = {
      taskId: taskId,
    }
    // const issueMoveOutcome = await invoke('getIssueMoveOutcome', params);
    const issueMoveOutcome = await getTaskOutcome(taskId);
    return issueMoveOutcome;
  }

  awaitMoveCompletion = async (invoke: any, taskId: string): Promise<TaskOutcome> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const issueMoveOutcome = await this.pollMoveProgress(invoke, taskId);
        if (issueMoveOutcome) {
          // console.log(` * Found issueMoveOutcome for taskId ${taskId}`);
          resolve(issueMoveOutcome);
        } else {
          // console.log(` * Did not find issueMoveOutcome for taskId ${taskId}`);
          const outcome = await this.awaitMoveCompletion(invoke, taskId);
          resolve(outcome);
        }
      }, issueMovePollPeriodMillis);
    });
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
