import { FormSection } from '@atlaskit/form';
import React, { useEffect } from 'react';
import { WaitingMessageBuilder } from 'src/controller/WaitingMessageBuilder';
import importModel from 'src/model/importModel';
import { CompletionState } from 'src/types/CompletionState';
import { ImportColumnValueType } from 'src/types/ImportColumnValueType';
import { IssueType } from 'src/types/IssueType';
import { ObjectMapping } from 'src/types/ObjectMapping';
import { Project } from 'src/types/Project';
import IssueTypeSelect from 'src/widget/IssueTypeSelect';
import ProjectsSelect from 'src/widget/ProjectsSelect';
import { renderPanelMessage } from 'src/widget/renderPanelMessage';

const showDebug = false;

export type ImportProjectAndIssueTypeSelectionPanelProps = {
  fileUploadCompletionState: CompletionState,
  projectAndIssueTypeSelectionCompletionState: CompletionState
  modelUpdateTimestamp: number;
}

const ImportProjectAndIssueTypeSelectionPanel = (props: ImportProjectAndIssueTypeSelectionPanelProps) => {

  const getSelectProjectFromProps = (): Project[] => {
    const selectedProject = importModel.getSelectedProject();
    if (selectedProject) {
      return [selectedProject];
    } else {
      return [];
    }
  }

  const [waitingMessage, setWaitingMessage] = React.useState<string>('');
  const [selectedProject, setSelectedProject] = React.useState<undefined | Project>(importModel.getSelectedProject());
  const [columnNamesToValueTypes, setColumnNamesToValueTypes] = React.useState<ObjectMapping<ImportColumnValueType>>({});

  const updateState = async (): Promise<void> => {
    // console.log('ImportProjectAndIssueTypeSelectionPanel.updateState called');
    // console.log(' * fileUploadCompletionState:', props.fileUploadCompletionState);
    // console.log(' * projectAndIssueTypeSelectionCompletionState:', props.projectAndIssueTypeSelectionCompletionState);
    const waitingMessage = new WaitingMessageBuilder()
      .addCheck(props.fileUploadCompletionState === 'complete', 'Waiting for file upload.')
      .build();
    setWaitingMessage(waitingMessage);
    // setColumnIndexesToColumnNames(importModel.getColumnIndexesToColumnNames());
    // setColumnNamesToValueTypes(importModel.getColumnNamesToValueTypes());
  }

  // useEffect(() => {
  //   console.log('ImportProjectAndIssueTypeSelectionPanel mounted');
  // }, []);

  // useEffect(() => {
  //   updateState();
  // }, [props.fileUploadCompletionState, props.projectAndIssueTypeSelectionCompletionState]);

  useEffect(() => {
    updateState();
  }, [props.modelUpdateTimestamp]);

  const onProjectsSelect = async (selectedProjects: Project[]): Promise<void> => {
    // Step 1: First make sure the selected issue type is reset.
    await importModel.setSelectedIssueType(undefined);
    // Step 2: Then set the selected project.
    await importModel.setSelectedProject(selectedProjects[0]);
  }

  const onIssueTypeSelect = async (selectedIssueType: undefined | any): Promise<void> => {
    await importModel.setSelectedIssueType(selectedIssueType);
  }

  const renderProjectSelect = () => {
    return (
      <FormSection>
        <ProjectsSelect 
          label={"Project to import work items to"}
          isMulti={false}
          isClearable={true}
          isDisabled={props.fileUploadCompletionState !== 'complete'}
          selectedProjects={selectedProject ? [selectedProject] : []}
          onProjectsSelect={onProjectsSelect}
        />
      </FormSection>
    );
  }

  const renderIssueTypeSelect = () => {
    const selectedProject = importModel.getSelectedProject();
    const selectedProjectCreateIssueMetadata = importModel.getSelectedProjectCreateIssueMetadata();
    if (selectedProject && selectedProjectCreateIssueMetadata) {
      const selectedIssueype = importModel.getSelectedIssueType();
      const selectableIssueTypes: IssueType[] = [];
      for (const issueTypeMetadata of selectedProjectCreateIssueMetadata.issuetypes) {
        const issueType: IssueType = {
          id: issueTypeMetadata.id,
          name: issueTypeMetadata.name,
          description: issueTypeMetadata.description,
          iconUrl: '',
          untranslatedName: '',
          subtask: false,
          hierarchyLevel: 0
        };
        selectableIssueTypes.push(issueType);
      }
      return (
        <FormSection>
          <IssueTypeSelect 
            key={`issue-type-select-${selectedProject ? selectedProject.id : ''}`}
            label={"Issue type"}
            isClearable={true}
            isDisabled={props.fileUploadCompletionState !== 'complete' || selectedProjectCreateIssueMetadata === undefined}
            selectedIssueType={selectedIssueype}
            selectableIssueTypes={selectableIssueTypes}
            onIssueTypeSelect={onIssueTypeSelect} 
          />
        </FormSection>
      );
    } else {
      return null;
    }
  }

  return (
    <div>
      {renderPanelMessage(waitingMessage)}
      {renderProjectSelect()}
      {renderIssueTypeSelect()}
    </div>
  )

}

export default ImportProjectAndIssueTypeSelectionPanel;
