import React, { useEffect, useState } from 'react';
import { Label } from '@atlaskit/form';
import { RadioSelect } from '@atlaskit/select';
import { Option } from '../types/Option'
import { Project } from 'src/types/Project';
import { ProjectSearchInfo } from 'src/types/ProjectSearchInfo';
import { nilProjectSearchInfo } from 'src/model/nilProjectSearchInfo';
import projectSearchInfoCache from 'src/model/projectSearchInfoCache';

export type ProjectSelectProps = {
  label: string;
  selectedProjectId: string;
  isDisabled?: boolean;
  projectInfo: ProjectSearchInfo;
  onProjectSelect: (selectedProject: undefined | Project) => Promise<void>;
}

const ProjectSelect = (props: ProjectSelectProps) => {

  const [projectInfo, setProjectInfo] = useState<ProjectSearchInfo>(nilProjectSearchInfo());
  const [projectInfoRetrievalTime, setProjectInfoRetrievalTime] = useState<number>(0);

  const refreshProjectInfo = async () => {
    const projectInfo = props.projectInfo;
    setProjectInfo(projectInfo);
    setProjectInfoRetrievalTime(Date.now());
  }

  useEffect(() => {
    refreshProjectInfo();
  }, []);

  const onChange = async (selectedOption: undefined | Option): Promise<void> => {
    // console.log(`ProjectSelect.onChange: `, selectedOption);
    if (selectedOption) {
      const project = projectInfo.values.find((project: Project) => {
        return project.id === selectedOption.value;
      })
      await props.onProjectSelect(project);
    } else {
      await props.onProjectSelect(undefined);
    }
  }

  const renderSelect = () => {
    const options: Option[] = projectInfo.values.map((project: any) => ({
      label: project.name,
      value: project.id,
    }));
    // console.log(`Project options = ${JSON.stringify(options, null, 2)}`);
    const defaultValue = options.find((option) => option.value === props.selectedProjectId);
    return (
      <RadioSelect
        key={`project-select-${projectInfoRetrievalTime}`}
        inputId="radio-select-example"
        testId="project-select"
        isDisabled={props.isDisabled}
        defaultValue={defaultValue}
        options={options}
        placeholder={props.label}
        onChange={onChange}
      />
    );
  }

  return (
    <>
      <Label htmlFor="async-select-example">{props.label}</Label>
      {renderSelect()}
    </>
  );
}

export default ProjectSelect;
