import issueTypesCache from "src/model/issueTypesCache";
import { IssueType } from "src/types/IssueType";
import { Project } from "src/types/Project";

class JiraUtil {

  filterProjectIssueTypes = async (project: Project, allIssueTypes: IssueType[]): Promise<IssueType[]> => {
    console.log(`filterProjectIssueTypes:`);
    console.log(` * project.id: ${project.id}`);
    console.log(` * project.name: ${project.name}`);
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
    console.log(` * returning: ${JSON.stringify(filteredIssueTypes, null, 2)}`);
    return filteredIssueTypes;
  }
  
  determineProjectsWithIssueTypes = async (invoke: any, projects: Project[], issueTypes: IssueType[]): Promise<Project[]> => {
    const filteredProjects: Project[] = [];
    for (const project of projects) {
      const isTeamManagedProject = project.simplified;
      if (isTeamManagedProject) {
        const issueTypesForProject: IssueType[] = await issueTypesCache.getissueTypes(invoke);
        if (issueTypesForProject.length > 0) {
          filteredProjects.push(project);
        }
      }
    }  

    for (const issueType of issueTypes) {
      for (const project of projects) {
      
      }  
    }
    return filteredProjects;
    // const issueTypes: IssueType[] = await issueTypesCache.getissueTypes(props.invoke, projectId);
  }

}

export default new JiraUtil();
