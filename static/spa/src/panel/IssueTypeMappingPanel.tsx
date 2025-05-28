import React, { useEffect, useState } from 'react';
import { Issue } from "../types/Issue";
import { IssueType } from '../types/IssueType';
import { Project } from 'src/types/Project';
import Select from '@atlaskit/select';
import { Option } from '../types/Option'
import jiraDataModel from 'src/model/jiraDataModel';
import bulkIssueTypeMapping from 'src/model/bulkIssueTypeMapping';

const showDebug = false;

type RowData = {
  sourceProject: Project;
  sourceIssueType: IssueType;
}

export type IssueTypeMappingPanelProps = {
  selectedIssues: Issue[];
  targetProject: undefined | Project;
}

const IssueTypeMappingPanel = (props: IssueTypeMappingPanelProps) => {

  const buildAllRowData = (issues: Issue[]): RowData[] => {
    const allRowData: RowData[] = [];
    const consumedProjectIssueTypePairs = new Set<string>();
    for (const issue of issues) {
      const project = issue.fields.project;
      const issueType = issue.fields.issuetype;
      const projectIssuTypePair = `${project.id},${issueType.id}`;
      if (!consumedProjectIssueTypePairs.has(projectIssuTypePair)) {
        consumedProjectIssueTypePairs.add(projectIssuTypePair);
        const rowData: RowData = {
          sourceProject: project,
          sourceIssueType: issueType
        };
        allRowData.push(rowData);
      }
    }
    return allRowData;
  }

  const cloneSourceToTagetIssueTypeIds = (): Map<string, string> => {
    // console.log('Cloning sourceToTagetIssueTypeIds map from bulkIssueTypeMapping');
    const originalSourceToTagetIssueTypeIds = bulkIssueTypeMapping.sourceToTagetIssueTypeIds;
    const clonedMap = new Map<string, string>();
    originalSourceToTagetIssueTypeIds.forEach((value, key) => {
      // console.log(` * Cloning mapping: ${key} -> ${value}`);
      clonedMap.set(key, value);
    });
    return clonedMap;
  }

  const [targetProjectIssueTypes, setTargetProjectIssueTypes] = useState<IssueType[]>([]);
  const [allRowData, setAllRowData] = useState<RowData[]>(buildAllRowData(props.selectedIssues));
  const [clonedSourceToTagetIssueTypeIds, setClonedSourceToTagetIssueTypeIds] = useState<Map<string, string>>(
    cloneSourceToTagetIssueTypeIds());

  const getTargetIssueTypeId = (sourceProjectId: string, sourceIssueTypeId: string): string | undefined => {
    const key = buildKey(sourceProjectId, sourceIssueTypeId);
    return clonedSourceToTagetIssueTypeIds.get(key);
  }

  const buildKey = (sourceProjectId: string, sourceIssueTypeId: string): string => {
    return `${sourceProjectId},${sourceIssueTypeId}`;
  }

  const onTargetIssueTypeChange = (sourceProjectId: string, sourceIssueTypeId: string, targetIssueTypeId: string) => {
    bulkIssueTypeMapping.addMapping(sourceProjectId, sourceIssueTypeId, targetIssueTypeId);
  }

  const determineInitiallySelectedOption = (
      sourceProjectId: string,
      sourceIssueTypeId: string,
      options: Option[]
    ): undefined | Option => {
    // console.log(`Determining initially selected option for source project: ${sourceProjectId}, source issue type: ${sourceIssueTypeId}`);
    const targetIssueTypeId = getTargetIssueTypeId(sourceProjectId, sourceIssueTypeId);
    const option = options.find((option: Option) => option.value === targetIssueTypeId);
    // console.log(` * initially selected option: ${option ? option.label : 'none'}`);
    return option;
  }

  const renderTargetProjectIssueTypeSelect = (sourceProjectId: string, sourceIssueTypeId: string) => {
    const options: Option[] = [];
    for (const issueType of targetProjectIssueTypes.map(issueType => issueType)) {
      const option: Option = {
        label: `${issueType.name} (${issueType.id})`,
        value: issueType.id,
      };
      options.push(option);
    }
    const defaultValue = determineInitiallySelectedOption(sourceProjectId, sourceIssueTypeId, options);
    return (
      <div>
        <Select
          inputId="target-issue-type-select"
          isMulti={false}
          isRequired={true}
          options={options}
          value={defaultValue}
          placeholder="Select issue type"
          onChange={(option: Option) => {
            console.log(`Selected target issue type: "${option.label} (${option.value})" for source project: ${sourceProjectId}, source issue type: ${sourceIssueTypeId}`);
            const issueTypeId = option.value;
            onTargetIssueTypeChange(sourceProjectId, sourceIssueTypeId, issueTypeId);
          }}
        />
      </div>
    );
  }

  const loadTargetProjectIssueTypes = async () => {
    console.log(`Loading issue types for target project: ${props.targetProject ? props.targetProject.id : 'none'}`);
    if (props.targetProject) {
      const projectInvocationResult = await jiraDataModel.getProjectById(props.targetProject.id);
      if (projectInvocationResult.data) {
        const issueTypes = projectInvocationResult.data.issueTypes;
        setTargetProjectIssueTypes(issueTypes);
      } else {
        console.error('Failed to load issue types for target project: ', projectInvocationResult.errorMessage);
        setTargetProjectIssueTypes([]);
      }
    } else {
      setTargetProjectIssueTypes([]);
    }
  }

  const onBulkIssueTypeMappingChange = () => {
    console.log('IssueTypeMappingPanel: bulkIssueTypeMapping changed, rebuilding all row data.');
    setAllRowData(buildAllRowData(props.selectedIssues));
    setClonedSourceToTagetIssueTypeIds(cloneSourceToTagetIssueTypeIds());
  }
 
  useEffect(() => {
    setClonedSourceToTagetIssueTypeIds(cloneSourceToTagetIssueTypeIds());
    bulkIssueTypeMapping.registerListener(onBulkIssueTypeMappingChange);
    return () => {
      bulkIssueTypeMapping.unregisterListener(onBulkIssueTypeMappingChange);
    };
  }, []);


  useEffect(() => {
    loadTargetProjectIssueTypes();
  }, [props.targetProject]);

  const renderMappings = () => {
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th className="no-break">Project</th>
              <th className="no-break">Issue type</th>
              <th className="no-break">New issue type</th>
            </tr>
          </thead>
          <tbody>
            {
              allRowData.map(row => (
                <tr key={`source-issue-type-${row.sourceProject.id}-${row.sourceIssueType.id}`}>
                  <td>{row.sourceProject.name} ({row.sourceProject.key})</td>
                  <td>{row.sourceIssueType.name} {row.sourceIssueType.id}</td>
                  <td>{renderTargetProjectIssueTypeSelect(row.sourceProject.id, row.sourceIssueType.id)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    );
  }

  const renderDataNotRetrievedYet = () => {
    return (
      <div>
        <p>Waiting for previous steps to be completed.</p>
      </div>
    );
  }

  const renderPanel = () => {
    if (props.targetProject && props.selectedIssues.length > 0) {
      return renderMappings();
    } else {
      return renderDataNotRetrievedYet();
    }
  }

  const renderDebug = () => {
    const clonedSourceToTagetIssueTypeIdsAsObject = Object.fromEntries(clonedSourceToTagetIssueTypeIds);
    const targetIssueTypeInfo = targetProjectIssueTypes.map(issueType => ({
      id: issueType.id,
      name: issueType.name,
    }));
    return (
      <div>
        <h3>Debug Information</h3>
        <p>Time = {new Date().toISOString()}</p>
        <p>Target project issue types:</p>

        <pre>
          {JSON.stringify(targetIssueTypeInfo, null, 2)}
        </pre>
        <p>Cloned source project:issueType to issue types:</p>
        <pre>
          {JSON.stringify(clonedSourceToTagetIssueTypeIdsAsObject)}
        </pre>
      </div>
    );
  }

  return (
    <div style={{margin: '20px 0px'}}>
      {renderPanel()}
      {showDebug ? renderDebug() : null}
    </div>
  )

}
export default IssueTypeMappingPanel;
