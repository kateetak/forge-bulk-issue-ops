import React, { useEffect, useState } from 'react';
import Button from '@atlaskit/button/new';
import ProjectSelect from './widget/ProjectSelect';
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
import projectSearchInfoCache from './model/projectSearchInfoCache';
import issueTypesCache from './model/issueTypesCache';
import { TaskOutcome } from './types/TaskOutcome';
import taskModel from './controller/issueMoveController';
import { IssueSearchParameters } from './types/IssueSearchParameters';
import { IssueMoveRequestOutcome } from './types/IssueMoveRequestOutcome';
import jiraUtil from './controller/jiraUtil';

const showDebug = false;

export type BulkMovePanelProps = {
  invoke: any;
}

const issueMovePollPeriodMillis = 2000;

type DebugInfo = {
  projects: Project[];
  issueTypes: IssueType[];
}

const BulkMovePanel = (props: BulkMovePanelProps) => {

  const [debugInfo, setDebugInfo] = useState<DebugInfo>({ projects: [], issueTypes: [] });
  const [cachedProjectSearchInfo, setCachedProjectSearchInfo] = useState<ProjectSearchInfo>(nilProjectSearchInfo());
  const [issueLoadingState, setIssueLoadingState] = useState<LoadingState>('idle');
  const [selectedFromProject, setSelectedFromProject] = useState<undefined | Project>(undefined);
  const [selectedFromProjectTime, setSelectedFromProjectTime] = useState<number>(0);
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
  const [currentIssueMoveTaskId, setCurrentIssueMoveTaskId] = useState<undefined | string>(undefined);
  const [issueMoveRequestOutcome, setIssueMoveRequestOutcome] = useState<undefined | IssueMoveRequestOutcome>(undefined);
  const [issueMoveOutcome, setIssueMoveOutcome] = useState<undefined | TaskOutcome>(undefined);
  const [selectableIssueTypes, setSelectableIssueTypes] = useState<IssueType[]>([]);


  const retrieveAndSetDebugInfo = async (): Promise<void> => {
    const debugInfo: DebugInfo = {
      projects: (await projectSearchInfoCache.getProjectSearchInfo(props.invoke)).values,
      issueTypes: await issueTypesCache.getissueTypes(props.invoke)
    }
    setDebugInfo(debugInfo);
  }

  useEffect(() => {
    if (showDebug) {
      retrieveAndSetDebugInfo();
    }
  }, []);

  const toProjectInfoRetriever = async (): Promise<ProjectSearchInfo> => {
    const projectSearchInfo = await projectSearchInfoCache.getProjectSearchInfo(props.invoke);
    const toProjectSearchInfo = Object.assign({}, projectSearchInfo);
    const toProjects: Project[] = [];
    for (const project of toProjectSearchInfo.values) {
      if (selectedFromProject) {
        if (selectedFromProject.id !== project.id) {
          toProjects.push(project);
        }  
      } else {
        toProjects.push(project);
      }
    }
    toProjectSearchInfo.values = toProjects;
    return toProjectSearchInfo;
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

  const onSearchIssues = async (project: Project, issueTypes: IssueType[], labels: string[]): Promise<void> => {
    const previousSelectedToProject = selectedToProject;
    const noIssues = nilIssueSearchInfo();
    onIssuesLoaded(true, noIssues);


    // setIssueSearchInfo(noIssues);
    // setSelectedIssueKeys(noIssues.issues.map(issue => issue.key));
    // setIssueSearchInfoTime(Date.now());
    // setSelectedToProject(undefined);

    setIssueLoadingState('busy');
    setTimeout(async () => {
      const issueSearchParameters: IssueSearchParameters = {
        projectId: project.id,
        issueTypeIds: issueTypes.map(issueType => issueType.id),
        labels: labels
      }
      const params = {
        // projectId: project.id,
        // labels: selectedLabels,
        issueSearchParameters: issueSearchParameters
      }
      const issueSearchInfo = await props.invoke('getIssueSearchInfo', params);
      onIssuesLoaded(true, issueSearchInfo);
      setIssueLoadingState('idle');

    }, 1000);
  }

  const onFromProjectSelect = async (selectedProject: undefined | Project): Promise<void> => {
    // console.log(`selectedFromProject: `, selectedProject);
    setSelectedFromProject(selectedProject);
    setSelectedFromProjectTime(Date.now());
    await onSearchIssues(selectedProject, selectedIssueTypes, selectedLabels);

    const allIssueTypes: IssueType[] = await issueTypesCache.getissueTypes(props.invoke);
    const selectableIssueTypes = await jiraUtil.filterProjectIssueTypes(selectedProject, allIssueTypes);
    setSelectableIssueTypes(selectableIssueTypes);
  }

  const onToProjectSelect = async (selectedProject: undefined | Project): Promise<void> => {
    console.log(`selectedToProject: `, selectedProject);
    setSelectedToProject(selectedProject);
    setSelectedToProjectTime(Date.now());
  }

  const onIssueTypesSelect = async (selectedIssueTypes: IssueType[]): Promise<void> => {
    console.log(`selectedIssueTypes: `, selectedIssueTypes);
    setSelectedIssueTypes(selectedIssueTypes);
    setSelectedIssueTypesTime(Date.now());
    await onSearchIssues(selectedFromProject, selectedIssueTypes, selectedLabels);
  }

  const onLabelsSelect = async (selectedLabels: string[]): Promise<void> => {
    console.log(`selectedLabels: `, selectedLabels);
    setSelectedLabels(selectedLabels);
    setSelectedLabelsTime(Date.now());
    await onSearchIssues(selectedFromProject, selectedIssueTypes, selectedLabels);
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

  const onMoveIssues = async (): Promise<void> => {
    const destinationProjectId: string = selectedToProject.id;
    const destinationIssueTypeId: string = selectedIssueTypes[0].id;
    const issueIds = selectedIssueKeys;
    setIssueMoveRequestOutcome(undefined);
    const outcome: IssueMoveRequestOutcome = await taskModel.initiateMove(
      props.invoke,
      destinationProjectId,
      destinationIssueTypeId,
      issueIds
    );
    console.log(`BulkMovePanel: issue move request outcome: ${JSON.stringify(outcome, null, 2)}`);
    setIssueMoveRequestOutcome(outcome);
    if (outcome.statusCode === 201 && outcome.taskId) {
      setCurrentIssueMoveTaskId(outcome.taskId);
      setIssueMoveOutcome(undefined);
      const issueMoveOutcome = await taskModel.awaitMoveCompletion(props.invoke, outcome.taskId);
      setIssueMoveOutcome(issueMoveOutcome);
      setCurrentIssueMoveTaskId(undefined);  
    }
  }

  const renderFromProjectSelect = () => {
    return (
      <FormSection>
        <ProjectSelect 
          key={`from-project`}
          label="From project"
          selectedProjectId={undefined}
          invoke={props.invoke}
          onProjectSelect={onFromProjectSelect}
        />
      </FormSection>
    );
  }

  const renderToProjectSelect = () => {
    const allowSelection = selectedFromProject && selectedFromProject.id;
    return (
      <FormSection>
        <ProjectSelect 
          key={`to-project-${selectedFromProjectTime}`}
          label="To project"
          selectedProjectId={undefined}
          isDisabled={!allowSelection}
          invoke={props.invoke}
          projectInfoRetriever={toProjectInfoRetriever}
          onProjectSelect={onToProjectSelect}
        />
      </FormSection>
    );
  }

  const renderIssueTypesSelect = (selectedFromProject: Project) => {
    return (
      <FormSection>
        <IssueTypesSelect 
          key={`issue-type-select-${selectedFromProjectTime}-${selectedIssueTypesTime}`}
          label="Issue types"
          projectId={selectedFromProject.id}
          selectedIssueTypeIds={selectedIssueTypes.map(issueType => issueType.id)}
          invoke={props.invoke}
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
          invoke={props.invoke}
          onLabelsSelect={onLabelsSelect}
        />
      </FormSection>
    );
  }

  const renderFilterPanel = () => {
    return (
      <div className="target-panel">
        <h3>Step 1</h3>
        <h4>Select issue filter options</h4>
        {renderFromProjectSelect()}
        {selectedFromProject ? renderIssueTypesSelect(selectedFromProject) : null}
        {renderLabelsSelect()}
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
    return (
      <div style={{margin: '12px 0px 12px 0px'}}>
        {currentIssueMoveTaskId ? <LinearProgress color="secondary" /> : <div style={{height: '4px'}}></div>} 
      </div>
    );
  }

  const renderIssueMoveRequestOutcome = () => {
    if (issueMoveRequestOutcome) {
      // const renderedTaskId = issueMoveRequestOutcome.taskId ? <div>{issueMoveRequestOutcome.taskId}</div> : null;
      const renderedErrors = issueMoveRequestOutcome.errors ? issueMoveRequestOutcome.errors.map((error: Error, index: number) => {
        return (
          <div key={`issue-move-request-error-${index}`} className="error-message">
            {error.message}
          </div>
        );
      }) : null;
      return (
        <div>
          {/* renderedTaskId */}
          {renderedErrors}
        </div>
      );
    } else {
      return null;
    }
  }

  const renderIssueMoveOutcome = () => {
    if (issueMoveOutcome) {
      // const renderedMessage = issueMoveOutcome.message ? <div>{issueMoveOutcome.message}</div> : null;
      // const renderedErrors = issueMoveOutcome.errors ? issueMoveOutcome.errors.map((error: string, index: number) => {
      //   return (
      //     <div key={`issue-move-error-${index}`}>
      //       {error}
      //     </div>
      //   );
      // }) : null;
      const statusAppearance = issueMoveOutcome.status === 'COMPLETE' ? 'success' : 'removed';
      const renderedStatus = issueMoveOutcome.status ? <Lozenge appearance={statusAppearance}>{issueMoveOutcome.status}</Lozenge> : null;
      const movedCount = issueMoveOutcome.result ? issueMoveOutcome.result.successfulIssues[0] : 0;
      // const failedIssueKeys = issueMoveOutcome.result ? Object.keys(issueMoveOutcome.result.failedIssues) : [];
      const outcomeJson = JSON.stringify(issueMoveOutcome, null, 2);
      return (
        <div>
          Issue move outcome: <br/>
          Status: {issueMoveOutcome.status} <br/>
          Issues moved:  <br/>

          <pre>{outcomeJson}</pre>
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
              onChange={(event: any) => {
                // console.log(`Issue toggle event: ${JSON.stringify(event, null, 2)}`);
                onToggleIssueSelection(issue);
              }}
            />
          </div>
          <div key={`issue-${issue.key}`} className="issue-summary-panel">
            {issue.key}: {issue.fields.summary}
          </div>
        </div>
      );
    }) : null;
    return (
      <div className="issue-panel">
        <h3>Step 2</h3>
        <h4>Confirm issues to move</h4>
        {renderIssueLoading()}
        <FormSection>
          {renderedSelectAllRow}
          {renderedIssues}
        </FormSection>
      </div>
    );
  }

  const renderStartMoveButton = () => {
    const allowMove = selectedToProject && selectedToProject.id && selectedIssueKeys.length > 0;
    const buttonEnabled = !currentIssueMoveTaskId && allowMove;
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
      <div className="target-panel">
        <h3>Step 3</h3>
        <h4>Select target project</h4>
        {renderToProjectSelect()}
      </div>
    );
  }

  const renderMoveActivityPanel = () => {
    return (
      <div className="target-panel">
        <h3>Step 4</h3>
        <h4>Move issues</h4>
        <FormSection>
          {renderStartMoveButton()}
        </FormSection>
        {renderIssueMoveLoading()}
        {renderIssueMoveRequestOutcome()}
        {renderIssueMoveOutcome()}
      </div>
    );
  }

  const renderDebugPanel = () => {
    if (showDebug) {
      return (
        <div className="debug-panel">
          <h3>Debug</h3>

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

  return (
    <div>
      <h2>Custom Bulk Move</h2>
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
