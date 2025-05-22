import React, { useEffect, useState } from 'react';
import Button from '@atlaskit/button/new';
import LabelSelect from './widget/LabelsSelect';
import { Project } from './types/Project';
import { FormSection, Label } from '@atlaskit/form';
import Toggle from '@atlaskit/toggle';
import Lozenge from '@atlaskit/lozenge';
import IssueTypesSelect from './widget/IssueTypesSelect';
import { IssueType } from './types/IssueType';
import { IssueSearchInfo } from './types/IssueSearchInfo';
import { Issue } from './types/Issue';
import { LinearProgress } from '@mui/material';
import { LoadingState } from './types/LoadingState';
import { ProjectSearchInfo } from './types/ProjectSearchInfo';
import { nilProjectSearchInfo } from './model/nilProjectSearchInfo';
import { nilIssueSearchInfo } from './model/nilIssueSearchInfo';
import issueTypesCache from './model/issueTypesCache';
import { TaskOutcome } from './types/TaskOutcome';
import issueMoveController from './controller/issueMoveController';
import { IssueSearchParameters } from './types/IssueSearchParameters';
import { IssueMoveRequestOutcome } from './types/IssueMoveRequestOutcome';
import jiraUtil from './controller/jiraUtil';
import { IssueMoveOutcomeResult } from './types/IssueMoveOutcomeResult';
import JQLInputPanel from './widget/JQLInputPanel';
import { getFieldConfigurationItemsForProjects, getIssueSearchInfo, getIssueSearchInfoByJql, getProjectSearchInfo } from './controller/jiraClient';
import ProjectsSelect from './widget/ProjectsSelect';

const showDebug = true;
const implyAllIssueTypesWhenNoneAreSelected = true;

export type BulkMovePanelProps = {
}

type DebugInfo = {
  projects: Project[];
  issueTypes: IssueType[];
}

type MandatoryFieldsCompletionState = 'incomplete' | 'complete' | 'error';

type FilterMode = 'basic' | 'advanced';

type MoveActivity = {
  taskId: string;
  description: string;
}

