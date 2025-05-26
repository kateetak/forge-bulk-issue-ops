import { TaskOutcome, TaskStatus } from "src/types/TaskOutcome";
import { BulkIssueMoveRequestDataBuilder, ProjectIssueTypeClassificationBuilder } from "./BulkIssueMoveRequestDataBuilder";
import { IssueMoveRequestOutcome, OutcomeError } from "src/types/IssueMoveRequestOutcome";
import { IssueType } from "src/types/IssueType";
import { IssueSearchInfo } from "src/types/IssueSearchInfo";
import { Issue } from "src/types/Issue";
import jiraDataModel from "src/model/jiraDataModel";
import { TargetMandatoryFields } from "src/types/TargetMandatoryField";
import { InvocationResult } from "src/types/InvocationResult";

const issueMovePollPeriodMillis = 2000;

class IssueMoveController {

  initiateMove = async (
    destinationProjectId: string,
    issues: Issue[],
    issueSearchInfo: IssueSearchInfo,
    issueTypeIdsToTargetMandatoryFields: Map<string, TargetMandatoryFields>
  ): Promise<IssueMoveRequestOutcome> => {

    // const r2d2TargetMandatoryFields: TargetMandatoryFields = 
    // {
    //   fields: {
    //     customfield_10091: {
    //       retain: true,
    //       type: "raw",
    //       value: ['10021']
    //     }
    //   }
    // };

    // const issueTypeIdsToTargetMandatoryFields = new Map<string, TargetMandatoryFields>();



    const allProjectsSearchInfo = await jiraDataModel.pageOfProjectSearchInfo('');
    const allIssueTypes: IssueType[] = await jiraDataModel.getissueTypes();
    const destinationProject = allProjectsSearchInfo.values.find(project => project.id === destinationProjectId);
    if (destinationProject) {
      const bulkIssueMoveRequestDataBuilder = new BulkIssueMoveRequestDataBuilder();
      const projectIssueTypeKeysToBuilders = new Map<string, ProjectIssueTypeClassificationBuilder>();


      // Step 1: Arrange issues into arrays by issue type
      const issueTypeIdsToIssueTypes = new Map<string, IssueType>();
      const issueTypeIdsToIssues = new Map<string, Issue[]>();
      for (const issue of issues) {
        issueTypeIdsToIssueTypes.set(issue.fields.issuetype.id, issue.fields.issuetype);
        const issuesOfType = issueTypeIdsToIssues.get(issue.fields.issuetype.id);
        if (issuesOfType) {
          issuesOfType.push(issue);
        } else {
          issueTypeIdsToIssues.set(issue.fields.issuetype.id, [issue]);
        }
      }

      // Step 2: Iterate over issue types so that all issues of the same type are dealt with together since this
      //         is how the bulk move API payload needs to be formatted.
      const issueTypes: IssueType[] = Array.from(issueTypeIdsToIssueTypes.values());
      for (const issueType of issueTypes) {
        const issuesOfType = issueTypeIdsToIssues.get(issueType.id);
        if (issuesOfType) {
          const projectIssueTypeKey = `${destinationProject.id}-${issueType.id}`;
          const projectIssueTypeClassificationBuilder = new ProjectIssueTypeClassificationBuilder()
            .setInferClassificationDefaults(true)
            .setInferFieldDefaults(true)
            .setInferStatusDefaults(true)
            .setInferSubtaskTypeDefault(true)
            .setTargetClassification([])
            .setTargetMandatoryFields([]);
          for (const issueOfType of issuesOfType) {
            projectIssueTypeClassificationBuilder.addIssueIdOrKey(issueOfType.id);
          }
          const targetMandatoryFields: TargetMandatoryFields = issueTypeIdsToTargetMandatoryFields.get(issueType.id);
          const targetMandatoryFieldsCount = targetMandatoryFields ? Object.keys(targetMandatoryFields.fields).length : 0;
          if (targetMandatoryFieldsCount > 0) {
            projectIssueTypeClassificationBuilder
              .setInferFieldDefaults(false)
              // .setTargetMandatoryFields([r2d2TargetMandatoryFields]);
              .setTargetMandatoryFields([targetMandatoryFields]);
          }
          projectIssueTypeKeysToBuilders.set(projectIssueTypeKey, projectIssueTypeClassificationBuilder);
            bulkIssueMoveRequestDataBuilder.addMapping(
              destinationProject.id,
              issueType.id,
              projectIssueTypeClassificationBuilder.build()
            );
        } else {
          throw new Error(`Internal error: no issues found for issue type ${issueType.id}`);
        }
      }

      // for (const issue of issues) {
      //   const issueType = allIssueTypes.find(issueType => issueType.id === issue.fields.issuetype.id);
      //   if (issueType) {
      //     const projectIssueTypeKey = `${destinationProject.id}-${issueType.id}`;
      //     let projectIssueTypeClassificationBuilder: undefined | ProjectIssueTypeClassificationBuilder = projectIssueTypeKeysToBuilders.get(projectIssueTypeKey);
      //     if (!projectIssueTypeClassificationBuilder) {
      //       projectIssueTypeClassificationBuilder = new ProjectIssueTypeClassificationBuilder()
      //         .setInferClassificationDefaults(true)
      //         .setInferFieldDefaults(true)
      //         .setInferStatusDefaults(true)
      //         .setInferSubtaskTypeDefault(true)
      //         .setTargetClassification([])
      //         .setTargetMandatoryFields([]);


      //       projectIssueTypeKeysToBuilders.set(projectIssueTypeKey, projectIssueTypeClassificationBuilder);
      //       bulkIssueMoveRequestDataBuilder.addMapping(
      //         destinationProject.id,
      //         issueType.id,
      //         projectIssueTypeClassificationBuilder.build()
      //       );
              

      //         // .setInferFieldDefaults(false)
      //         // .setTargetMandatoryFields([r2d2TargetMandatoryFields])


      //       const targetMandatoryFieldsCount = targetMandatoryFields ? Object.keys(targetMandatoryFields.fields).length : 0;
      //       if (targetMandatoryFieldsCount > 0) {
      //         projectIssueTypeClassificationBuilder = projectIssueTypeClassificationBuilder
      //           .setInferFieldDefaults(false)
      //           .setTargetMandatoryFields([r2d2TargetMandatoryFields]);
      //       }


      //       projectIssueTypeKeysToBuilders.set(projectIssueTypeKey, projectIssueTypeClassificationBuilder);
      //       bulkIssueMoveRequestDataBuilder.addMapping(
      //         destinationProject.id,
      //         issueType.id,
      //         projectIssueTypeClassificationBuilder.build()
      //       );
      //     }
      //     projectIssueTypeClassificationBuilder.addIssueIdOrKey(issue.id);
      //   }
      // }


      // Step 3: Build the bulk issue move request data
      const bulkIssueMoveRequestData = bulkIssueMoveRequestDataBuilder.build();
      console.log(` * bulkIssueMoveRequestData: ${JSON.stringify(bulkIssueMoveRequestData, null, 2)}`);
      // const params = {
      //   bulkIssueMoveRequestData: bulkIssueMoveRequestData,
      // };

      // Step 4: Initiate the bulk issue move request
      const invocationResult: InvocationResult<IssueMoveRequestOutcome> = await jiraDataModel.initiateBulkIssuesMove(bulkIssueMoveRequestData);
      if (invocationResult.ok && invocationResult.data) {
        const requestOutcome: IssueMoveRequestOutcome = invocationResult.data;
        if (requestOutcome.taskId) {
          console.log(` * Initiated issue move with taskId: ${requestOutcome.taskId}`);
        } else {
          console.warn(` * Initiation of move request resulted in an error: ${requestOutcome.errors}`);
        }
        return requestOutcome;
      } else {
        console.warn(` * Initiation of move request resulted in an API error: ${invocationResult.errorMessage}`);
        const errors: OutcomeError[] = [{
          message: invocationResult.errorMessage,
        }];
        const requestOutcome: IssueMoveRequestOutcome = {
          taskId: undefined,
          errors: invocationResult.errorMessage ? errors : [],
          statusCode: 500
        }
        return requestOutcome;
      }

      // const requestOutcome: IssueMoveRequestOutcome = await jiraDataModel.initiateBulkIssuesMove(bulkIssueMoveRequestData);
      // if (requestOutcome.taskId) {
      //   console.log(` * Initiated issue move with taskId: ${requestOutcome.taskId}`);
      // } else {
      //   console.error(` * Failed to initiate issue move: ${JSON.stringify(requestOutcome, null, 2)}`);
      // }
      // return requestOutcome;
    } else {
      throw new Error(`Destination project ${destinationProjectId} not found`);
    }
  }

  // getIssueTypesOfIssues = (issues: Issue[]): Set<IssueType> => {
  //   const issueTypeIdsToTypes = new Map<string, IssueType>();
  //   for (const issue of issues) {
  //     issueTypeIdsToTypes.set(issue.fields.issuetype.id, issue.fields.issuetype);
  //   }
  //   return issueTypeIdsToTypes.size > 0 ? new Set(issueTypeIdsToTypes.values()) : new Set<IssueType>();
  // }

  pollMoveProgress = async (taskId: string): Promise<TaskOutcome> => {
    const params = {
      taskId: taskId,
    }
    // const issueMoveOutcome = await invoke('getIssueMoveOutcome', params);
    const issueMoveOutcome = await jiraDataModel.getTaskOutcome(taskId);
    return issueMoveOutcome;
  }

  awaitMoveCompletion = async (invoke: any, taskId: string): Promise<TaskOutcome> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const issueMoveOutcome = await this.pollMoveProgress(taskId);
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
      // throw new Error(`Unknown status: ${status}`);
      return false;
    }
  }

}

export default new IssueMoveController();
