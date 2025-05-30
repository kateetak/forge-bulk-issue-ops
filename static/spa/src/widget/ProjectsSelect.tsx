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
  filterProjects?: (projectsToFilter: Project[]) => Promise<Project[]>;
  onProjectsSelect: (selectedProjects: Project[]) => Promise<void>;
}

const ProjectsSelect = (props: ProjectsSelectProps) => {

  const [loadingOption, setLoadingOption] = useState<boolean>(false);
  const [currentProjects, setCurrentProjects] = useState<Project[]>([]);

  const onChange = async (selection: undefined | Option | Option[]): Promise<void> => {
    // console.log(`ProjectsSelect.onChange: `, selectedOptions);
    let selectedProjects: Project[] = [];
    if (!selection) {
      selectedProjects = [];
    } else if (props.isMulti) {
      const selectedOptions = selection as Option[];
      for (const selectedOption of selectedOptions) {
        const project = currentProjects.find(project => project.id === selectedOption.value);
        if (project) {
          selectedProjects.push(project);
        }
      }
    } else {
      const selectedOption = selection as Option;
      if (selectedOption.value) {
        const selectedUser = currentProjects.find(project => project.id === selectedOption.value);
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
    setLoadingOption(true);
    try {
      let retrevedProjectsInfo = await jiraDataModel.pageOfProjectSearchInfo(inputValue);
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
