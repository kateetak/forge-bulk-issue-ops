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

  // const [fileUploadWebtriggerUrl, setFileUploadWebtriggerUrl] = React.useState<string>('');
  const [file, setFile] = React.useState<any>(null);
  const [fileLines, setFileLines] = React.useState<string[]>([]);
  const [columnIndexesToColumnNames, setColumnIndexesToColumnNames] = React.useState<any>({});
  const [columnNamesToValueTypes, setColumnNamesToValueTypes] = React.useState<ObjectMapping<ImportColumnValueType>>({});

  // const determineWebtriggerUrl = async (): Promise<void> => {
  //   const webtriggerUrl = await invoke('get-file-upload-webtrigger-url') as string;
  //   setFileUploadWebtriggerUrl(webtriggerUrl);
  // }

  useEffect(() => {
    console.log('FileUploadPanel mounted');
    // determineWebtriggerUrl();
  }, []);

  const onImportIssues = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const uploadResponse = await invoke('onFileUpload', { fileLines: fileLines }) as Response;
    if (uploadResponse.ok) {
      console.log('File uploaded successfully');
      const responseData = await uploadResponse.json();
      console.log('Response data:', responseData);
    } else {
      console.error('File upload failed:', uploadResponse.statusText);
    }
  }

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('onFileSelected called');
    console.log('event:', event);
    const file = event.target.files[0];
    await importModel.onFileSelection(file);
    setColumnIndexesToColumnNames(importModel.getColumnIndexesToColumnNames());
    setColumnNamesToValueTypes(importModel.getColumnNamesToValueTypes());
  }

  const renderFileUploadWidget = () => {
    return (
      <div style={{margin: '20px 0px'}}>
        <input
          id="file-select"
          type="file"
          // disabled={!fileUploadWebtriggerUrl}
          accept=".csv" 
          onChange={onFileSelected}
        />
      </div>
    )
  }

  const renderFieldTypeDetections = () => {
    const columnIndexKeys = Object.keys(columnIndexesToColumnNames);
    const columnNames = Object.keys(columnNamesToValueTypes);
    if (columnIndexKeys.length && columnNames.length) {
      const renderedRows: any[] = [];
      columnIndexKeys.forEach((index) => {
        const columnName = columnIndexesToColumnNames[index];
        const columnValueType = columnNamesToValueTypes[columnName] || '????';
        renderedRows.push(
          <div key={`column-${index}`} style={{margin: '5px 0'}}>
            <strong>{columnName}:</strong> <Lozenge>{columnValueType}</Lozenge>
          </div>
        );
      });
      return (
        <div style={{margin: '20px 0px'}}>
          <h5>Detected field types:</h5>
          {renderedRows}
        </div>
      );
    } else {
      return (
        <div style={{margin: '20px 0px'}}>
          <div>columnIndexKeys: {columnIndexKeys.join(', ')}</div>
          <div>columnNames: {columnNames.join(', ')}</div>
        </div>
      );
    }
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
        {/* <div>
          fileUploadWebtriggerUrl: {fileUploadWebtriggerUrl ?? '????'}
        </div> */}
        <div style={{margin: '10px 0px'}}>
          <h5>columnNamesToValueTypes:</h5>
          <pre>
            {JSON.stringify(columnNamesToValueTypes, null, 2)}
          </pre>
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
      {renderFieldTypeDetections()}
      {renderDebug()}
    </div>
  )

}

export default FileUploadPanel;
