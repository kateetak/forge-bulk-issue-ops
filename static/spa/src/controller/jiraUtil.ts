import { Issue } from "src/types/Issue";
import { IssueType } from "../types/IssueType";
import { Project } from "../types/Project";
import { ProjectSearchInfo } from "../types/ProjectSearchInfo";

class JiraUtil {

  filterProjectsIssueTypes = (projects: Project[], allIssueTypes: IssueType[]): IssueType[] => {
    const filteredIssueTypes = new Set<IssueType>();
    // const isTeamManagedProject = project.simplified;
    for (const issueType of allIssueTypes) {
      if (this.isIssueTypeInProjects(issueType, projects)) {
        filteredIssueTypes.add(issueType);
      }
    }
    return Array.from(filteredIssueTypes);
  }

  isIssueTypeInProjects = (issueType: IssueType, projects: Project[]): boolean => {
    const isTeamManagedProject = issueType.scope && issueType.scope.type === 'PROJECT';
    if (isTeamManagedProject) {
      for (const project of projects) {
        if (issueType.scope && issueType.scope.type === 'PROJECT' && issueType.scope.project.id === project.id) {
          return true;
        }
      }
    } else {
      if (issueType.scope) {
        return false;
      } else {
        return true;
      }
    }
    
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
    // console.log(`determineProjectsWithIssueTypes:`);
    // console.log(` * subjectIssueType: ${JSON.stringify(subjectIssueType, null, 2)}`);
    // console.log(` * projects: ${JSON.stringify(projects, null, 2)}`);
    // console.log(` * issueTypes: ${JSON.stringify(issueTypes, null, 2)}`);
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

  getIssueTypesFromIssues = (issues: Issue[]): Map<string, IssueType> => {
      // console.log(`BulkIssueTypeMapping: computing is all issue types are mapped based on selected issues = ${issues.map(issue => issue.key).join(', ')}`);
      const issueTypeIdsToIssueTypes = new Map<string, IssueType>();
      for (const issue of issues) {
        issueTypeIdsToIssueTypes.set(issue.fields.issuetype.id, issue.fields.issuetype);
      }
      return issueTypeIdsToIssueTypes;
    }
  
}

export default new JiraUtil();
