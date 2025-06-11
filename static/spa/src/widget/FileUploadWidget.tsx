import React, { useState } from "react";
import "./FileUploadWidget.css";
import UploadIcon from '@atlaskit/icon/core/upload';
import ClearIcon from '@atlaskit/icon/core/close';
import SuccessSymbol from "./SuccessSymbol";

export type FileUploadDropTargetProps = {
  message: string;
  width: string;
  height: string;
  allowMultiple: boolean;
  disabled?: boolean; // Optional prop to disable the widget
  allowedFileTypes: string[]; // e.g. ['.pdf', '.docx', '.pptx', '.txt', '.xlsx']
  onFilesSelected: (files: File[]) => void;
}

const FileUploadDropTarget = (props: FileUploadDropTargetProps) => {
  const [files, setFiles] = useState<File[]>([]);

  const onFileChange = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles = props.allowMultiple ? files.concat(Array.from(selectedFiles)) : [selectedFiles[0]];
      setFiles(newFiles);
      props.onFilesSelected(newFiles);
    } else {
      props.onFilesSelected([]);
    }
  };

  const onDropEvent = (event) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const newFiles = props.allowMultiple ? files.concat(Array.from(droppedFiles)) : [droppedFiles[0]];
      setFiles(newFiles);
      props.onFilesSelected(newFiles);
    } else {
      props.onFilesSelected([]);
    }
  };

  const onRemoveFile = (index: number) => {
    const prevFiles = [...files];
    const newFiles = prevFiles.filter((_, i) => i !== index);
    setFiles(newFiles);
    props.onFilesSelected(newFiles);
  };

  return (
    <section className="drag-drop">
      <div
        className={`document-uploader ${
          files.length > 0 ? "upload-box active" : "upload-box"
        }`}
        onDrop={onDropEvent}
        onDragOver={(event) => event.preventDefault()}
      >
        <>
          <label htmlFor="browse" className="clickable">
            <div className="upload-info" style={{width: props.width, height: props.height}}>
              <div style={{width: 'fit-content', textAlign: 'center', margin: '0 auto'}}>
                <UploadIcon label={"upload"} />
                <p><strong>{props.message ?? `Drag and drop your files here`}</strong></p>
                <p>
                  Supported file types: {props.allowedFileTypes.join(", ")}
                </p>
              </div>
            </div>
            <input
              key={`file-input-${files.length}`}
              id="browse"
              type="file"
              hidden={true}
              disabled={props.disabled}
              onChange={onFileChange}
              accept={props.allowedFileTypes.join(", ")}
              multiple={props.allowMultiple}
            />
            <div style={{width: 'fit-content', textAlign: 'center', margin: '0 auto'}}>
              <strong>or click to browse files</strong>
            </div>
          </label>
        </>

        {files.length > 0 && (
          <div className="file-list">
            <div className="file-list__container">
              {files.map((file, index) => (
                <div className="file-item" key={index}>
                  <div className="file-info">
                    <p>{file.name}</p>
                  </div>
                  <div className="file-actions" onClick={() => onRemoveFile(index)}>
                    <ClearIcon label={"clear"} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="success-message important-message">
            <p><SuccessSymbol/> {files.length} file{files.length > 1 ? 's' : ''} selected</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FileUploadDropTarget;
