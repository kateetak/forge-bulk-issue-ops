import React, { useState } from 'react';
import { FormSection, Label } from '@atlaskit/form';
import Button from '@atlaskit/button/new';
import { FlagOptions, showFlag } from '@forge/bridge';
import { LinearProgress } from '@mui/material';
import issueMoveController from 'src/controller/issueMoveController';
import { WaitingMessageBuilder } from 'src/controller/WaitingMessageBuilder';
import { StepName } from 'src/model/BulkOperationsWorkflow';
import { taskStatusPollPeriodMillis } from 'src/model/config';
import editedFieldsModel from 'src/model/editedFieldsModel';
import { Activity } from 'src/types/Activity';
import { BulkOperationMode } from 'src/types/BulkOperationMode';
import { CompletionState } from 'src/types/CompletionState';
import { IssueMoveRequestOutcome } from 'src/types/IssueMoveRequestOutcome';
import { TaskOutcome } from 'src/types/TaskOutcome';
import PanelHeader from 'src/widget/PanelHeader';
import { renderPanelMessage } from 'src/widget/renderPanelMessage';
import targetMandatoryFieldsProvider from '../controller/TargetMandatoryFieldsProvider';
import { Project } from 'src/types/Project';
import { Issue } from 'src/types/Issue';
import { IssueMoveOutcomeResult } from 'src/types/IssueMoveOutcomeResult';
import Lozenge from '@atlaskit/lozenge';
import { TaskStatusLozenge } from 'src/widget/TaskStatusLozenge';

const showDebug = false;

export type MoveOrEditPanelProps = {
  bulkOperationMode: BulkOperationMode;
  fieldMappingsComplete: boolean;
  // targetMandatoryFieldsProvider: TargetMandatoryFieldsProvider;
  selectedIssues: Issue[];
  selectedToProject: Project | undefined;
  allDefaultValuesProvided: boolean;
  setStepCompletionState: (stepName: StepName, completionState: CompletionState) => void;
  setMainWarningMessage: (message: string) => void;
}

