import React, { useEffect, useState } from 'react';
import { Label } from '@atlaskit/form';
import { CheckboxSelect } from '@atlaskit/select';
import { Option } from '../types/Option'
import { Project } from 'src/types/Project';

export type ProjectsSelectProps = {
  label: string;
  selectedProjects: Project[];
  selectableProjects: Project[];
  isDisabled?: boolean;
  // projectInfo: ProjectSearchInfo;
  onProjectsSelect: (selectedProject: Project[]) => Promise<void>;
}

const ProjectsSelect = (props: ProjectsSelectProps) => {

  // const [projectInfo, setProjectInfo] = useState<ProjectSearchInfo>(nilProjectSearchInfo());
  const [projectInfoRetrievalTime, setProjectInfoRetrievalTime] = useState<number>(0);

  const refreshProjectInfo = async () => {
    // const projectInfo = props.projectInfo;
    // setProjectInfo(projectInfo);
    setProjectInfoRetrievalTime(Date.now());
  }

  useEffect(() => {
    refreshProjectInfo();
  }, []);

  const onChange = async (selectedOptions: Option[]): Promise<void> => {
    // console.log(`ProjectsSelect.onChange: `, selectedOptions);
    const selectedProjects: Project[] = [];
    for (const selectedOption of selectedOptions) {
      const project = props.selectableProjects.find(project => project.id === selectedOption.value);
      if (project) {
        selectedProjects.push(project);
      }
    }
    await props.onProjectsSelect(selectedProjects);
  }

  const renderSelect = () => {
    // const options: Option[] = projectInfo.values.map((project: any) => ({
    const options: Option[] = props.selectableProjects.map((project: any) => ({
      label: project.name,
      value: project.id,
    }));
    // console.log(`Project options = ${JSON.stringify(options, null, 2)}`);
    // const defaultValue = options.find((option) => option.value === props.selectedProjectId);
    const initiallySelectedOptions: Option[] = [];
    for (const option of options) {
      const selected = props.selectedProjects.find(selectableProject => selectableProject.id === option.value);
      // console.log(`Checking option ${option.label} / ${option.value} against ${JSON.stringify(props.selectedIssueTypeIds)}. selected = ${selected}`);
      if (selected) {
        initiallySelectedOptions.push(option);
      }
    }
    return (
      <CheckboxSelect
        key={`projects-select-${projectInfoRetrievalTime}`}
        inputId="checkbox-select-example"
        testId="projects-select"
        defaultValue={initiallySelectedOptions}
        options={options}
        placeholder={props.label}
        onChange={onChange}
      />
    );
  }

  return (
    <>
      <Label htmlFor="projects-select">{props.label}</Label>
      {renderSelect()}
    </>
  );
}

export default ProjectsSelect;
