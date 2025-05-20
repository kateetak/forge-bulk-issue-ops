import React, { useEffect, useState } from 'react';
import { Label } from '@atlaskit/form';
import { CheckboxSelect } from '@atlaskit/select';
import { Option } from '../types/Option'
import { IssueType } from '../types/IssueType';
import projectSearchInfoCache from '../model/projectSearchInfoCache';
import { Project } from '../types/Project';

export type IssueTypesSelectProps = {
  label: string;
  projectId: string;
  selectedIssueTypeIds: string[];
  selectableIssueTypes: IssueType[];
  invoke: any;
  onIssueTypesSelect: (selectedIssueTypes: IssueType[]) => Promise<void>;
}

const IssueTypesSelect = (props: IssueTypesSelectProps) => {

  const [issueTypeInfoRetrievalTime, setIssueTypeInfoRetrievalTime] = useState<number>(0);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  const retrieveProjects = async () => {
    const projectSearchInfo = await projectSearchInfoCache.getProjectSearchInfo(props.invoke);
    setAllProjects(projectSearchInfo.values);
  }

  useEffect(() => {
    retrieveProjects();
  }, []);

  const onChange = async (selectedOptions: Option[]): Promise<void> => {
    // console.log(`IssueTypesSelect.onChange: `, selectedOptions);
    const issueTypes: IssueType[] = props.selectableIssueTypes;;
    const selectedIssueTypes: IssueType[] = [];
    for (const selectedOption of selectedOptions) {
      const issueType = issueTypes.find(issueType => issueType.id === selectedOption.value);
      if (issueType) {
        selectedIssueTypes.push(issueType);
      }
    }
    await props.onIssueTypesSelect(selectedIssueTypes);
  }

  const issueTypeToLabel = (issueType: IssueType): string => {
    // let label = `${issueType.name} (${issueType.id})`;
    let label = `${issueType.name}`;
    if (issueType.scope) {
      const maybeProject = allProjects.find(project => project.id === issueType.scope.project.id);
      label += ` - ${maybeProject ? maybeProject.name : issueType.scope.project.id}`;
    }
    return label;
  }

  const renderCheckboxSelect = () => {
    const issueTypes: IssueType[] = props.selectableIssueTypes;;
    // console.log(`Rendering issue types select. project ID = ${projectId}, issueTypes.length = ${issueTypes.length}`);
    const options: Option[] = issueTypes.map((issueType: any) => ({
      label: issueTypeToLabel(issueType),
      value: issueType.id,
    }));
    const initiallySelectedOptions: Option[] = [];
    for (const option of options) {
      const selected = props.selectedIssueTypeIds.find(selectedIssueTypeId => selectedIssueTypeId === option.value);
      // console.log(`Checking option ${option.label} / ${option.value} against ${JSON.stringify(props.selectedIssueTypeIds)}. selected = ${selected}`);
      if (selected) {
        initiallySelectedOptions.push(option);
      }
    }
    return (
      <CheckboxSelect
        key={`multi-issue-types-select-${issueTypeInfoRetrievalTime}`}
        inputId="checkbox-select-example"
        testId="issue-types-select"
        defaultValue={initiallySelectedOptions}
        options={options}
        placeholder={props.label}
        onChange={onChange}
      />
    );
  }

  return (
    <>
      <Label htmlFor="async-select-example">{props.label}</Label>
      {renderCheckboxSelect()}
    </>
  );
}

export default IssueTypesSelect;
