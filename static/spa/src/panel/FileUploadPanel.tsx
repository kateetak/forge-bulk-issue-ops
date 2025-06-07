import React, { useEffect } from 'react';
import { invoke } from '@forge/bridge';
import Button from '@atlaskit/button/new';
import { ObjectMapping } from 'src/types/ObjectMapping';
import { ImportColumnValueType } from 'src/types/ImportColumnValueType';
import importModel from '../model/importModel';
import { CompletionState } from 'src/types/CompletionState';
import Lozenge from '@atlaskit/lozenge';

const showDebug = false;

export type FileUploadPanelProps = {
  completionState: CompletionState
}

const FileUploadPanel = (props: FileUploadPanelProps) => {

  const [file, setFile] = React.useState<any>(null);
  const [fileLines, setFileLines] = React.useState<string[]>([]);
  const [columnIndexesToColumnNames, setColumnIndexesToColumnNames] = React.useState<any>({});

  useEffect(() => {
    console.log('FileUploadPanel mounted');
  }, []);

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('onFileSelected called');
    console.log('event:', event);
    const file = event.target.files[0];
    const fileParseResult = await importModel.onFileSelection(file);

    if (!fileParseResult.success) {
      // TODO: Handle failure
    }

    setColumnIndexesToColumnNames(importModel.getColumnIndexesToColumnNames());
  }

  const renderFileUploadWidget = () => {
    return (
      <div style={{margin: '20px auto', width: 'fit-content'}}>
        <input
          id="file-select"
          type="file"
          accept=".csv" 
          onChange={onFileSelected}
        />
      </div>
    )
  }

  const renderFileLines = () => {
    if (fileLines.length === 0) {
      if (file) {
        return <div>No file lines to display</div>;
      } else {
        return null;
      }
    } else {
      const renderedLines = fileLines.map((line, index) => (
        <div key={index}>
          {line}
        </div>
      ));
      return (
        <div>
          <h5>File Lines:</h5>
          {renderedLines}
        </div>
      );
    }
  }

  const renderDebug = () => {
    if (!showDebug) {
      return null;
    }
    return (
      <div style={{margin: '20px 0px'}}>
        <h3>Debug Information:</h3>
        <div style={{margin: '20px 0px'}}>
          {renderFileLines()}
        </div>
        <div style={{margin: '10px 0px'}}>
          <h5>columnIndexesToColumnNames:</h5>
          <pre>
            {JSON.stringify(columnIndexesToColumnNames, null, 2)}
          </pre>
        </div>
        <div style={{margin: '10px 0px'}}>
          <h5>File:</h5>
          <pre>
            {JSON.stringify({ file, fileLines }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div>
      {renderFileUploadWidget()}
      {renderDebug()}
    </div>
  )

}

export default FileUploadPanel;
