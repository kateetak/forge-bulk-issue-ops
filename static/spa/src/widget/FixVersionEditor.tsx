import React, { useEffect } from 'react';
import { Option } from '../types/Option'
import { IssueBulkEditField } from '../types/IssueBulkEditFieldApiResponse';
import Select from '@atlaskit/select';
import jiraDataModel from 'src/model/jiraDataModel';
import { ProjectVersion } from 'src/types/ProjectVersion';

export type FixVersionEditorValue = {
  versionId: string;
}

export type FixVersionEditorProps = {
  value?: FixVersionEditorValue;
  field: IssueBulkEditField;
  projectId: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  menuPortalTarget?: HTMLElement;
  onChange: (value: FixVersionEditorValue) => void;
}

export const FixVersionEditor = (props: FixVersionEditorProps) => {

  const [fixVersions, setFixVersions] = React.useState<ProjectVersion[] | undefined>(undefined);
  const [fixVersionOptions, setFixVersionOptions] = React.useState<Option[]>([]);

  const loadData = async () => {
    let projectVersions: ProjectVersion[] = [];
    if (props.projectId) {
      const projectVersionsInvocationResult = await jiraDataModel.getProjectVersions(props.projectId);
      if (projectVersionsInvocationResult.ok && projectVersionsInvocationResult.data) {
        projectVersions = projectVersionsInvocationResult.data;
      }
    } else {
      console.warn(`FixVersionEditor: No projectId provided, cannot load project versions.`);
      setFixVersionOptions([]);
    }
    setFixVersions(projectVersions);
    const options: Option[] = projectVersions.map(version => ({
      value: version.id,
      label: version.name,
    }));
    setFixVersionOptions(options);
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [props.projectId]);

  const onFixVersionOptionSelect = (selectedOption: Option) => {
    const fixVersionEditorValue: FixVersionEditorValue = {
      versionId: selectedOption.value
    }
    props.onChange(fixVersionEditorValue);
  }

  return (
    <div>
      <Select
        key={`fix-version-${props.projectId}`}
        id={`fix-version-${props.projectId}`}
        name={`fix-version-${props.projectId}`}
        isDisabled={props.isDisabled}
        isInvalid={props.isInvalid}
        defaultOptions={fixVersionOptions}
        menuPortalTarget={props.menuPortalTarget}
        onChange={onFixVersionOptionSelect}
      />
    </div>
  )

}
