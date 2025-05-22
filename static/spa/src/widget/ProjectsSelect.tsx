import React, { useEffect, useState } from 'react';
import { Label } from '@atlaskit/form';
import Select from '@atlaskit/select';
import { Option } from '../types/Option'
import { Project } from 'src/types/Project';
import { getProjectSearchInfo } from 'src/controller/jiraClient';

export type ProjectsSelectProps = {
  label: string;
  selectedProjects: Project[];
  isMulti: boolean
  isDisabled?: boolean;
  filterProjects?: (projectsToFilter: Project[]) => Promise<Project[]>;
  onProjectsSelect: (selectedProject: Project[]) => Promise<void>;
}

const ProjectsSelect = (props: ProjectsSelectProps) => {

  const [loadingOption, setLoadingOption] = useState<boolean>(false);
  const [currentProjects, setCurrentProjects] = useState<Project[]>([]);

  const onChange = async (selection: any): Promise<void> => {
    // console.log(`ProjectsSelect.onChange: `, selectedOptions);
    let selectedProjects: Project[] = [];
    if (props.isMulti) {
      const selectedOptions = selection as Option[];
      for (const selectedOption of selectedOptions) {
        const project = currentProjects.find(project => project.id === selectedOption.value);
        if (project) {
          selectedProjects.push(project);
        }
      }
    } else {
      const selectedOption = selection as Option;
      const selectedProject = currentProjects.find(project => project.id === selectedOption.value);
      selectedProjects = [selectedProject];
    }
    await props.onProjectsSelect(selectedProjects);  
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

  const promiseOptions = async (inputValue: string): Promise<Option[]> => {
    console.log(`ProjectsSearhSelect: In promiseOptions(${inputValue})`);
    setLoadingOption(true);
    try {
      let retrevedProjectsInfo = await getProjectSearchInfo(inputValue);
      let retrevedProjects = retrevedProjectsInfo.values;
      if (props.filterProjects) {
        retrevedProjects = await props.filterProjects(retrevedProjects);
      }
      setCurrentProjects(retrevedProjects);
      return projectsToOptions(retrevedProjects);
    } finally {
      setLoadingOption(false);
    } 
  }

  const renderSelect = () => {
    return (
      <Select
        inputId="checkbox-select-example"
        testId="projects-select"
        isMulti={props.isMulti}
        isRequired={true}
        defaultOptions
        cacheOptions
        isDisabled={props.isDisabled}
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

export default ProjectsSelect;
