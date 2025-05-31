import { TaskOutcome, TaskStatus } from "../types/TaskOutcome";
import { IssueMoveRequestOutcome, OutcomeError } from "../types/IssueMoveRequestOutcome";
import jiraDataModel from "../model/jiraDataModel";
import { InvocationResult } from "../types/InvocationResult";
import { BulkIssueEditRequestData } from "src/types/BulkIssueEditRequestData";
import { BulkIssueEditRequestDataBuilder, JiraIssueFieldsBuilder } from "./BulkIssueEditRequestDataBuilder";
import editedFieldsModel from "src/model/editedFieldsModel";
import { IssueBulkEditField } from "src/types/IssueBulkEditFieldApiResponse";
import { Issue } from "src/types/Issue";
import { send } from "process";

const issueEditPollPeriodMillis = 1000;

class IssueEditController {

  initiateBulkEdit = async (
    bulkIssueEditRequestData: BulkIssueEditRequestData = this.buildBulkIssueEditRequestData(),
  ): Promise<IssueMoveRequestOutcome> => {
    const invocationResult: InvocationResult<IssueMoveRequestOutcome> = await jiraDataModel.initiateBulkIssuesEdit(bulkIssueEditRequestData);
    if (invocationResult.ok && invocationResult.data) {
      const requestOutcome: IssueMoveRequestOutcome = invocationResult.data;
      if (requestOutcome.taskId) {
        console.log(` * Initiated bulk issue edit with taskId: ${requestOutcome.taskId}`);
      } else {
        console.warn(` * Initiation of bulk issue edit resulted in an error: ${requestOutcome.errors}`);
      }
      return requestOutcome;
    } else {
      console.warn(` * Initiation of bulk issue edit resulted in an API error: ${invocationResult.errorMessage}`);
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
  }

  pollMoveProgress = async (taskId: string): Promise<TaskOutcome> => {
    const params = {
      taskId: taskId,
    }
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
      }, issueEditPollPeriodMillis);
    });
  }

  isDone = (status: TaskStatus): boolean => {
    if (status === 'ENQUEUED' || status === 'RUNNING') {
      return false;
    } else if (status === 'COMPLETE' || status === 'FAILED' || status === 'CANCEL_REQUESTED' || status === 'CANCELLED' || status === 'DEAD') {
      return true;
    } else {
      return false;
    }
  }

  private buildBulkIssueEditRequestData = (): BulkIssueEditRequestData => {
    const sendBulkNotification = editedFieldsModel.getSendBulkNotification();
    const editedFieldsInputBuilder = new JiraIssueFieldsBuilder();
    const selectedActions: string[] = [];
    const callback = (field: IssueBulkEditField, value: any) => {
      selectedActions.push(field.id);
      switch (field.type) {
        case 'text':
        case 'textarea':
        case 'string':
          this.addField(field.id, value, editedFieldsInputBuilder);
          break;
        case 'number':
          this.addField(field.id, value, editedFieldsInputBuilder);
          break;
        case 'date':
          this.addField(field.id, value, editedFieldsInputBuilder);
          break;
        case 'select':
          this.addField(field.id, value, editedFieldsInputBuilder);
          break;
        case 'multi-select':
          this.addField(field.id, value, editedFieldsInputBuilder);
          break;
        case 'user-picker':
          this.addField(field.id, value, editedFieldsInputBuilder);
          break;
        case 'group-picker':
          this.addField(field.id, value, editedFieldsInputBuilder);
          break;
        case 'project-picker':
          this.addField(field.id, value, editedFieldsInputBuilder);
          break;
        case 'issue-type-picker':
          this.addField(field.id, value, editedFieldsInputBuilder);
          break;
      }
    }
    editedFieldsModel.iterateFields(callback);
    const issues: Issue[] = editedFieldsModel.getIssues();


    // const editedFieldsInput = new JiraIssueFieldsBuilder()
    //   .build();
    return new BulkIssueEditRequestDataBuilder()
      .setEditedFieldsInput(editedFieldsInputBuilder.build())
      .setSelectedActions(selectedActions)
      .addSelectedIssues(issues)
      .setSendBulkNotification(sendBulkNotification)
      .build();
  }

  private addField = (fieldId: string, value: any, editedFieldsInputBuilder: JiraIssueFieldsBuilder): void => {
    // editedFieldsInputBuilder.setFieldValue(fieldId, value);
  }

}

export default new IssueEditController();
