import React, { useEffect, useState } from 'react';
import { Label } from '@atlaskit/form';
import Select from '@atlaskit/select';
import { Option } from '../types/Option'
import { Project } from '../types/Project';
import jiraDataModel from '../model/jiraDataModel';
import { formatProject } from '../controller/formatters';

/*
  Select docs: https://atlassian.design/components/select/examples
*/

export type ProjectsSelectProps = {
  label: string;
  selectedProjects: Project[];
  isMulti: boolean
  isDisabled?: boolean;
  isClearable: boolean;
  targetProjectsFilterConditionsChangeTime?: number;
  filterProjects?: (projectsToFilter: Project[]) => Promise<Project[]>;
  onProjectsSelect: (selectedProjects: Project[]) => Promise<void>;
}

const ProjectsSelect = (props: ProjectsSelectProps) => {

  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [foundProjects, setFoundProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  const filterProjects = async (projectsToFilter: Project[]): Promise<Project[]> => {
    let filteredProjects = projectsToFilter;
    if (props.filterProjects) {
      filteredProjects = await props.filterProjects(projectsToFilter);
    }
    setFilteredProjects(filteredProjects);
    return filteredProjects;
  }

  const filterFoundProjects = async (foundProjects: Project[]): Promise<Project[]> => {
    // console.log(`ProjectsSelect.filterFoundProjects: foundProjects = ${foundProjects.map(project => project.key).join(', ')}`);
    setLoadingOptions(true);
    try {
      const filteredProjects = await filterProjects(foundProjects);
      setFilteredProjects(filteredProjects);
      return filteredProjects;
    } finally {
      setLoadingOptions(false);
    } 
  }

  useEffect(() => {
    filterFoundProjects(foundProjects);
  }, [props.targetProjectsFilterConditionsChangeTime]);

  const onChange = async (selection: undefined | Option | Option[]): Promise<void> => {
    // console.log(`ProjectsSelect.onChange: `, selectedOptions);
    let selectedProjects: Project[] = [];
    if (!selection) {
      selectedProjects = [];
    } else if (props.isMulti) {
      const selectedOptions = selection as Option[];
      for (const selectedOption of selectedOptions) {
        const project = filteredProjects.find(project => project.id === selectedOption.value);
        if (project) {
          selectedProjects.push(project);
        }
      }
    } else {
      const selectedOption = selection as Option;
      if (selectedOption.value) {
        const selectedUser = filteredProjects.find(project => project.id === selectedOption.value);
        selectedProjects = [selectedUser];
      } else {
        selectedProjects = [];
      }
    }
    await props.onProjectsSelect(selectedProjects);
  }

  const projectToOption = (project: Project): Option => {
    const option: Option = {
      label: formatProject(project),
      value: project.id,
    };
    return option;
  }

  const projectsToOptions = (projects: Project[]): Option[] => {
    return projects.map(projectToOption);
  }

  const promiseOptions = async (inputValue: string): Promise<Option[]> => {
    // console.log(`ProjectsSearhSelect: In promiseOptions(${inputValue})`);
    setLoadingOptions(true);
    try {
      setUserInput(inputValue);
      const retrevedProjectsInfo = await jiraDataModel.pageOfProjectSearchInfo(userInput);
      const foundProjects = retrevedProjectsInfo.values;
      setFoundProjects(foundProjects);
      const filteredProjects = await filterFoundProjects(foundProjects);
      return projectsToOptions(filteredProjects);
    } finally {
      setLoadingOptions(false);
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
        isClearable={props.isClearable}
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
