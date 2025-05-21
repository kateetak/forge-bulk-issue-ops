import { TaskOutcome } from "src/types/TaskOutcome";
import { BulkIssueMoveRequestDataBuilder, ProjectIssueTypeClassificationBuilder } from "./BulkIssueMoveRequestDataBuilder";
import { IssueMoveRequestOutcome } from "src/types/IssueMoveRequestOutcome";
import projectSearchInfoCache from "src/model/projectSearchInfoCache";
import issueTypesCache from "src/model/issueTypesCache";
import { IssueType } from "src/types/IssueType";
import { IssueSearchInfo } from "src/types/IssueSearchInfo";
import { Issue } from "src/types/Issue";
import jiraUtil from "./jiraUtil";

const issueMovePollPeriodMillis = 2000;

class IssueMoveController {

  initiateMove = async (
    invoke: any,
    destinationProjectId: string,
    // destinationIssueTypeId: string,
    issueKeys: string[],
    issueSearchInfo: IssueSearchInfo
  ): Promise<IssueMoveRequestOutcome> => {

    const allProjectsSearchInfo = await projectSearchInfoCache.getProjectSearchInfo(invoke);
    const allIssueTypes: IssueType[] = await issueTypesCache.getissueTypes(invoke);

    const bulkIssueMoveRequestDataBuilder = new BulkIssueMoveRequestDataBuilder();
    const projectIssueTypeKeysToBuilders = new Map<string, ProjectIssueTypeClassificationBuilder>();
    for (const issueKey of issueKeys) {
      const issue = issueSearchInfo.issues.find((i: Issue) => i.key === issueKey);
      if (issue) {
        const issueType = allIssueTypes.find(issueType => issueType.id === issue.fields.issuetype.id);
        if (issueType) {
          // const projectsWithIssueType = jiraUtil.determineProjectsWithIssueTypes(issueType, allProjectsSearchInfo.values, allIssueTypes);


          // const project = allProjectsSearchInfo.values.find(project => project.id === issueType.scope?.project.id);
          const project = allProjectsSearchInfo.values.find(project => project.id === destinationProjectId);

          if (project) {
            const projectIssueTypeKey = `${project.id}-${issueType.id}`;
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
                project.id,
                issueType.id,
                projectIssueTypeClassificationBuilder.build()
              );
            }
            projectIssueTypeClassificationBuilder.addIssueIdOrKey(issue.id);
          }
        }
      }
    }

    // const projectIds

    // const bulkIssueMoveRequestData = new BulkIssueMoveRequestDataBuilder()
    //   .addMapping(
    //     destinationProjectId,
    //     destinationIssueTypeId,
    //     new ProjectIssueTypeClassificationBuilder()
    //       .setIssueIdsOrKeys(issueIds)
    //       .setInferClassificationDefaults(true)
    //       .setInferFieldDefaults(true)
    //       .setInferStatusDefaults(true)
    //       .setInferSubtaskTypeDefault(true)
    //       .setTargetClassification([])
    //       .setTargetMandatoryFields([])
    //       .build()
    //     )
    //   .build();

    const bulkIssueMoveRequestData = bulkIssueMoveRequestDataBuilder.build();
    console.log(` * bulkIssueMoveRequestData: ${JSON.stringify(bulkIssueMoveRequestData, null, 2)}`);
    const params = {
      bulkIssueMoveRequestData: bulkIssueMoveRequestData,
    };
    const requestOutcome: IssueMoveRequestOutcome = await invoke('initiateMove', params);
    return requestOutcome;
  }

  awaitMoveCompletion = async (invoke: any, taskId: string): Promise<TaskOutcome> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const params = {
          taskId: taskId,
        }
        const issueMoveOutcome = await invoke('getIssueMoveOutcome', params);
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

}

export default new IssueMoveController();
