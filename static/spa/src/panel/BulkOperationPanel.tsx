import React, { useEffect, useState } from 'react';
import Button from '@atlaskit/button/new';
import LabelsSelect from '../widget/LabelsSelect';
import { Project } from '../types/Project';
import { FormSection, Label } from '@atlaskit/form';
import Toggle from '@atlaskit/toggle';
import IssueTypesSelect from '../widget/IssueTypesSelect';
import { IssueType } from '../types/IssueType';
import { IssueSearchInfo } from '../types/IssueSearchInfo';
import { Issue } from '../types/Issue';
import { LoadingState } from '../types/LoadingState';
import { nilIssueSearchInfo } from '../model/nilIssueSearchInfo';
import { TaskOutcome } from '../types/TaskOutcome';
import { IssueSearchParameters } from '../types/IssueSearchParameters';
import jiraUtil from '../controller/jiraUtil';
import JQLInputPanel from '../widget/JQLInputPanel';
import ProjectsSelect from '../widget/ProjectsSelect';
import jiraDataModel from '../model/jiraDataModel';
import { DataRetrievalResponse } from '../types/DataRetrievalResponse';
import { buildFieldMappingsForProject } from '../controller/bulkOperationsUtil';
import { ProjectFieldMappings } from '../types/ProjectFieldMappings';
import FieldMappingPanel, { FieldMappingsState, nilFieldMappingsState } from './FieldMappingPanel';
import targetProjectFieldsModel from 'src/controller/TargetProjectFieldsModel';
import { IssueSelectionPanel, IssueSelectionState, IssueSelectionValidity } from '../widget/IssueSelectionPanel';
import bulkOperationRuleEnforcer from 'src/extension/bulkOperationRuleEnforcer';
import { allowBulkEditsAcrossMultipleProjects, allowBulkEditsFromMultipleProjects, allowBulkMovesFromMultipleProjects, filterModeDefault, showLabelsSelect } from '../extension/bulkOperationStaticRules';
import { BulkOperationMode } from 'src/types/BulkOperationMode';
import IssueTypeMappingPanel from './IssueTypeMappingPanel';
import { ObjectMapping } from 'src/types/ObjectMapping';
import bulkIssueTypeMappingModel from 'src/model/bulkIssueTypeMappingModel';
import { renderPanelMessage } from 'src/widget/PanelMessage';
import { WaitingMessageBuilder } from 'src/controller/WaitingMessageBuilder';
import PanelHeader from 'src/widget/PanelHeader';
import { CompletionState } from 'src/types/CompletionState';
import { FieldEditsPanel } from './FieldEditsPanel';
import editedFieldsModel from 'src/model/editedFieldsModel';
import { MoveOrEditPanel } from './MoveOrEditPanel';
import { Activity } from 'src/types/Activity';
import { StepName } from 'src/model/BulkOperationsWorkflow';
import FileUploadPanel from './FileUploadPanel';
import { BulkOpsModel, CompletionStateChangeInfo } from 'src/model/BulkOpsModel';
import ImportColumnMappingPanel from './ImportColumnMappingPanel';
import ImportIssuesPanel from './ImportIssuesPanel';
import ImportProjectAndIssueTypeSelectionPanel from './ImportProjectAndIssueTypeSelectionPanel';
import importModel from 'src/model/importModel';
import { bulkImportEnabled } from 'src/model/config';
import { InvocationResult } from 'src/types/InvocationResult';

const showDebug = false;
const showCompletionStateDebug = false;
const implyAllIssueTypesWhenNoneAreSelected = true;
const autoShowFieldMappings = true;

export type BulkOperationPanelProps<StepNameSubtype extends StepName> = {
  bulkOperationMode: BulkOperationMode;
  bulkOpsModel: BulkOpsModel<StepNameSubtype>;
}

type DebugInfo = {
  projects: Project[];
  issueTypes: IssueType[];
}

type FilterMode = 'basic' | 'advanced';

