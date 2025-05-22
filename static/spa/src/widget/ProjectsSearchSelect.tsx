import React, { useEffect, useState } from 'react';
import { Label } from '@atlaskit/form';
import Select from '@atlaskit/select';
import { Option } from '../types/Option'
import { Project } from 'src/types/Project';

export type ProjectsSearchSelectProps = {
  label: string;
  selectedProjects: Project[];
  // selectableProjects: Project[];
  isDisabled?: boolean;
  onProjectsSearchSelect: (selectedProject: Project[]) => Promise<void>;
}

const buildDummyProjects = (): Project[] => {
  const dummyProjects: Project[] = [];
  for (let i = 0; i < 500; i++) {
    const project: Project = {
      id: `${10000 + i}`,
      name: `Project ${i + 1}`,
      key: `PPP${i}`,
      projectTypeKey: 'software',
      simplified: false,
      style: 'classic',
      isPrivate: false,
      properties: {},
    };
    dummyProjects.push(project);
  }
  return dummyProjects;
}

const ProjectsSearchSelect = (props: ProjectsSearchSelectProps) => {

  const allProjects: Project[] = buildDummyProjects();

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
      // const project = props.selectableProjects.find(project => project.id === selectedOption.value);
      const project = allProjects.find(project => project.id === selectedOption.value);
      if (project) {
        selectedProjects.push(project);
      }
    }
    await props.onProjectsSearchSelect(selectedProjects);
  }

  const projectToOption = (project: Project): Option => {
    const option: Option = {
      label: `${project.name} (${project.key})`,
      value: project.id,
    };
    return option;
  }

  const projectsToOptions = (projects: Project[]): Option[] => {
    return projects.map(projectToOption);
  }

  const filterProjects = (inputValue: string) => {
    const inputValueLower = inputValue.toLowerCase();
    return allProjects.filter((project: Project) => {
      return project.name.includes(inputValueLower) || project.key.includes(inputValueLower);
    });
  }

  const promiseOptions = (inputValue: string) =>
    new Promise<Option[]>((resolve) => {
      setTimeout(() => {
        const filteredProjects = filterProjects(inputValue);
        const filteredProjectsOptions = projectsToOptions(filteredProjects);
        resolve(filteredProjectsOptions);
      }, 1000);
    });

  const renderSelect = () => {
    // const defaultOptions: Option[] = projectsToOptions(props.selectableProjects);
    // const initiallySelectedOptions: Option[] = [];
    // for (const option of defaultOptions) {
    //   const selected = props.selectedProjects.find(selectableProject => selectableProject.id === option.value);
    //   if (selected) {
    //     initiallySelectedOptions.push(option);
    //   }
    // }
    const defaultOptions: Option[] = [];
    return (
      <Select
        key={`projects-select-${projectInfoRetrievalTime}`}
        inputId="checkbox-select-example"
        testId="projects-select"
        // defaultValue={initiallySelectedOptions}
        defaultOptions={defaultOptions}
        cacheOptions
				loadOptions={promiseOptions}
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
