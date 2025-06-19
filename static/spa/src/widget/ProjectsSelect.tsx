import React, { useEffect, useState, useRef } from 'react';
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
  menuPortalTarget?: HTMLElement;
  filterProjects?: (projectsToFilter: Project[]) => Promise<Project[]>;
  onProjectsSelect: (selectedProjects: Project[]) => Promise<void>;
}

const ProjectsSelect = (props: ProjectsSelectProps) => {

  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [foundProjects, setFoundProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const lastInvocationNumberRef = useRef<number>(0);

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
    // console.log(`ProjectsSelect.onChange: ${selection ? JSON.stringify(selection) : 'undefined'}`);
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
    lastInvocationNumberRef.current = lastInvocationNumberRef.current + 1;
    const myInvocationNumber = lastInvocationNumberRef.current;
    // console.log(`ProjectsSearhSelect: In promiseOptions(inputValue = '${inputValue}')`);
    setLoadingOptions(true);
    try {
      setUserInput(inputValue);
      const retrevedProjectsInfo = await jiraDataModel.pageOfProjectSearchInfo(inputValue);
      // console.log(`ProjectsSelect.promiseOptions: retrevedProjectsInfo for inputValue = ${inputValue} (userInput = ${userInput})`);
      if (myInvocationNumber >= lastInvocationNumberRef.current) {
        console.log(`ProjectsSelect.promiseOptions: userInput is still '${inputValue}', applying results...`);
        const foundProjects = retrevedProjectsInfo.values;
        setFoundProjects(foundProjects);
        const filteredProjects = await filterFoundProjects(foundProjects);
        if (myInvocationNumber >= lastInvocationNumberRef.current) {
          setFilteredProjects(filteredProjects);
          const options = projectsToOptions(filteredProjects);
          return options;
        } else {
          // Return options from filteredProjects since this invocation is stale.
          // console.log(`ProjectsSelect.promiseOptions: after filtering, userInput changed from '${userInput}' to '${inputValue}', ignoring results`);
          const options = projectsToOptions(filteredProjects);
          return options;
        }
      } else {
        // Return options from filteredProjects since this invocation is stale.
        // console.log(`ProjectsSelect.promiseOptions: userInput changed from '${userInput}' to '${inputValue}', ignoring results`);
        const options = projectsToOptions(filteredProjects);
        return options;
      }
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
        menuPortalTarget={props.menuPortalTarget}
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


