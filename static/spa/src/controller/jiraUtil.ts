import { IssueType } from "src/types/IssueType";
import { Project } from "src/types/Project";
import { ProjectSearchInfo } from "src/types/ProjectSearchInfo";

class JiraUtil {

  removeProjectsFromSearchInfo = (projectsToRemove: Project[], projectSearchInfo: ProjectSearchInfo): ProjectSearchInfo => {
    const filteredProjects = projectSearchInfo.values.filter(project => {
      const foundProject = projectsToRemove.find(projectToRemove => projectToRemove.id === project.id);
      if (foundProject) { 
        return false;
      }
      return true;
    });
    const filteredProjectSearchInfo: ProjectSearchInfo = {
      maxResults: 0,
      startAt: 0,
      total: filteredProjects.length,
      isLast: true,
      values: filteredProjects
    }
    return filteredProjectSearchInfo;
  }

  removeProjectFromSearchInfo = (projectToRemove: Project, projectSearchInfo: ProjectSearchInfo): ProjectSearchInfo => {
    const filteredProjects = projectSearchInfo.values.filter(project => project.id !== projectToRemove.id);
    const filteredProjectSearchInfo: ProjectSearchInfo = {
      maxResults: 0,
      startAt: 0,
      total: filteredProjects.length,
      isLast: true,
      values: filteredProjects
    }
    return filteredProjectSearchInfo;
  }

  filterProjectIssueTypes = (project: Project, allIssueTypes: IssueType[]): IssueType[] => {
    // console.log(`filterProjectIssueTypes:`);
    // console.log(` * project.id: ${project.id}`);
    // console.log(` * project.name: ${project.name}`);
    const filteredIssueTypes: IssueType[] = [];
    const isTeamManagedProject = project.simplified;
    for (const issueType of allIssueTypes) {
      if (isTeamManagedProject) {
        if (issueType.scope && issueType.scope.type === 'PROJECT' && issueType.scope.project.id === project.id) {
          filteredIssueTypes.push(issueType);
        }
      } else {
        if (issueType.scope) {
          // Skip
        } else {
          filteredIssueTypes.push(issueType);
        }
      }
    }
    // console.log(` * returning: ${JSON.stringify(filteredIssueTypes, null, 2)}`);
    return filteredIssueTypes;
  }

  determineProjectsWithIssueTypes = async (subjectIssueType: IssueType, projects: Project[], issueTypes: IssueType[]): Promise<Project[]> => {
    console.log(`determineProjectsWithIssueTypes:`);
    console.log(` * subjectIssueType: ${JSON.stringify(subjectIssueType, null, 2)}`);
    console.log(` * projects: ${JSON.stringify(projects, null, 2)}`);
    console.log(` * issueTypes: ${JSON.stringify(issueTypes, null, 2)}`);
    const filteredProjects: Project[] = [];
    for (const project of projects) {
      if (this.isIssueTypeInProject(subjectIssueType, project, issueTypes, projects)) {
        filteredProjects.push(project);
      }
    }
    return filteredProjects;
  }

  isIssueTypeInProject = (subjectIssueType: IssueType, subjectProject: Project, issueTypes: IssueType[], projects: Project[]): boolean => {
    const projectIssueTypes = this.getProjectIssueTypes(projects.find(project => project.id === subjectProject.id)!, issueTypes);
    const foundIssueType = projectIssueTypes.find(issueType => issueType.id === subjectIssueType.id || issueType.name === subjectIssueType.name);
    return !!foundIssueType;
  }

  getProjectIssueTypes = (project: Project, issueTypes: IssueType[]): IssueType[] => {
    const isTeamManagedProject = project.simplified;
    if (isTeamManagedProject) {
      const projectIssueTypes: IssueType[] = [];
      for (const issueType of issueTypes) {
        if (issueType.scope && issueType.scope.type === 'PROJECT' && issueType.scope.project.id === project.id) {
          projectIssueTypes.push(issueType);
        }
      }
      return projectIssueTypes;
    } else {
      const filteredIssueTypes: IssueType[] = [];
      for (const issueType of issueTypes) {
        if (!issueType.scope) {
          filteredIssueTypes.push(issueType);
        }
      }
      return filteredIssueTypes;
    }
  }
  
}

export default new JiraUtil();
