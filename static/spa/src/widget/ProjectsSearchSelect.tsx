import React, { useEffect, useState } from 'react';
import { Label } from '@atlaskit/form';
import Select from '@atlaskit/select';
import { Option } from '../types/Option'
import { Project } from 'src/types/Project';
import { OnChangeValue } from '@atlaskit/react-select';

export type ProjectsSearchSelectProps = {
  label: string;
  selectedProjects: Project[];
  selectableProjects: Project[];
  isDisabled?: boolean;
  onProjectsSearchSelect: (selectedProject: Project[]) => Promise<void>;
}

const ProjectsSearchSelect = (props: ProjectsSearchSelectProps) => {

  const [projectInfoRetrievalTime, setProjectInfoRetrievalTime] = useState<number>(0);

  const refreshProjectInfo = async () => {
    setProjectInfoRetrievalTime(Date.now());
  }

  useEffect(() => {
    refreshProjectInfo();
  }, []);

  // const onChange = async (selectedOptions: Option[]): Promise<void> => {
  //   // console.log(`ProjectsSearchSelect.onChange: `, selectedOptions);
  //   const selectedProjects: Project[] = [];
  //   for (const selectedOption of selectedOptions) {
  //     const project = props.selectableProjects.find(project => project.id === selectedOption.value);
  //     if (project) {
  //       selectedProjects.push(project);
  //     }
  //   }
  //   await props.onProjectsSearchSelect(selectedProjects);
  // }

  const onChange = async (selectedOptions: any): Promise<void> => {
    // console.log(`ProjectsSearchSelect.onChange: `, selectedOptions);
    const selectedProjects: Project[] = [];
    for (const selectedOption of selectedOptions) {
      const project = props.selectableProjects.find(project => project.id === selectedOption.value);
      if (project) {
        selectedProjects.push(project);
      }
    }
    await props.onProjectsSearchSelect(selectedProjects);
  }

  const renderSelect = () => {
    const options: Option[] = props.selectableProjects.map((project: any) => ({
      label: project.name,
      value: project.id,
    }));
    const initiallySelectedOptions: Option[] = [];
    for (const option of options) {
      const selected = props.selectedProjects.find(selectableProject => selectableProject.id === option.value);
      if (selected) {
        initiallySelectedOptions.push(option);
      }
    }
    return (
      <Select
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

export default ProjectsSearchSelect;
