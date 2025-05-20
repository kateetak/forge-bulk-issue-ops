import { TaskOutcome } from "src/types/TaskOutcome";
import { BulkIssueMoveRequestDataBuilder, ProjectIssueTypClassificationBuilder } from "./BulkIssueMoveRequestDataBuilder";
import { IssueMoveRequestOutcome } from "src/types/IssueMoveRequestOutcome";

const issueMovePollPeriodMillis = 2000;

class IssueMoveController {

  initiateMove = async (
    invoke: any,
    destinationProjectId: string,
    destinationIssueTypeId: string,
    issueIds: string[]
  ): Promise<IssueMoveRequestOutcome> => {
    const bulkIssueMoveRequestData = new BulkIssueMoveRequestDataBuilder()
      .addMapping(
        destinationProjectId,
        destinationIssueTypeId,
        new ProjectIssueTypClassificationBuilder()
          .setIssueIdsOrKeys(issueIds)
          .setInferClassificationDefaults(true)
          .setInferFieldDefaults(true)
          .setInferStatusDefaults(true)
          .setInferSubtaskTypeDefault(true)
          .setTargetClassification([])
          .setTargetMandatoryFields([])
          .build()
        )
      .build();
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