export const MoveOrEditPanel = (props: MoveOrEditPanelProps) => {

  const [sendBulkNotification, setSendBulkNotification] = useState<boolean>(false);
  const [currentMoveActivity, setCurrentMoveActivity] = useState<undefined | Activity>(undefined);
  const [issueMoveRequestOutcome, setIssueMoveRequestOutcome] = useState<undefined | IssueMoveRequestOutcome>(undefined);
  const [issueMoveOutcome, setIssueMoveOutcome] = useState<undefined | TaskOutcome>(undefined);
  const [lastMoveCompletionTaskId, setLastMoveCompletionTaskId] = useState<string>('none');

  const buildTaskOutcomeErrorMessage = (taskOutcome: IssueMoveRequestOutcome): string => {
    if (taskOutcome.errors && taskOutcome.errors.length) {
      let combinedErrorMessages = '';
      for (const error of taskOutcome.errors) {
        const separator = combinedErrorMessages.length > 0 ? ', ' : '';
        combinedErrorMessages += `${separator}${error.message}`;
      }
      return combinedErrorMessages;
    } else {
      return '';
    }
  }

  const pollPollMoveOutcome = async (taskId: string): Promise<void> => {
    if (taskId) {
      const outcome: TaskOutcome = await issueMoveController.pollMoveProgress(taskId);
      setIssueMoveOutcome(outcome);
      if (issueMoveController.isDone(outcome.status)) {
        if (taskId !== lastMoveCompletionTaskId) {
          setLastMoveCompletionTaskId(taskId);
          // console.log(`BulkOperationPanel: pollPollMoveOutcome: Move completed with taskId ${taskId}`);
          const options: FlagOptions = {
            id: taskId,
            type: outcome.status === 'COMPLETE' ? 'info' : 'error',
            title: outcome.status === 'COMPLETE' ? 'Move completed' : `Move ended with status ${outcome.status}`,
            description: outcome.status === 'COMPLETE' ? 'The issues have been moved successfully.' : 'There were problems moving the issues.',
            isAutoDismiss: outcome.status === 'COMPLETE',
            actions: outcome.status === 'COMPLETE' ? [] : [{
              text: 'Got it',
              onClick: async () => {
                flag.close();
              },
            }]
          }
          const flag = showFlag(options);
        }
        setCurrentMoveActivity(undefined);
        props.setStepCompletionState('move-or-edit', 'complete');
      } else {
        asyncPollMoveOutcome(taskId);
        props.setStepCompletionState('move-or-edit', 'incomplete');
      }
    } else {
      props.setMainWarningMessage(`No taskId provided for polling move outcome.`);
      console.warn(`BulkOperationPanel: pollPollMoveOutcome: No taskId provided, cannot poll for move outcome.`);
      setCurrentMoveActivity(undefined);
      props.setStepCompletionState('move-or-edit', 'incomplete');
    }
  }

  const onMoveIssues = async (): Promise<void> => {
    // Step 1: Initiate the move request...
    const destinationProjectId: string = props.selectedToProject.id;
    setIssueMoveRequestOutcome(undefined);
    setCurrentMoveActivity({taskId: 'non-jira-activity', description: 'Initiating move request...'});
    const targetIssueTypeIdsToTargetMandatoryFields = targetMandatoryFieldsProvider.buildIssueTypeIdsToTargetMandatoryFields();
    const initiateOutcome: IssueMoveRequestOutcome = await issueMoveController.initiateMove(
      destinationProjectId,
      props.selectedIssues,
      targetIssueTypeIdsToTargetMandatoryFields
    );
    setCurrentMoveActivity(undefined);
    console.log(`BulkOperationPanel: issue move request outcome: ${JSON.stringify(initiateOutcome, null, 2)}`);
    const taskOutcomeErrorMessage = buildTaskOutcomeErrorMessage(initiateOutcome);
    if (taskOutcomeErrorMessage) {
      const fullErrorMessage = `Failed to initiate move request: ${taskOutcomeErrorMessage}`;
      props.setMainWarningMessage(fullErrorMessage);
      console.warn(fullErrorMessage);
      setIssueMoveRequestOutcome(undefined);
      setCurrentMoveActivity(undefined);
    } else {
      // Step 2: Start polling for the outcome...
      setCurrentMoveActivity({taskId: initiateOutcome.taskId, description: 'Polling for move outcome...'});
      pollPollMoveOutcome(initiateOutcome.taskId);

      // Step 2: (now redundant since we switched to the polling approach) Wait for the outcome...
      // setIssueMoveRequestOutcome(initiateOutcome);
      // if (initiateOutcome.statusCode === 201 && initiateOutcome.taskId) {
      //   setCurrentIssueMoveTaskId(initiateOutcome.taskId);
      //   setIssueMoveOutcome(undefined);
      //   const issueMoveOutcome = await issueMoveController.awaitMoveCompletion(props.invoke, initiateOutcome.taskId);
      //   setIssueMoveOutcome(issueMoveOutcome);
      //   setCurrentIssueMoveTaskId(undefined);  
      // }
    }
  }

  const asyncPollMoveOutcome = async (taskId: string): Promise<void> => {
    setTimeout(async () => {
      await pollPollMoveOutcome(taskId);
    }, taskStatusPollPeriodMillis);
  }

  const renderStartMoveOrEditButton = () => {
    let waitingMessage = '';
    if (props.bulkOperationMode === 'Move') {
      const debugReasonForFieldMappingIncompleteness = false;
      const fieldMappingIncompletenessReason = debugReasonForFieldMappingIncompleteness ? targetMandatoryFieldsProvider.getFieldMappingIncompletenessReason() : '';
      waitingMessage = new WaitingMessageBuilder()
        .addCheck(fieldMappingIncompletenessReason === '', fieldMappingIncompletenessReason)
        .addCheck(props.fieldMappingsComplete, 'Field value mapping is not yet complete.')
        // .addCheck(allDefaultValuesProvided, 'Field value mapping is not yet complete.')
        .addCheck(!!props.selectedToProject && !!props.selectedToProject.id, 'Target project is not selected.')
        // .addCheck(selectedIssues.length > 0, 'No issues selected.')
        .addCheck(!currentMoveActivity, 'Current move activity is not yet complete.')
        .build();
    } else if (props.bulkOperationMode === 'Edit') {
      // const dd = fieldIdsToValues;
      const editValuesSpecified = editedFieldsModel.haveValuesBeenSpecified();
      waitingMessage = new WaitingMessageBuilder()
        .addCheck(editValuesSpecified, 'Waiting for at least one new field value.')
        .build();
    }
    const buttonEnabled = waitingMessage === '';
    return (
      <div 
        // key={`field-mapping-panel-${lastDataLoadTime}-${targetMandatoryFieldsProviderUpdateTime}-${allDefaultValuesProvided}`}
      >
        {renderPanelMessage(waitingMessage, {marginTop: '-6px', marginBottom: '20px'})}
        <Button
          // key={`move-edit-button-${lastDataLoadTime}-${targetMandatoryFieldsProviderUpdateTime}-${allDefaultValuesProvided}-${fieldIdsToValuesTime}`}
          appearance={buttonEnabled ? 'primary' : 'default'}
          isDisabled={!buttonEnabled}
          onClick={() => {
            if (props.bulkOperationMode === 'Move') {
              onMoveIssues();
            } else if (props.bulkOperationMode === 'Edit') {
              // onEditIssues();
            }
          }}
        >
          {props.bulkOperationMode} issues
        </Button>
      </div>
    );
  }

  const renderIssueMoveActivityIndicator = () => {
    if (currentMoveActivity || issueMoveOutcome) {
      const description = currentMoveActivity ? currentMoveActivity.description : issueMoveOutcome ? issueMoveOutcome.status : 'No activity';
      // https://mui.com/material-ui/api/linear-progress/
      const progressPercent = issueMoveOutcome ? issueMoveOutcome.progress : 0;
      return (
        <div>
          <Label htmlFor={''}>{description}</Label>
          <LinearProgress variant="determinate" value={progressPercent} color="secondary" />
        </div>
      );
    } else {
      return null;
    }
  }

  const renderIssueMoveRequestOutcome = () => {
    if (issueMoveRequestOutcome) {
      const renderedErrors = issueMoveRequestOutcome.errors ? issueMoveRequestOutcome.errors.map((error: Error, index: number) => {
        return (
          <div key={`issue-move-request-error-${index}`} className="error-message">
            {error.message}
          </div>
        );
      }) : null;
      return (
        <div>
          {renderedErrors}
        </div>
      );
    } else {
      return null;
    }
  }

  const renderIssueMoveOutcome = () => {
    if (issueMoveOutcome) {
      const moveResult: IssueMoveOutcomeResult | undefined = issueMoveOutcome.result;
      const movedCount = moveResult ? moveResult.successfulIssues.length : -1;
      const failedCount = moveResult ? moveResult.totalIssueCount - movedCount : -1;
      const renderedIssuesMovedResult = issueMoveOutcome.result ? <span># issues moved: <Lozenge appearance="success">{movedCount}</Lozenge></span> : null;
      const renderedIssuesNotMovedResult = issueMoveOutcome.result ? <span># issues not moved: <Lozenge appearance="removed">{failedCount}</Lozenge></span> : null;
      const renderedOutcomeDebugJson = showDebug ? <pre>{JSON.stringify(issueMoveOutcome, null, 2)}</pre> : null;
      const progressPercent = issueMoveOutcome.progress ?? 0;
      const renderedProgress = <div>Progress: {progressPercent}%</div>;
      return (
        <div key={`issue-move-outcome-${props.allDefaultValuesProvided}`} style={{margin: '20px 0px'}}>
          <Label htmlFor="none">Issues moved to the {props.selectedToProject?.name} ({props.selectedToProject?.key}) project</Label>
          <ul>
            <li>Status: <TaskStatusLozenge status={issueMoveOutcome.status} /></li>
            <li>{renderedIssuesMovedResult}</li>
            <li>{renderedIssuesNotMovedResult}</li>
            <li>{renderedProgress}</li>
          </ul>
          {renderedOutcomeDebugJson}
        </div>
      );
    } else {
      return null;
    }
  }

  return (
    <div >
      <FormSection>
        {renderStartMoveOrEditButton()}
      </FormSection>
      <FormSection>
        {renderIssueMoveActivityIndicator()}
      </FormSection>
      {renderIssueMoveRequestOutcome()}
      {renderIssueMoveOutcome()}
    </div>
  );

}
