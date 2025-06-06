import React, { useEffect } from 'react';
import Button from '@atlaskit/button/new';
import { WaitingMessageBuilder } from 'src/controller/WaitingMessageBuilder';
import importModel from 'src/model/importModel';
import { CompletionState } from 'src/types/CompletionState';
import { ImportColumnValueType } from 'src/types/ImportColumnValueType';
import { ObjectMapping } from 'src/types/ObjectMapping';
import { on } from 'events';
import { renderPanelMessage } from 'src/widget/renderPanelMessage';

const showDebug = false;

export type ImportIssuesPanelProps = {
  columnMappingCompletionState: CompletionState;
  importIssuesCompletionState: CompletionState;
}

const ImportIssuesPanel = (props: ImportIssuesPanelProps) => {

  const [waitingMessage, setWaitingMessage] = React.useState<string>('');
  const [columnIndexesToColumnNames, setColumnIndexesToColumnNames] = React.useState<any>({});
  const [columnNamesToValueTypes, setColumnNamesToValueTypes] = React.useState<ObjectMapping<ImportColumnValueType>>({});

  const updateState = async (): Promise<void> => {
    console.log('ImportIssuesPanel.updateState called');
    console.log(' * columnMappingCompletionState:', props.columnMappingCompletionState);
    console.log(' * importIssuesCompletionState:', props.importIssuesCompletionState);
    const waitingMessage = new WaitingMessageBuilder()
      .addCheck(props.columnMappingCompletionState === 'complete', 'Waiting for column mapping.')
      .build();
    setWaitingMessage(waitingMessage);
    setColumnIndexesToColumnNames(importModel.getColumnIndexesToColumnNames());
    setColumnNamesToValueTypes(importModel.getColumnNamesToValueTypes());
  }

  useEffect(() => {
    updateState();
  }, [props.columnMappingCompletionState, props.importIssuesCompletionState]);

  const onImportIssuesButtonClick = async () => {

  }

  const renderImportButton = () => {
    const issueCount = importModel.getIssueCount();
    const buttonLabel = issueCount === 0 ? 'Import issues' : `Import ${issueCount} ${issueCount === 1 ? 'issue' : 'issues'}`;
    return (
      <Button
        appearance="primary"
        isDisabled={props.columnMappingCompletionState !== 'complete'}
        onClick={onImportIssuesButtonClick}
      >
        {buttonLabel}
      </Button>
    );
  };

  return (
    <div className="step-panel-content-container">
      {renderPanelMessage(waitingMessage)}
      {renderImportButton()}
    </div>
  )

}

export default ImportIssuesPanel;