const BulkOperationPanel = (props: BulkOperationPanelProps<any>) => {

  const [stepNamesToCompletionStates, setStepNamesToCompletionStates] = useState<ObjectMapping<CompletionState>>({});
  const [modelUpdateTimestamp, setLastModelUpdateTime] = useState<number>(0);
  const [stepSequence, setStepSequence] = useState<StepName[]>([])
  const [bulkOperationMode, setBulkOperationMode] = useState<BulkOperationMode>(props.bulkOperationMode);
  const [mainWarningMessage, setMainWarningMessage] = useState<string>('');
  const [lastDataLoadTime, setLastDataLoadTime] = useState<number>(0);
  const [filterMode, setFilterMode] = useState<FilterMode>(filterModeDefault);
  const [enteredJql, setEnteredJql] = useState<string>('');
  const [allIssueTypes, setAllIssueTypes] = useState<IssueType[]>([]);
  const [issueLoadingState, setIssueLoadingState] = useState<LoadingState>('idle');
  const [selectedFromProjects, setSelectedFromProjects] = useState<Project[]>([]);
  const [selectedFromProjectsTime, setSelectedFromProjectsTime] = useState<number>(0);
  const [selectedToProject, setSelectedToProject] = useState<undefined | Project>(undefined);
  const [selectedToProjectTime, setSelectedToProjectTime] = useState<number>(0);
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<IssueType[]>([]);
  const [selectedIssueTypesTime, setSelectedIssueTypesTime] = useState<number>(0);
  const [issueSearchInfo, setIssueSearchInfo] = useState<IssueSearchInfo>(nilIssueSearchInfo);
  const [issueSearchInfoTime, setIssueSearchInfoTime] = useState<number>(0);
  const [issueSelectionState, setIssueSelectionState] = useState<IssueSelectionState>({selectedIssues: [], selectionValidity: 'invalid-no-issues-selected'})
  const [selectedIssuesTime, setSelectedIssuesTime] = useState<number>(0);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedLabelsTime, setSelectedLabelsTime] = useState<number>(0);
  const [allIssueTypesMapped, setAllIssueTypesMapped] = useState<boolean>(false);
  const [fieldMappingsState, setFieldMappingsState] = useState<FieldMappingsState>(nilFieldMappingsState);
  const [allDefaultValuesProvided, setAllDefaultValuesProvided] = useState<boolean>(false);
  const [currentFieldMappingActivity, setCurrentFieldMappingActivity] = useState<undefined | Activity>(undefined);
  const [selectableIssueTypes, setSelectableIssueTypes] = useState<IssueType[]>([]);
  const [fieldIdsToValuesTime, setFieldIdsToValuesTime] = React.useState<number>(0);
  const [fieldMappingsComplete, setFieldMappingsComplete] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({ projects: [], issueTypes: [] });

  useEffect(() => {
    setBulkOperationMode(props.bulkOperationMode);
  }, [props.bulkOperationMode]);

  const onEditedFieldsModelChange = (fieldId: string, value: any) => {
    setFieldIdsToValuesTime(Date.now());
  }

  const onImportModelStepCompletionStateChange = (completionStateChangeInfo: CompletionStateChangeInfo) => {
    const stepName = completionStateChangeInfo.stepName;
    const completionState = completionStateChangeInfo.completionState;
    console.log(`BulkOperationPanel.onImportModelStepCompletionStateChange: step "${stepName}" is now "${completionState}"`);
    setStepNamesToCompletionStates(prevState => ({
      ...prevState,
      [stepName]: completionState
    }));
  }

  const onModelUpdateChange = (modelUpdateTimestamp: number) => {
    setLastModelUpdateTime(modelUpdateTimestamp);
  }

  useEffect(() => {
    editedFieldsModel.registerValueEditsListener(onEditedFieldsModelChange);
    props.bulkOpsModel.registerStepCompletionStateChangeListener(onImportModelStepCompletionStateChange);
    props.bulkOpsModel.registerModelUpdateChangeListener(onModelUpdateChange);
    return () => {
      editedFieldsModel.unregisterValueEditsListener(onEditedFieldsModelChange);
      props.bulkOpsModel.unregisterStepCompletionStateChangeListener(onImportModelStepCompletionStateChange);
      props.bulkOpsModel.unregisterModelUpdateChangeListener(onModelUpdateChange);
    };
  }, []);

  const setIssueMoveOutcome = (issueMoveOutcome: undefined | TaskOutcome) => {
    // Do nothing - this is now obsolte
  }

  const isStepApplicableToBulkOperationMode = (stepName: StepName): boolean => {
    const bulkOperationMode = props.bulkOperationMode;
    const stepSequence = props.bulkOpsModel.getStepSequence();
    if (!stepSequence) {
      console.warn(`BulkOperationPanel: isStepApplicableToBulkOperationMode: No step sequence defined for bulk operation mode "${bulkOperationMode}".`);
      return false;
    }
    const stepIndex = stepSequence.indexOf(stepName);
    return stepIndex >= 0;
  }

  const defineSteps = () => {
    const stepSequence = props.bulkOpsModel.getStepSequence();
    setStepSequence(stepSequence);
  }

  const setStepCompletionState = (stepName: StepName, completionState: CompletionState) => {
    setStepNamesToCompletionStates(prevState => ({
      ...prevState,
      [stepName]: completionState
    }));
  }

  const onEditsValidityChange = (valid: boolean) => {
    setStepCompletionState('edit-fields', valid ? 'complete' : 'incomplete');
  }

  const getStepCompletionState = (stepName: StepName): CompletionState => {
    return stepNamesToCompletionStates[stepName];
  }

  const isStepComplete = (stepName: StepName): boolean => {
    const completionState = getStepCompletionState(stepName);
    return completionState === 'complete';
  }

  const arePrerequisiteStepsComplete = (priorToStepName: StepName): boolean => {
    let complete = true;
    for (const stepName of stepSequence) {
      if (stepName === priorToStepName) {
        break; // Stop checking once we reach the step we're interested in
      }
      const completionState = stepNamesToCompletionStates[stepName];
      if (isStepApplicableToBulkOperationMode(stepName)) {
        if (completionState !== 'complete') {
          complete = false;
          break;
        }
      }
    }
    return complete;
  }

  const renderStepCompletionState = (): JSX.Element => {
    const renderedStates = stepSequence.map((stepName: StepName) => {
      const completionState = stepNamesToCompletionStates[stepName];
      return (
        <li key={stepName}>
          {`${stepName}: `} 
          {isStepApplicableToBulkOperationMode(stepName) ? completionState === 'complete' ? 'COMPLETE' : 'INCOMPLETE' : 'N/A'}
        </li>
      );
    });
    return (
      <div>
        <ul>
          {renderedStates}
        </ul>
      </div>
    );
  }

  const clearFieldMappingsState = () => {
    setFieldMappingsState(nilFieldMappingsState);
    targetProjectFieldsModel.setProjectFieldMappings(nilFieldMappingsState.projectFieldMappings);
  }

  const isFieldMappingsComplete = () => {
    const allFieldValuesSet = targetProjectFieldsModel.areAllFieldValuesSet();
    return fieldMappingsState.dataRetrieved && allFieldValuesSet;
  }

  const retrieveAndSetDebugInfo = async (): Promise<void> => {
    const projectSearchInfo = await jiraDataModel.pageOfProjectSearchInfo();
    const issueTypesInvocationResult: InvocationResult<IssueType[]> = await jiraDataModel.getIssueTypes();
    const debugInfo: DebugInfo = {
      projects: projectSearchInfo.values,
      issueTypes: issueTypesInvocationResult.ok ? issueTypesInvocationResult.data : []
    }
    setDebugInfo(debugInfo);
  }

  const initialiseSelectedIssueTypes = async (allowedRetryCount: number): Promise<void> => {
    const issueTypesInvocationResult: InvocationResult<IssueType[]> = await jiraDataModel.getIssueTypes();
    if (issueTypesInvocationResult.ok) {
      setAllIssueTypes(allIssueTypes);
      setLastDataLoadTime(Date.now());
      if (selectedIssueTypesTime === 0) {
        setSelectedIssueTypes(allIssueTypes);
      } else {
        // Don't override if there's already a selection
      }
    } else if (allowedRetryCount > 0) {
      console.warn(`BulkOperationPanel: initialiseSelectedIssueTypes: Error retrieving issue types: ${issueTypesInvocationResult.errorMessage}`);
      // Delay and retry...
      setTimeout(() => initialiseSelectedIssueTypes(allowedRetryCount - 1), 2000);
    } else {
      console.error(`BulkOperationPanel: initialiseSelectedIssueTypes: Max retries exceeded: ${issueTypesInvocationResult.errorMessage}`);
    }
  }

  useEffect(() => {
    defineSteps();
    // updateAllProjectInfo();
    initialiseSelectedIssueTypes(2);
    if (showDebug) {
      retrieveAndSetDebugInfo();
    }
  }, []);

  const filterProjectsForFromSelection = async (projectsToFilter: Project[]): Promise<Project[]> => {
    const allowableToProjects = await bulkOperationRuleEnforcer.filterSourceProjects(projectsToFilter, bulkOperationMode);
    return allowableToProjects;
  }

  const filterProjectsForToSelection = async (projectsToFilter: Project[]): Promise<Project[]> => {
    const allowableToProjects = await bulkOperationRuleEnforcer.filterTargetProjects(issueSelectionState.selectedIssues, projectsToFilter);
    return allowableToProjects;
  }

  const onClearMainWarningMessage = () => {
    setMainWarningMessage('');
  }

  const computeSelectionValidity = (selectedIssues: Issue[]): IssueSelectionValidity => {
      if (selectedIssues.length === 0) {
        return "invalid-no-issues-selected";
      }
      const multipleProjectsDetected = jiraUtil.countProjectsByIssues(selectedIssues) > 1;
      const multipleIssueTypesDetected = jiraUtil.countIssueTypesByIssues(selectedIssues) > 1;
      if (props.bulkOperationMode === 'Move' && !allowBulkMovesFromMultipleProjects) {
        // Don't allow moves from multiple projects
        if (multipleProjectsDetected) {
          return "multiple-projects";
        }
      }
      if (props.bulkOperationMode === 'Move') {
        // Don't allow multiple issue types to be selected when moving issues
        if (multipleIssueTypesDetected) {
          return "multiple-issue-types";
        }
      }
      if (props.bulkOperationMode === 'Edit' && !allowBulkEditsFromMultipleProjects) {
        // Don't allow edits from multiple projects
        if (multipleProjectsDetected) {
          return "multiple-projects";
        }
      }
      if (props.bulkOperationMode === 'Edit') {
        // Don't allow multiple issue types to be selected when editing issues
        if (multipleIssueTypesDetected) {
          return "multiple-issue-types";
        }
      }
      return "valid";
    }

  const onIssuesLoaded = (allSelected: boolean, newIssueSearchInfo: IssueSearchInfo) => {
    const newlySelectedIssues = newIssueSearchInfo.issues;
    // setSelectedIssues(newlySelectedIssues);
    const issueSelectionState: IssueSelectionState = {
      selectedIssues: newlySelectedIssues,
      selectionValidity: computeSelectionValidity(newlySelectedIssues)
    }
    setIssueSelectionState(issueSelectionState);
    setSelectedIssuesTime(Date.now());
    // console.log(`BulkOperationPanel: onIssuesLoaded: newlySelectedIssues = ${newlySelectedIssues.map(issue => issue.key).join(', ')}`);
    targetProjectFieldsModel.setSelectedIssues(newlySelectedIssues, allIssueTypes);
    setIssueSearchInfo(newIssueSearchInfo);
    setIssueSearchInfoTime(Date.now());
    setLastDataLoadTime(Date.now());
    clearFieldMappingsState();
    setStepCompletionState('issue-selection', issueSelectionState.selectionValidity === 'valid' ? 'complete' : 'incomplete');
    updateMappingsCompletionStates();
  }

  const updateMappingsCompletionStates = (): void => {
    const fieldMappingsComplete = isFieldMappingsComplete();
    setFieldMappingsComplete(fieldMappingsComplete);
    setStepCompletionState('field-mapping', fieldMappingsComplete ? 'complete' : 'incomplete');
  }

  const onIssuesSelectionChange = async (issueSelectionState: IssueSelectionState): Promise<void> => {
    // console.log(`BulkOperationPanel: onIssuesSelectionChange: selected issues = ${selectedIssues.map(issue => issue.key).join(', ')}`);
    setIssueSelectionState(issueSelectionState);
    setSelectedIssuesTime(Date.now());
    targetProjectFieldsModel.setSelectedIssues(issueSelectionState.selectedIssues, allIssueTypes);
    updateFieldMappingsIfNeeded(selectedToProject);
    updateMappingsCompletionStates();
    setStepCompletionState('issue-selection', issueSelectionState.selectionValidity === 'valid' ? 'complete' : 'incomplete');
  }

  const onBasicModeSearchIssues = async (projects: Project[], issueTypes: IssueType[], labels: string[]): Promise<void> => {
    setIssueMoveOutcome(undefined);
    const noIssues = nilIssueSearchInfo();
    onIssuesLoaded(true, noIssues);
    if (projects.length === 0) {
      onIssuesLoaded(true, nilIssueSearchInfo());
    } else {
      setIssueLoadingState('busy');
      setTimeout(async () => {
        const issueSearchParameters: IssueSearchParameters = {
          projects: projects,
          issueTypes: issueTypes,
          labels: labels
        }
        const issueSearchInfo = await jiraDataModel.getIssueSearchInfo(issueSearchParameters) as IssueSearchInfo;
        if (issueSearchInfo.errorMessages && issueSearchInfo.errorMessages.length) {
          const joinedErrors = issueSearchInfo.errorMessages.join( );
          setMainWarningMessage(joinedErrors);
        } else {
          onIssuesLoaded(true, issueSearchInfo);
        }
        setIssueLoadingState('idle');
      }, 0);
    }
  }

  const onAdvancedModeSearchIssues = async (jql: string): Promise<void> => {
    const noIssues = nilIssueSearchInfo();
    onIssuesLoaded(true, noIssues);
    setIssueLoadingState('busy');
    setTimeout(async () => {
      const issueSearchInfo = await jiraDataModel.getIssueSearchInfoByJql(jql) as IssueSearchInfo;
      const issueCount = issueSearchInfo.issues.length;
      onIssuesLoaded(issueCount > 0, issueSearchInfo);
      setStepCompletionState('filter', issueCount > 0 ? 'complete' : 'incomplete');
      setIssueLoadingState('idle');
    }, 0);
  }

  const onJQLChange = async (jql: string): Promise<void> => {
    setEnteredJql(jql);
  }

  const onExecuteJQL = async (jql: string): Promise<void> => {
    setIssueMoveOutcome(undefined);
    setEnteredJql(jql);
    await onAdvancedModeSearchIssues(jql);
  }

  const onFromProjectsSelect = async (selectedProjects: Project[]): Promise<void> => {
    // console.log(`onFromProjectsSelect.selectedProjects: ${JSON.stringify(selectedProjects, null, 2)}`);
    setIssueMoveOutcome(undefined);
    setSelectedFromProjects(selectedProjects);
    setSelectedFromProjectsTime(Date.now());
    if (bulkOperationMode === 'Edit') {
      setSelectedToProject(selectedProjects[0]);
      setSelectedToProjectTime(Date.now());
    }
    setStepCompletionState('filter', selectedProjects.length > 0 ? 'complete' : 'incomplete');
    await onBasicModeSearchIssues(selectedProjects, selectedIssueTypes, selectedLabels);
    const selectableIssueTypes: IssueType[] = jiraUtil.filterProjectsIssueTypes(selectedFromProjects)
    setSelectableIssueTypes(selectableIssueTypes);
  }

  const updateFieldMappingState = (selectedargetProject: Project) => {
    updateFieldMappingsIfNeeded(selectedargetProject);
    targetProjectFieldsModel.setSelectedIssues(issueSelectionState.selectedIssues, allIssueTypes);
    setStepCompletionState('field-mapping', isFieldMappingsComplete() ? 'complete' : 'incomplete');
    setStepCompletionState('target-project-selection', selectedargetProject ? 'complete' : 'incomplete');
    updateMappingsCompletionStates();
  }

  const onToProjectSelect = async (selectedProject: undefined | Project): Promise<void> => {
    // console.log(`selectedToProject: `, selectedProject);
    setIssueMoveOutcome(undefined);
    setSelectedToProject(selectedProject);
    setSelectedToProjectTime(Date.now());
    updateFieldMappingState(selectedProject);
  }

  const onIssueTypesSelect = async (selectedIssueTypes: IssueType[]): Promise<void> => {
    // console.log(`selectedIssueTypes: `, selectedIssueTypes);
    setIssueMoveOutcome(undefined);
    if (selectedIssueTypes.length === 0) {
      if (implyAllIssueTypesWhenNoneAreSelected) {
        setSelectedIssueTypes(allIssueTypes);
      } else {
        setSelectedIssueTypes(selectedIssueTypes);
      }
    } else {
      setSelectedIssueTypes(selectedIssueTypes);
    }
    setSelectedIssueTypesTime(Date.now());
    await onBasicModeSearchIssues(selectedFromProjects, selectedIssueTypes, selectedLabels);
  }

  const onLabelsSelect = async (selectedLabels: string[]): Promise<void> => {
    console.log(`selectedLabels: `, selectedLabels);
    setSelectedLabels(selectedLabels);
    setSelectedLabelsTime(Date.now());
    await onBasicModeSearchIssues(selectedFromProjects, selectedIssueTypes, selectedLabels);
  }

  const buildFieldMappingsState = async (selectedToProject: undefined | Project): Promise<FieldMappingsState> => {
    if (!selectedToProject) {
      return nilFieldMappingsState; 
    }
    setCurrentFieldMappingActivity({taskId: 'non-jira-activity', description: 'Checking for mandatory fields...'});
    try {
      // KNOWN-7: Bulk move operations only allow values to be specified for required custom fields.
      const onlyIncludeCustomFields = true;
      const onlyIncludeRequiredFields = true;
      const projectFieldMappings: DataRetrievalResponse<ProjectFieldMappings> = await buildFieldMappingsForProject(
        selectedToProject.id,
        onlyIncludeCustomFields,
        onlyIncludeRequiredFields
      );
      if (projectFieldMappings.errorMessage) {
        console.warn(`BulkOperationPanel: validateMandatoryFieldsAreFilled: Error retrieving field options: ${projectFieldMappings.errorMessage}`);
        return nilFieldMappingsState;
      } else if (projectFieldMappings.data) {
        const fieldMappingsState: FieldMappingsState = {
          dataRetrieved: true,
          project: selectedToProject,
          projectFieldMappings: projectFieldMappings.data
        }
        return fieldMappingsState;
      } else {
        throw new Error(`BulkOperationPanel: validateMandatoryFieldsAreFilled: No data retrieved for field options.`);
      }
    } finally {
      setCurrentFieldMappingActivity(undefined);
    }
  }

  const onInitiateFieldValueMapping = async (selectedToProject: Project): Promise<void> => {
    const fieldMappingsState = await buildFieldMappingsState(selectedToProject);
    setFieldMappingsState(fieldMappingsState);
    targetProjectFieldsModel.setProjectFieldMappings(fieldMappingsState.projectFieldMappings);
  }

  const updateFieldMappingsIfNeeded = async (selectedToProject: undefined | Project): Promise<void> => {
    if (autoShowFieldMappings) {
      if (selectedToProject) {
        await onInitiateFieldValueMapping(selectedToProject);
      } else {
        setFieldMappingsState(nilFieldMappingsState)
      }
    }
  }

  const onAllDefaultValuesProvided = (allDefaultValuesProvided: boolean) => {
    // console.log(`BulkOperationPanel: onAllDefaultValuesProvided: ${allDefaultValuesProvided}`);
    setAllDefaultValuesProvided(allDefaultValuesProvided);
    updateFieldMappingState(selectedToProject);
  }

  const onIssueTypeMappingChange = async (): Promise<void> => {
    // console.log(`BulkOperationPanel: onIssueTypeMappingChange: }`);
    targetProjectFieldsModel.setSelectedIssues(issueSelectionState.selectedIssues, allIssueTypes);
    const allIssueTypesMapped = bulkIssueTypeMappingModel.areAllIssueTypesMapped(issueSelectionState.selectedIssues);
    setAllIssueTypesMapped(allIssueTypesMapped);
    // setStepCompletionState('issue-type-mapping', allIssueTypesMapped ? 'complete' : 'incomplete');
    setStepCompletionState('issue-type-mapping', issueSelectionState.selectedIssues.length > 0 && selectedIssueTypes.length > 0 && allIssueTypesMapped ? 'complete' : 'incomplete');
    updateFieldMappingState(selectedToProject);
  }

  const renderJQLInputPanel = () => {
    return (
      <FormSection>
       <JQLInputPanel
          label="JQL"
          placeholder="JQL query"
          initialJql={enteredJql}
          onJQLChange={onJQLChange}
          onExecute={onExecuteJQL} />
      </FormSection>
    )
  }

  const renderFromProjectSelect = () => {
    const isMulti =
      (bulkOperationMode === 'Move' && allowBulkMovesFromMultipleProjects) ||
      (bulkOperationMode === 'Edit' && allowBulkEditsAcrossMultipleProjects);
    return (
      <FormSection>
        <ProjectsSelect 
          // key={`from-project=${allProjectSearchInfoTime}`}
          label={props.bulkOperationMode === 'Move' ? "From projects" : "Projects"}
          isMulti={isMulti}
          isClearable={false}
          selectedProjects={selectedFromProjects}
          filterProjects={filterProjectsForFromSelection}
          menuPortalTarget={document.body}
          onProjectsSelect={onFromProjectsSelect}
        />
    </FormSection>
    );
  }

  const renderToProjectSelect = () => {
    const allowSelection = issueSelectionState.selectedIssues.length > 0;
    const targetProjectsFilterConditionsChangeTime = selectedIssuesTime;
    return (
      <FormSection>
        <ProjectsSelect 
          key={`to-project-${selectedIssuesTime}`}
          label="To project"
          isMulti={false}
          isClearable={false}
          isDisabled={!allowSelection}
          selectedProjects={[selectedToProject]}
          filterProjects={filterProjectsForToSelection}
          targetProjectsFilterConditionsChangeTime={targetProjectsFilterConditionsChangeTime}
          menuPortalTarget={document.body}
          onProjectsSelect={async (selected: Project[]): Promise<void> => {
            // console.log(`Selected to projects: ${JSON.stringify(selected, null, 2)}`);
            const selectedToProject: undefined | Project = selected.length > 0 ? selected[0] : undefined;
            onToProjectSelect(selectedToProject);
          }}
        />
      </FormSection>
    );
  }

  const renderIssueTypesSelect = () => {
    const selectableIssueTypes: IssueType[] = jiraUtil.filterProjectsIssueTypes(selectedFromProjects)

    const issueTypesAlreadySelected = selectedIssueTypes.length !== allIssueTypes.length;
    // console.log(`BulkOperationPanel: renderIssueTypesSelect: issueTypesAlreadySelected: ${issueTypesAlreadySelected}`);
    const candidateIssueTypes: IssueType[] = issueTypesAlreadySelected ?
      selectedIssueTypes :
      [];
    // console.log(`BulkOperationPanel: renderIssueTypesSelect: candidateIssueTypes: ${JSON.stringify(candidateIssueTypes, null, 2)}`);
    const selectedIssueTypeIds = candidateIssueTypes.length ? candidateIssueTypes.map(issueType => issueType.id) : [];
    // console.log(`BulkOperationPanel: renderIssueTypesSelect: selectedIssueTypeIds: ${JSON.stringify(selectedIssueTypeIds, null, 2)}`);
    return (
      <FormSection>
        <IssueTypesSelect 
          key={`issue-type-select-${selectedFromProjectsTime}-${selectedIssueTypesTime}`}
          label="Work item types"
          selectedIssueTypeIds={selectedIssueTypeIds}
          selectableIssueTypes={selectableIssueTypes}
          menuPortalTarget={document.body}
          onIssueTypesSelect={onIssueTypesSelect}
        />
      </FormSection>
    );
  }

  const renderLabelsSelect = () => {
    return (
      <FormSection>
        <LabelsSelect
          label="Labels"
          allowMultiple={true}
          selectedLabels={selectedLabels}
          menuPortalTarget={document.body}
          onLabelsSelect={onLabelsSelect}
        />
      </FormSection>
    );
  }

  const renderFilterModeSelect = () => {
    return (
      <FormSection>
        <div className="filter-model-panel">
          <div>
            <Label htmlFor="filter-mode-select">Advanced</Label>
            <Toggle
              id={`toggle-filter-mode-advanced`}
              isChecked={filterMode === 'advanced'}
              onChange={(event: any) => {
                setFilterMode(filterMode === 'basic' ? 'advanced' : 'basic');
              }}
            />
          </div>
        </div>
      </FormSection>
    );
  }

  const renderBasicFieldInputs = () => {
    if (filterMode === 'advanced') {
      return null;
    } else {
      return (
        <>
          {renderFromProjectSelect()}
          {selectedFromProjects.length ? renderIssueTypesSelect() : null}
          {showLabelsSelect ? renderLabelsSelect() : null}
        </>
      );  
    }
  }

  const renderAdvancedFieldInputs = () => {
    if (filterMode === 'advanced') {
      return (
        <>
          {renderJQLInputPanel()}
        </>
      );
    } else {
      return null;      
    }
  }

  const renderFileUploadPanel = (stepNumber: number) => {
    const completionState = getStepCompletionState('file-upload');
    return (
      <div className="padding-panel">
        <div className="content-panel">
          <PanelHeader
            stepNumber={stepNumber}
            label={`File upload`}
            completionState={completionState}
          />
          <div className="step-panel-content-container">
            <FileUploadPanel
              disabled={!bulkImportEnabled}
              completionState={completionState}
            />
          </div>
        </div>
      </div>
    );
  }

  const renderProjectAndIssueTypeSelectionPanel = (stepNumber: number) => {
    const fileUploadCompletionState = getStepCompletionState('file-upload');
    const projectAndIssueTypeSelectionCompletionState = getStepCompletionState('project-and-issue-type-selection');
    return (
      <div className="padding-panel">
        <div className="content-panel">
          <PanelHeader
            stepNumber={stepNumber}
            label={`Target project selection`}
            completionState={projectAndIssueTypeSelectionCompletionState}
          />
          <div className="step-panel-content-container">
            <ImportProjectAndIssueTypeSelectionPanel
              fileUploadCompletionState={fileUploadCompletionState}
              projectAndIssueTypeSelectionCompletionState={projectAndIssueTypeSelectionCompletionState}
              modelUpdateTimestamp={modelUpdateTimestamp}
            />
          </div>
        </div>
      </div>
    );
  }

  const renderColumnMappingPanel = (stepNumber: number) => {
    const importProjectCompletionState = getStepCompletionState('project-and-issue-type-selection');
    const columnMappingCompletionState = getStepCompletionState('column-mapping');
    return (
      <div className="padding-panel">
        <div className="content-panel">
          <PanelHeader
            stepNumber={stepNumber}
            label={`Column mapping`}
            completionState={columnMappingCompletionState}
          />
          <div className="step-panel-content-container">
            <ImportColumnMappingPanel
              importProjectCompletionState={importProjectCompletionState}
              columnMappingCompletionState={columnMappingCompletionState}
              selectedIssueType={importModel.getSelectedIssueType()}
              createIssueMetadata={importModel.getSelectedProjectCreateIssueMetadata()}
              modelUpdateTimestamp={modelUpdateTimestamp}
            />
          </div>
        </div>
      </div>
    );
  }

  const renderImportIssuesPanel = (stepNumber: number) => {
    const columnMappingCompletionState = getStepCompletionState('column-mapping');
    const importIssuesCompletionState = getStepCompletionState('import-issues');
    return (
      <div className="padding-panel">
        <div className="content-panel">
          <PanelHeader
            stepNumber={stepNumber}
            label={`Import work items`}
            completionState={importIssuesCompletionState}
          />
          <div className="step-panel-content-container">
            <ImportIssuesPanel
              columnMappingCompletionState={columnMappingCompletionState}
              importIssuesCompletionState={importIssuesCompletionState}
              modelUpdateTimestamp={modelUpdateTimestamp}
            />
          </div>
        </div>
      </div>
    );
  }

  const renderFilterPanel = (stepNumber: number) => {
    return (
      <div className="padding-panel">
        <div className="content-panel">
          <PanelHeader
            stepNumber={stepNumber}
            label={`Find work items to ${bulkOperationMode.toLowerCase()}`}
            completionState={getStepCompletionState('filter')}
          />
          {renderFilterModeSelect()}
          {renderBasicFieldInputs()}
          {renderAdvancedFieldInputs()}
        </div>
      </div>
    );
  }

  const renderFieldMappingIndicator = () => {
    return null;
  }

  const renderIssuesPanel = (stepNumber: number) => {
    const hasIssues = issueSearchInfo.issues.length > 0;
    const waitingMessage = new WaitingMessageBuilder()
      .addCheck(arePrerequisiteStepsComplete('issue-selection'), 'Waiting for previous step to be completed.')
      .build();
    let panelLabel = `Select work items to ${bulkOperationMode.toLowerCase()}`;
    if (issueSearchInfo.issues.length > 0) {
      panelLabel += ` (${issueSearchInfo.issues.length} found)`;
    }
    return (
      <div className="padding-panel">
        <div className="content-panel">
          <PanelHeader
            stepNumber={stepNumber}
            label={panelLabel}
            completionState={getStepCompletionState('issue-selection')}
          />
          {renderPanelMessage(waitingMessage, {marginTop: '20px', marginBottom: '20px'})}
          <IssueSelectionPanel
            loadingState={issueLoadingState}
            issueSearchInfo={issueSearchInfo}
            selectedIssues={issueSelectionState.selectedIssues}
            computeSelectionValidity={computeSelectionValidity}
            onIssuesSelectionChange={onIssuesSelectionChange}
          />
        </div>
      </div>
    );
  }

  const renderStartFieldValueMappingsButton = () => {
    const buttonEnabled = selectedToProject && selectedToProject.id && issueSelectionState.selectedIssues.length > 0;
    return (
      <Button
        appearance={fieldMappingsState.dataRetrieved ? 'default' : 'primary'}
        isDisabled={!buttonEnabled}
        onClick={() => {
          onInitiateFieldValueMapping(selectedToProject);
        }}
      >
        Start field value mapping
      </Button>
    );
  }

  const renderTargetProjectPanel = (stepNumber: number) => {
    const waitingMessage = new WaitingMessageBuilder()
      .addCheck(arePrerequisiteStepsComplete('target-project-selection'), 'Waiting for previous steps to be completed.')
      .addCheck(issueSelectionState.selectionValidity === 'valid', 'A valid set of work items has not yet been selected.')
      .build();
    return (
      <div className="padding-panel">
        <div className="content-panel">
          <PanelHeader
            stepNumber={stepNumber}
            label="Select target project"
            completionState={getStepCompletionState('target-project-selection')}
          />
          {renderPanelMessage(waitingMessage, {marginTop: '20px', marginBottom: '20px'})}
          {renderToProjectSelect()}
        </div>
      </div>
    );
  }

  const renderStartFieldMappingButton = () => {
    if (autoShowFieldMappings) {
      return null;
    } else {
      return (
        <FormSection>
          {renderStartFieldValueMappingsButton()}
        </FormSection>
      );
    }
  }

  const renderIssueTypeMappingPanel = (stepNumber: number) => {
    const waitingMessage = new WaitingMessageBuilder()
      .addCheck(arePrerequisiteStepsComplete('issue-type-mapping'), 'Waiting for previous steps to be completed.')
      .build();
    return (
      <div className="padding-panel">
        <div className="content-panel">
          <PanelHeader
            stepNumber={stepNumber}
            label="Work item type mapping"
            // completionState={'incomplete'}
            completionState={getStepCompletionState('issue-type-mapping')}
          />
          {renderPanelMessage(waitingMessage, {marginTop: '20px', marginBottom: '20px'})}
          {renderStartFieldMappingButton()}
          {renderFieldMappingIndicator()}
          <IssueTypeMappingPanel
            key={`issue-type-mapping-panel-${lastDataLoadTime}-${issueSelectionState.selectedIssues.length}-${selectedToProjectTime}`}
            selectedIssues={issueSelectionState.selectedIssues}
            targetProject={selectedToProject}
            bulkOperationMode={bulkOperationMode}
            filterIssueTypes={bulkOperationRuleEnforcer.filterIssueTypes}
            onIssueTypeMappingChange={onIssueTypeMappingChange}
          />
        </div>
      </div>
    );
  }

  const renderFieldValueMappingsPanel = (stepNumber: number) => {
    const waitingMessage = new WaitingMessageBuilder()
      .addCheck(arePrerequisiteStepsComplete('field-mapping'), 'Waiting for previous steps to be completed.')
      .build();
    return (
      <div className="padding-panel">
        <div className="content-panel">
          <PanelHeader
            stepNumber={stepNumber}
            label="Map work item field values"
            completionState={getStepCompletionState('field-mapping')}
          />
          {renderPanelMessage(waitingMessage, {marginTop: '20px', marginBottom: '20px'})}
          {renderStartFieldMappingButton()}
          {renderFieldMappingIndicator()}
          <FieldMappingPanel
            bulkOperationMode={bulkOperationMode}
            allIssueTypes={allIssueTypes}
            issues={issueSelectionState.selectedIssues}
            targetProject={selectedToProject}
            fieldMappingsState={fieldMappingsState}
            showDebug={showDebug}
            onAllDefaultValuesProvided={onAllDefaultValuesProvided}
          />
        </div>
      </div>
    );
  }

  const renderEditFieldsPanel = (stepNumber: number) => {
    return (
      <div className="padding-panel">
        <div className="content-panel">
          <PanelHeader
            stepNumber={stepNumber}
            label={`Set work item field values`}
            completionState={getStepCompletionState('edit-fields')}
          />
          <FieldEditsPanel
            issueSelectionState={issueSelectionState}
            selectedIssuesTime={issueSearchInfoTime}
            onEditsValidityChange={onEditsValidityChange}
          />
        </div>
      </div>
    );
  }

  const renderMoveOrEditPanel = (stepNumber: number) => {
    const lastInputConditionsChangeTime = Math.max(
      selectedFromProjectsTime,
      selectedToProjectTime,
      selectedIssueTypesTime,
      selectedIssuesTime,
      fieldIdsToValuesTime
    );
    return (
      <div className="padding-panel">
        <div className="content-panel">
          <PanelHeader
            stepNumber={stepNumber}
            label={`${bulkOperationMode} work items`}
            completionState={getStepCompletionState('move-or-edit')}
          />
          <MoveOrEditPanel
            bulkOperationMode={bulkOperationMode}
            fieldMappingsComplete={fieldMappingsComplete}
            selectedIssues={issueSelectionState.selectedIssues}
            selectedToProject={selectedToProject}
            allDefaultValuesProvided={allDefaultValuesProvided}
            lastInputConditionsChangeTime={lastInputConditionsChangeTime}
            onSetStepCompletionState={setStepCompletionState}
            onSetMainWarningMessage={setMainWarningMessage}
          />
        </div>
      </div>
    );
  }


  const renderDebugPanel = () => {
    const projectsToIssueTypes: {} = {};
    if (debugInfo.projects && debugInfo.projects.length) {
      for (const project of debugInfo.projects) {
        const issueTypes = jiraUtil.filterProjectIssueTypes(project, debugInfo.issueTypes);
        for (const issueType of issueTypes) {
          const issueTypeRepresentation = `${issueType.name} (${issueType.id})`;
          if (projectsToIssueTypes[project.name]) {
            projectsToIssueTypes[project.name].push(issueTypeRepresentation);
          } else {
            projectsToIssueTypes[project.name] = [issueTypeRepresentation];
          }
        }
      }
    }
    const renderedProjectsTossueTypes = Object.keys(projectsToIssueTypes).map((projectName: string) => {
      return (
        <li key={projectName}>
          <strong>{projectName}</strong>: {projectsToIssueTypes[projectName].join(', ')}
        </li>
      );
    });

    const renderedSelectedIssueTypes = selectedIssueTypes.map((issueType: IssueType) => {
      return (
        <li key={issueType.id}>
          <strong>{issueType.name}</strong> ({issueType.id})
        </li>
      );
    });
    
    if (showDebug) {
      return (
        <div className="debug-panel">
          <h3>Debug</h3>

          <h4>Projects to issue types</h4>
          <ul>
            {renderedProjectsTossueTypes}
          </ul>

          <h4>Selected issue types</h4>
          <ul>
            {renderedSelectedIssueTypes}
          </ul>

          <h4>Projects</h4>
          <pre>
            {JSON.stringify(debugInfo.projects, null, 2)}
          </pre>

          <h4>Work item types</h4>
          <pre>
            {JSON.stringify(debugInfo.issueTypes, null, 2)}
          </pre>

        </div>
      );
    } else {
      return null;
    }
  }

  const rendermainWarningMessage = () => {
    if (mainWarningMessage) {
      return (
        <div className="warning-banner">
          <div
            className="fake-button"
            style={{border: '1px solid #ccc'}}
            onClick={() => {
              onClearMainWarningMessage();
            }}
            >
            Clear
          </div>
          <div>
            {mainWarningMessage}              
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  let lastStepNumber = 1;
  return (
    <div>
      <h3>Bulk {bulkOperationMode} Work Items</h3>
      {showCompletionStateDebug ? renderStepCompletionState() : null}
      {rendermainWarningMessage()}
      <div className="bulk-move-main-panel">
        {isStepApplicableToBulkOperationMode('file-upload') ? renderFileUploadPanel(lastStepNumber++) : null}
        {isStepApplicableToBulkOperationMode('project-and-issue-type-selection') ? renderProjectAndIssueTypeSelectionPanel(lastStepNumber++) : null}
        {isStepApplicableToBulkOperationMode('column-mapping') ? renderColumnMappingPanel(lastStepNumber++) : null}
        {isStepApplicableToBulkOperationMode('import-issues') ? renderImportIssuesPanel(lastStepNumber++) : null}
        {isStepApplicableToBulkOperationMode('filter') ? renderFilterPanel(lastStepNumber++) : null}
        {isStepApplicableToBulkOperationMode('issue-selection') ? renderIssuesPanel(lastStepNumber++) : null}
        {isStepApplicableToBulkOperationMode('issue-type-mapping') ? renderTargetProjectPanel(lastStepNumber++) : null}
        {isStepApplicableToBulkOperationMode('issue-type-mapping') ? renderIssueTypeMappingPanel(lastStepNumber++) : null}
        {isStepApplicableToBulkOperationMode('field-mapping') ? renderFieldValueMappingsPanel(lastStepNumber++) : null}
        {isStepApplicableToBulkOperationMode('edit-fields') ? renderEditFieldsPanel(lastStepNumber++) : null}
        {isStepApplicableToBulkOperationMode('move-or-edit') ? renderMoveOrEditPanel(lastStepNumber++) : null}
      </div>
      {renderDebugPanel()}
    </div>
  );
}

export default BulkOperationPanel;
