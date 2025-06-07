import React, { useEffect } from 'react';
import Button from '@atlaskit/button/new';
import { LinearProgress } from '@mui/material';
import { WaitingMessageBuilder } from 'src/controller/WaitingMessageBuilder';
import importModel from 'src/model/importModel';
import { CompletionState } from 'src/types/CompletionState';
import { ImportColumnValueType } from 'src/types/ImportColumnValueType';
import { ObjectMapping } from 'src/types/ObjectMapping';
import { renderPanelMessage } from 'src/widget/renderPanelMessage';
import { ImportInstructions, importIssues } from 'src/controller/issueImporter';
import { ProgressInfo } from 'src/types/ProgressInfo';
import { Label } from '@atlaskit/form';

const showDebug = false;

export type ImportIssuesPanelProps = {
  columnMappingCompletionState: CompletionState;
  importIssuesCompletionState: CompletionState;
}

const ImportIssuesPanel = (props: ImportIssuesPanelProps) => {

  const [waitingMessage, setWaitingMessage] = React.useState<string>('');
  const [columnIndexesToColumnNames, setColumnIndexesToColumnNames] = React.useState<any>({});
  const [columnNamesToValueTypes, setColumnNamesToValueTypes] = React.useState<ObjectMapping<ImportColumnValueType>>({});
  const [progressInfo, setProgressInfo] = React.useState<ProgressInfo>({
    state: 'waiting',
    percentComplete: 0
  });

  const updateState = async (): Promise<void> => {
    console.log('ImportIssuesPanel.updateState called');
    console.log(' * columnMappingCompletionState:', props.columnMappingCompletionState);
    console.log(' * importIssuesCompletionState:', props.importIssuesCompletionState);
    const waitingMessage = new WaitingMessageBuilder()
      .addCheck(props.columnMappingCompletionState === 'complete', 'Waiting for column mapping.')
      .build();
    setWaitingMessage(waitingMessage);
    setColumnIndexesToColumnNames(importModel.getColumnIndexesToColumnNames());
    // setColumnNamesToValueTypes(importModel.getColumnNamesToValueTypes());
  }

  useEffect(() => {
    updateState();
  }, [props.columnMappingCompletionState, props.importIssuesCompletionState]);

  const onImportProgressUpdate = async (importCount: number, lineSkipCount: number, failCount: number, totalCount: number): Promise<void> => {
    console.log(`ImportIssuesPanel.onImportProgressUpdate called with importCount = ${importCount}, lineSkipCount = ${lineSkipCount}, failCount = ${failCount}, totalCount = ${totalCount}`);
    const progressInfo: ProgressInfo = {
      state: 'in_progress',
      percentComplete: totalCount > 0 ? Math.round((importCount + lineSkipCount + failCount) / totalCount * 100) : 0,
      message: `Imported ${importCount} of ${totalCount} (${lineSkipCount} skipped, ${failCount} failed)`
    };
    setProgressInfo(progressInfo);
    if (progressInfo.percentComplete === 100) {
      importModel.signalImportComplete();
    }
  }

  const onImportIssuesButtonClick = async () => {
    console.log('ImportIssuesPanel.onImportIssuesButtonClick called');
    const importInstructions: ImportInstructions = {
      targetProject: importModel.getSelectedProject(),
      targetIssueType: importModel.getSelectedIssueType(),
      columnNamesToIndexes: importModel.getColumnNamesToIndexes(),
      fieldKeysToMatchInfos: importModel.getFieldKeysToMatchInfos(),
      csvParseResult: importModel.getCsvParseResult(),
    }
    importIssues(importInstructions, onImportProgressUpdate);
  }

  const renderImportButton = () => {
    const issueCount = importModel.getIssueCount();
    const buttonLabel = issueCount === 0 ? 'Import work items' : `Import ${issueCount} ${issueCount === 1 ? 'work item' : 'work items'}`;
    const allowImportStart = props.columnMappingCompletionState === 'complete' && progressInfo.state === 'waiting';
    return (
      <Button
        appearance="primary"
        isDisabled={!allowImportStart}
        onClick={onImportIssuesButtonClick}
      >
        {buttonLabel}
      </Button>
    );
  };

  const renderProgressIndicator = () => {
    if (progressInfo.state === 'waiting') {
      return null;
    } else {
      return (
        <div>
          <Label htmlFor={''}>{progressInfo.message ?? ''}</Label>
          <LinearProgress variant="determinate" value={progressInfo.percentComplete} color="secondary" />
        </div>
      );
    }
  }

  return (
    <div className="step-panel-content-container">
      {renderPanelMessage(waitingMessage)}
      {renderImportButton()}
      {renderProgressIndicator()}
    </div>
  )

}

export default ImportIssuesPanel;