const BulkMovePanel = () => {

  const [mainWarningMessage, setMainWarningMessage] = useState<string>('');
  const [filterMode, setFilterMode] = useState<FilterMode>('basic');
  const [enteredJql, setEnteredJql] = useState<string>('');
  const [allProjectSearchInfo, setAllProjectSearchInfo] = useState<ProjectSearchInfo>(nilProjectSearchInfo());
  const [allProjectSearchInfoTime, setAllProjectSearchInfoTime] = useState<number>(0);
  const [allIssueTypes, setAllIssueTypes] = useState<IssueType[]>([]);
  const [allIssueTypesTime, setAllIssueTypesTime] = useState<number>(0);
  const [eligibleToProjectSearchInfo, setEligibleToProjectSearchInfo] = useState<ProjectSearchInfo>(nilProjectSearchInfo());
  const [eligibleToProjectSearchInfoTime, setEligibleToProjectSearchInfoTime] = useState<number>(0);
  const [issueLoadingState, setIssueLoadingState] = useState<LoadingState>('idle');
  const [selectedFromProjects, setSelectedFromProjects] = useState<Project[]>([]);
  const [selectedFromProjectsTime, setSelectedFromProjectsTime] = useState<number>(0);
  const [selectedToProject, setSelectedToProject] = useState<undefined | Project>(undefined);
  const [selectedToProjectTime, setSelectedToProjectTime] = useState<number>(0);
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<IssueType[]>([]);
  const [selectedIssueTypesTime, setSelectedIssueTypesTime] = useState<number>(0);
  const [issueSearchInfo, setIssueSearchInfo] = useState<IssueSearchInfo>(nilIssueSearchInfo);
  const [issueSearchInfoTime, setIssueSearchInfoTime] = useState<number>(0);
  const [allIssuesSelected, setAllIssuesSelected] = useState<boolean>(true);
  const [selectedIssueKeys, setSelectedIssueKeys] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedLabelsTime, setSelectedLabelsTime] = useState<number>(0);
  // const [currentIssueMoveTaskId, setCurrentIssueMoveTaskId] = useState<undefined | string>(undefined);
  const [currentMoveActivity, setCurrentMoveActivity] = useState<undefined | MoveActivity>(undefined);
  const [issueMoveRequestOutcome, setIssueMoveRequestOutcome] = useState<undefined | IssueMoveRequestOutcome>(undefined);
  const [issueMoveOutcome, setIssueMoveOutcome] = useState<undefined | TaskOutcome>(undefined);
  const [selectableIssueTypes, setSelectableIssueTypes] = useState<IssueType[]>([]);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({ projects: [], issueTypes: [] });

  const retrieveAndSetDebugInfo = async (): Promise<void> => {
    const debugInfo: DebugInfo = {
      // projects: (await projectSearchInfoCache.getProjectSearchInfo()).values,
      projects: (await getProjectSearchInfo()).values,
      issueTypes: await issueTypesCache.getissueTypes()
    }
    setDebugInfo(debugInfo);
  }

  const initialiseSelectedIssueTypes = async (): Promise<void> => {
    const allIssueTypes: IssueType[] = await issueTypesCache.getissueTypes();
    setAllIssueTypes(allIssueTypes);
    setAllIssueTypesTime(Date.now());
    if (selectedIssueTypesTime === 0) {
      setSelectedIssueTypes(allIssueTypes);
    } else {
      // Don't override if there's already a selection
    }
  }

  useEffect(() => {
    updateAllProjectInfo();
    initialiseSelectedIssueTypes();
    if (showDebug) {
      retrieveAndSetDebugInfo();
    }
  }, []);

  const computeToProjectInfo = async (selectedFromProjects: Project[], selectedIssueTypes: IssueType[]): Promise<ProjectSearchInfo> => {
    console.log(`BulkMovePanel: computeToProjectInfo:`);
    if (selectedIssueTypes.length === 0) {
      console.warn(`BulkMovePanel: computeToProjectInfo: return nilProjectSearchInfo() since no issue type is selected.`);
      return nilProjectSearchInfo();
    } else {
      console.log(`BulkMovePanel: computeToProjectInfo: selectedIssueTypes: ${JSON.stringify(selectedIssueTypes, null, 2)}`);
      const subjectIssueType: IssueType = selectedIssueTypes.length ? selectedIssueTypes[0] : undefined;
      // const projectSearchInfo = await projectSearchInfoCache.getProjectSearchInfo();
      const projectSearchInfo = await getProjectSearchInfo();
      const projectSearchInfoMinusSelectedFromProject: ProjectSearchInfo = jiraUtil.removeProjectsFromSearchInfo(
        selectedFromProjects, projectSearchInfo); 
      const filteredProjects = await jiraUtil.determineProjectsWithIssueTypes(
        subjectIssueType,
        projectSearchInfoMinusSelectedFromProject.values,
        [subjectIssueType]);
      const filteredProjectSearchInfo: ProjectSearchInfo = {
        maxResults: filteredProjects.length, // e.g. 4,
        startAt: 0,
        total: filteredProjects.length,
        isLast: projectSearchInfo.isLast,
        values: filteredProjects,
      }
      console.log(`BulkMovePanel: computeToProjectInfo: computed filteredProjectSearchInfo: ${JSON.stringify(filteredProjectSearchInfo, null, 2)}`);
      return filteredProjectSearchInfo;
    }
  }

  const filterProjectsForToSelection = async (projectsToFilter: Project[]): Promise<Project[]> => {
    const allowableToProjects = await computeToProjectInfo(selectedFromProjects, selectableIssueTypes);
    return allowableToProjects.values;
  }

  const computeFromProjectBasedOnJQlResults = async (issueSearchInfo: IssueSearchInfo): Promise<void> => {
    const allProjectSearchInfo: ProjectSearchInfo = await getProjectSearchInfo();
    const projectsFromIssueSearchResults: Project[] = []
    for (const issue of issueSearchInfo.issues) {
      const project: Project = allProjectSearchInfo.values.find((project: Project) => {
        return issue.key.startsWith(`${project.key}-`);
      })
      projectsFromIssueSearchResults.push(project);
    }
    const uniqueProjects = Array.from(new Set(projectsFromIssueSearchResults));
    const newlySelectedProjects: Project[] = uniqueProjects.length === 0 ? [] : uniqueProjects;
    setSelectedFromProjects(newlySelectedProjects);
    setSelectedFromProjectsTime(Date.now());
    const toProjectSearchInfo = await computeToProjectInfo(newlySelectedProjects, selectedIssueTypes);
    setEligibleToProjectSearchInfo(toProjectSearchInfo);
    setEligibleToProjectSearchInfoTime(Date.now());
    await updateToProjectInfo(newlySelectedProjects, selectedIssueTypes);
  }

  const updateAllProjectInfo = async (): Promise<void> => {
    const allProjectSearchInfo = await getProjectSearchInfo();
    setAllProjectSearchInfo(allProjectSearchInfo);
    setAllProjectSearchInfoTime(Date.now());
  }

  const updateToProjectInfo = async (selectedFromProjects: Project[], selectedIssueTypes: IssueType[]): Promise<void> => {
    const toProjectSearchInfo = await computeToProjectInfo(selectedFromProjects, selectedIssueTypes);
    setEligibleToProjectSearchInfo(toProjectSearchInfo);
    setEligibleToProjectSearchInfoTime(Date.now());
  }

  const onIssuesLoaded = (allSelected: boolean, newIssueSearchInfo: IssueSearchInfo) => {
    // console.log(` * allSelected = ${allSelected}`);
    const allIssueKeys: string[] = [];
    if (allSelected) {
      for (const issue of newIssueSearchInfo.issues) {
        allIssueKeys.push(issue.key);
      }  
    }
    // console.log(` * setting allIssueKeys to ${JSON.stringify(allIssueKeys)}`);
    setSelectedIssueKeys(allIssueKeys);
    setAllIssuesSelected(allSelected);
    setIssueSearchInfo(newIssueSearchInfo);
    setIssueSearchInfoTime(Date.now());
  }

  const onBasicModeSearchIssues = async (projects: Project[], issueTypes: IssueType[], labels: string[]): Promise<void> => {
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
        // const params = {
        //   issueSearchParameters: issueSearchParameters
        // }
        // const issueSearchInfo = await props.invoke('getIssueSearchInfo', params) as IssueSearchInfo;
        const issueSearchInfo = await getIssueSearchInfo(issueSearchParameters) as IssueSearchInfo;
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
      const params = {
        jql: jql
      }
      // const issueSearchInfo = await props.invoke('getIssueSearchInfo', params);
      const issueSearchInfo = await getIssueSearchInfoByJql(jql) as IssueSearchInfo;
      onIssuesLoaded(true, issueSearchInfo);
      setIssueLoadingState('idle');
      computeFromProjectBasedOnJQlResults(issueSearchInfo);
    }, 0);
  }

  const onJQLChange = async (jql: string): Promise<void> => {
    setEnteredJql(jql);
  }

  const onExecuteJQL = async (jql: string): Promise<void> => {
    setEnteredJql(jql);
    await onAdvancedModeSearchIssues(jql);
  }

  const onFromProjectsSelect = async (selectedProjects: Project[]): Promise<void> => {
    // console.log(`selectedFromProject: `, selectedProject);
    setSelectedFromProjects(selectedProjects);
    setSelectedFromProjectsTime(Date.now());
    await onBasicModeSearchIssues(selectedProjects, selectedIssueTypes, selectedLabels);
    // const allIssueTypes: IssueType[] = await issueTypesCache.getissueTypes(props.invoke);
    // const selectableIssueTypes = jiraUtil.filterProjectIssueTypes(selectedProjects, allIssueTypes);

    // setSelectableIssueTypes(allIssueTypes);
    const selectableIssueTypes: IssueType[] = jiraUtil.filterProjectsIssueTypes(selectedFromProjects, allIssueTypes)
    setSelectableIssueTypes(selectableIssueTypes);


    await updateToProjectInfo(selectedProjects, selectedIssueTypes);
  }

  const onToProjectSelect = async (selectedProject: undefined | Project): Promise<void> => {
    console.log(`selectedToProject: `, selectedProject);
    setSelectedToProject(selectedProject);
    setSelectedToProjectTime(Date.now());
  }

  const onIssueTypesSelect = async (selectedIssueTypes: IssueType[]): Promise<void> => {
    console.log(`selectedIssueTypes: `, selectedIssueTypes);

    if (selectedIssueTypes.length === 0) {
      if (implyAllIssueTypesWhenNoneAreSelected) {
        // const allIssueTypes: IssueType[] = await issueTypesCache.getissueTypes(props.invoke);
        setSelectedIssueTypes(allIssueTypes);
      } else {
        setSelectedIssueTypes(selectedIssueTypes);  
      }
    } else {
      setSelectedIssueTypes(selectedIssueTypes);
    }
    setSelectedIssueTypesTime(Date.now());
    await onBasicModeSearchIssues(selectedFromProjects, selectedIssueTypes, selectedLabels);
    await updateToProjectInfo(selectedFromProjects, selectedIssueTypes);
  }

  const onLabelsSelect = async (selectedLabels: string[]): Promise<void> => {
    console.log(`selectedLabels: `, selectedLabels);
    setSelectedLabels(selectedLabels);
    setSelectedLabelsTime(Date.now());
    await onBasicModeSearchIssues(selectedFromProjects, selectedIssueTypes, selectedLabels);
  }

  const onToggleAllIssuesSelection = (event: any) => {
    console.log(`Toggle all issues event: `, event);
    const allSelected = !allIssuesSelected;
    onIssuesLoaded(allSelected, issueSearchInfo);
  }

  const onToggleIssueSelection = (issueToToggle: Issue) => {
    // console.log(`Toggling the selection of issue ${issueToToggle.key} where initially selected features is ${selectedIssueKeys.join()}...`);
    const newSelectedIssueKeys: string[] = [];
    for (const issue of issueSearchInfo.issues) {
      const existingSelectedIssueKey = selectedIssueKeys.find((selectedIssueKey: string) => {
        return selectedIssueKey === issue.key;
      });
      const issueIsSelected = !!existingSelectedIssueKey;
      if (issue.key === issueToToggle.key) {
        if (issueIsSelected) {
          // don't add
        } else {
          newSelectedIssueKeys.push(issue.key);
        }
      } else if (issueIsSelected){
        newSelectedIssueKeys.push(issue.key);
      }
    }
    // console.log(` * newSelectedIssueKeys = ${newSelectedIssueKeys.join()}.`);
    setSelectedIssueKeys(newSelectedIssueKeys);
  }

  const pollPollMoveOutcome = async (taskId: string): Promise<void> => {
    const outcome: TaskOutcome = await issueMoveController.pollMoveProgress(taskId);
    setIssueMoveOutcome(outcome);
    if (issueMoveController.isDone(outcome.status)) {
      setCurrentMoveActivity(undefined);
    } else {
      asyncPollMoveOutcome(taskId);
    }
  }

  const asyncPollMoveOutcome = async (taskId: string): Promise<void> => {
    setTimeout(async () => {
      await pollPollMoveOutcome(taskId);
    }, 500);
  }

  const checkMandatoryFieldsAreFilled = async (): Promise<MandatoryFieldsCompletionState> => {
    const projectIds: string[] = selectedFromProjects.map((project: Project) => {
      return project.id;
    })
    setCurrentMoveActivity({taskId: 'non-jira-activity', description: 'Checking if mandatory fields are filled...'});
    const fieldConfigurationItems = await getFieldConfigurationItemsForProjects(projectIds);
    const mandatoryFieldConfigurationItems = fieldConfigurationItems.filter((fieldConfigurationItem: any) => {
      return fieldConfigurationItem.required;
    });
    const mandatoryFieldsCompletionState: MandatoryFieldsCompletionState =
      mandatoryFieldConfigurationItems.length > 0 ? 'incomplete' : 'complete';
    setCurrentMoveActivity(undefined);
    return mandatoryFieldsCompletionState;
  }

  const onMoveIssues = async (): Promise<void> => {
    // Step 1: Check for mandatory fields...
    const mandatoryFieldsCompletionState = await checkMandatoryFieldsAreFilled();
    if (mandatoryFieldsCompletionState === 'incomplete') {
      setMainWarningMessage('This request can not be completed since there are mandatory fields.');
      return;
    }

    // Step 2: Initiate the move request...
    const destinationProjectId: string = selectedToProject.id;
    const issueKeys = selectedIssueKeys;
    setIssueMoveRequestOutcome(undefined);
    setCurrentMoveActivity({taskId: 'non-jira-activity', description: 'Initiating move request...'});
    const initiateOutcome: IssueMoveRequestOutcome = await issueMoveController.initiateMove(
      destinationProjectId,
      // destinationIssueTypeId,
      issueKeys,
      issueSearchInfo
    );
    setCurrentMoveActivity(undefined);
    console.log(`BulkMovePanel: issue move request outcome: ${JSON.stringify(initiateOutcome, null, 2)}`);

    // Step 3: Start polling for the outcome...
    setCurrentMoveActivity({taskId: initiateOutcome.taskId, description: 'Polling for move outcome...'});
    pollPollMoveOutcome(initiateOutcome.taskId);

    // Step 3: (now redundant since we switched to the polling approach) Wait for the outcome...
    // setIssueMoveRequestOutcome(initiateOutcome);
    // if (initiateOutcome.statusCode === 201 && initiateOutcome.taskId) {
    //   setCurrentIssueMoveTaskId(initiateOutcome.taskId);
    //   setIssueMoveOutcome(undefined);
    //   const issueMoveOutcome = await issueMoveController.awaitMoveCompletion(props.invoke, initiateOutcome.taskId);
    //   setIssueMoveOutcome(issueMoveOutcome);
    //   setCurrentIssueMoveTaskId(undefined);  
    // }
  }

  const renderJQLInputPanel = () => {
    return (
      <FormSection>
       <JQLInputPanel
          label="JQL"
          placeholder="JQL query"
          onJQLChange={onJQLChange}
          onExecute={onExecuteJQL} />
      </FormSection>
    )
  }

  const renderFromProjectSelect = () => {
    return (
      <FormSection>
        <ProjectsSelect 
          key={`from-project=${allProjectSearchInfoTime}`}
          label="From projects"
          isMulti={true}
          // selectableProjects={allProjectSearchInfo.values}
          selectedProjects={selectedFromProjects}
          onProjectsSelect={onFromProjectsSelect}
        />
      </FormSection>
    );
  }

  const renderToProjectSelect = () => {
    const issueTypesSelected = selectedIssueTypes.length > 0 && selectedIssueTypes.length < allIssueTypes.length && selectedIssueKeys.length > 0;
    const allowSelection = selectedFromProjects.length && issueTypesSelected;
    return (
      <FormSection>
        <ProjectsSelect 
          key={`to-project-${selectedFromProjectsTime}-${eligibleToProjectSearchInfoTime}`}
          label="To project"
          isMulti={false}
          isDisabled={!allowSelection}
          selectedProjects={[selectedToProject]}
          filterProjects={filterProjectsForToSelection}
          onProjectsSelect={async (selected: Project[]): Promise<void> => {
            console.log(`Select to projects: ${JSON.stringify(selected, null, 2)}`);
            const selectedToProject: undefined | Project = selected.length > 0 ? selected[0] : undefined;
            onToProjectSelect(selectedToProject);
          }}
        />
      </FormSection>
    );
  }

  const renderIssueTypesSelect = () => {
    const selectableIssueTypes: IssueType[] = jiraUtil.filterProjectsIssueTypes(selectedFromProjects, allIssueTypes)

    const issueTypesAlreadySelected = selectedIssueTypes.length !== allIssueTypes.length;
    console.log(`BulkMovePanel: renderIssueTypesSelect: issueTypesAlreadySelected: ${issueTypesAlreadySelected}`);
    const candidateIssueTypes: IssueType[] = issueTypesAlreadySelected ?
      selectedIssueTypes :
      [];
    console.log(`BulkMovePanel: renderIssueTypesSelect: candidateIssueTypes: ${JSON.stringify(candidateIssueTypes, null, 2)}`);
    const selectedIssueTypeIds = candidateIssueTypes.length ? candidateIssueTypes.map(issueType => issueType.id) : [];
    console.log(`BulkMovePanel: renderIssueTypesSelect: selectedIssueTypeIds: ${JSON.stringify(selectedIssueTypeIds, null, 2)}`);
    return (
      <FormSection>
        <IssueTypesSelect 
          key={`issue-type-select-${selectedFromProjectsTime}-${selectedIssueTypesTime}`}
          label="Issue types"
          selectedIssueTypeIds={selectedIssueTypeIds}
          selectableIssueTypes={selectableIssueTypes}
          onIssueTypesSelect={onIssueTypesSelect}
        />
      </FormSection>
    );
  }

  const renderLabelsSelect = () => {
    return (
      <FormSection>
        <LabelSelect 
          label="Labels"
          allowMultiple={true}
          selectedLabels={selectedLabels}
          onLabelsSelect={onLabelsSelect}
        />
      </FormSection>
    );
  }

  const renderFlexboxEqualWidthGrowPanel = () => {
    return (
      <div className="flex-box-equal-width-grow-panel"></div>
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
          {renderLabelsSelect()}
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

  const renderFilterPanel = () => {
    return (
      <div className="padding-panel">
        <div className="content-panel">
          <h3>Step 1</h3>
          <h4>Select issue filter options</h4>
          {renderFilterModeSelect()}
          {renderBasicFieldInputs()}
          {renderAdvancedFieldInputs()}
          {renderFlexboxEqualWidthGrowPanel()}
        </div>
      </div>
    );
  }

  const renderIssueLoading = () => {
    return (
      <div style={{margin: '12px 0px 12px 0px'}}>
        {issueLoadingState === 'busy' ? <LinearProgress color="secondary" /> : <div style={{height: '4px'}}></div>} 
      </div>
    );
  }

  const renderIssueMoveLoading = () => {
    if (currentMoveActivity) {
      // https://mui.com/material-ui/api/linear-progress/
      const progressPercent = issueMoveOutcome ? issueMoveOutcome.progress : 0;
      return (
        <div>
          <Label htmlFor={''}>{currentMoveActivity.description}</Label>
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

  const renderIssueMoveResult = (moveResult: IssueMoveOutcomeResult) => {
    const movedCount = moveResult.successfulIssues.length;
    const failedCount = moveResult.totalIssueCount - movedCount;
    return (
      <div>
        <div>
          # issues moved: <Lozenge appearance="success">{movedCount}</Lozenge>
        </div>
        <div>
          # issues not moved: <Lozenge appearance="removed">{failedCount}</Lozenge>
        </div>
      </div>
    );
}

  const renderIssueMoveOutcome = () => {
    if (issueMoveOutcome) {
      const statusAppearance = issueMoveOutcome.status === 'COMPLETE' ? 'success' : 'removed';
      const renderedStatus = issueMoveOutcome.status ? <Lozenge appearance={statusAppearance}>{issueMoveOutcome.status}</Lozenge> : null;
      const renderedIssueMoveResult = issueMoveOutcome.result ? renderIssueMoveResult(issueMoveOutcome.result) : null;
      const renderedOutcomeDebugJson = showDebug ? <pre>{JSON.stringify(issueMoveOutcome, null, 2)}</pre> : null;
      const progressPercent = issueMoveOutcome.progress ?? 0;
      const renderedProgress = <div>Progress: {progressPercent}%</div>;
      return (
        <div>
          Issue move outcome:
          <ul>
            <li>Status: {renderedStatus}</li>
            <li>{renderedIssueMoveResult}</li>
            <li>{renderedProgress}</li>
          </ul>
          {renderedOutcomeDebugJson}
        </div>
      );
    } else {
      return null;
    }
  }

  const renderIssuesPanel = () => {
    const hasIssues = issueSearchInfo.issues.length > 0;
    const renderedSelectAllRow = (
      <div className="issue-selection-panel">
        <div>
          <Toggle
            id={`toggle-all-issues`}
            isChecked={allIssuesSelected}
            onChange={onToggleAllIssuesSelection}
          />
        </div>
        <div key={`issue-all-issues`}>
          All issues
        </div>
      </div>
    );
    const renderedIssues = hasIssues ? issueSearchInfo.issues.map((issue: Issue) => {
      // const issueIsInSelectedFromProject = selectedFromProject && issue.key.startsWith(`${selectedFromProject.key}-`);
      const issueIsInSelectedFromProject = true;
      return (
        <div 
          key={`issue-select-${issue.key}`}
          className="issue-selection-panel"
        >
          <div>
            <Toggle
              key={`issue-select-${issue.key}`}
              id={`toggle-${issue.key}`}
              isChecked={!!selectedIssueKeys.find(selectedIssueKey => selectedIssueKey === issue.key)}
              isDisabled={!issueIsInSelectedFromProject}
              onChange={(event: any) => {
                // console.log(`Issue toggle event: ${JSON.stringify(event, null, 2)}`);
                onToggleIssueSelection(issue);
              }}
            />
          </div>
          <div key={`issue-id-type-${issue.key}-${issue.fields.issuetype.id}`} className={`issue-summary-panel ${issueIsInSelectedFromProject ? '' : 'disabled-text'}`}> 
            <Lozenge appearance="inprogress">{issue.fields.issuetype.name}</Lozenge>
          </div>
          <div key={`issue-${issue.key}`} className={`issue-summary-panel ${issueIsInSelectedFromProject ? '' : 'disabled-text'}`}> 
            {issue.key}: {issue.fields.summary}
          </div>
        </div>
      );
    }) : null;
    return (
      <div className="padding-panel">
        <div className="content-panel">
        <h3>Step 2</h3>
          <h4>Confirm issues to move</h4>
          {renderIssueLoading()}
          <FormSection>
            {renderedSelectAllRow}
            {renderedIssues}
          </FormSection>
          {renderFlexboxEqualWidthGrowPanel()}
        </div>
      </div>
    );
  }

  const renderStartMoveButton = () => {
    const allowMove = selectedToProject && selectedToProject.id && selectedIssueKeys.length > 0;
    const buttonEnabled = !currentMoveActivity && allowMove;
    return (
      <Button
        appearance={buttonEnabled ? 'primary' : 'default'}
        isDisabled={!buttonEnabled}
        onClick={onMoveIssues}
      >
        Move issues
      </Button>
    );
  }

  const renderTargetPanel = () => {
    return (
      <div className="padding-panel">
        <div className="content-panel">
          <h3>Step 3</h3>
          <h4>Select target project</h4>
          {renderToProjectSelect()}
          {renderFlexboxEqualWidthGrowPanel()}
        </div>
      </div>
    );
  }

  const renderMoveActivityPanel = () => {
    return (
      <div className="padding-panel">
        <div className="content-panel">
          <h3>Step 4</h3>
          <h4>Move issues</h4>
          <FormSection>
            {renderStartMoveButton()}
          </FormSection>
          {renderIssueMoveLoading()}
          {renderIssueMoveRequestOutcome()}
          {renderIssueMoveOutcome()}
          {renderFlexboxEqualWidthGrowPanel()}
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

          <h4>Issue types</h4>
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
        <div className="warning-message">
          {mainWarningMessage}
        </div>
      );
    } else {
      return null;
    }
  }

  return (
    <div>
      {rendermainWarningMessage()}
      <div className="bulk-move-main-panel">
        {renderFilterPanel()}
        {renderIssuesPanel()}
        {renderTargetPanel()}
        {renderMoveActivityPanel()}
      </div>
      {renderDebugPanel()}
    </div>
  );
}

export default BulkMovePanel;
