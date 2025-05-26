import { allowTheTargetProjectToMatchAnyIssueSourceProject } from "src/model/config";
import { Issue } from "../types/Issue";
import { Project } from "../types/Project";

class MoveRuleEnforcer {

  /**
   * This function will be invoked when the user selects a target project to moving issues to. The users starts
   * typing the name or key of the target project which results in a Jira API call to retrieve a set of matching
   * projects which is then passed to this function for filtering.
   * @param selectedIssuesToMove 
   * @param candidateProjects 
   * @returns 
   */
  filterTargetProjects = async (
    selectedIssuesToMove: Issue[],
    candidateProjects: Project[]
  ): Promise<Project[]> => {
    const filteredProjects = allowTheTargetProjectToMatchAnyIssueSourceProject ?
      candidateProjects :
      this.filterIssuesToMoveProjectsFromTargetProjects(selectedIssuesToMove, candidateProjects);
    return filteredProjects;
  }

  private filterIssuesToMoveProjectsFromTargetProjects = (
    issuesToMove: Issue[],
    candidateProjects: Project[]
  ): Project[] => {
    const filteredProjectKeysToProjects = new Map<string, Project>();
    for (const candidateProject of candidateProjects) {
      filteredProjectKeysToProjects.set(candidateProject.key, candidateProject);
    }
    for (const issueToMove of issuesToMove) {


      const candidateProject: Project = candidateProjects.find((project: Project) => {
        return issueToMove.key.startsWith(`${project.key}-`);
      });
      if (candidateProject) {
        // The issue to move is in the set of candidate projects, so don't add it to the filtered projects.
        filteredProjectKeysToProjects.delete(issueToMove.key.split('-')[0]);
      }
    }
    const filteredProjects: Project[] = Array.from(filteredProjectKeysToProjects.values());
    return filteredProjects;
  }

}

export default new MoveRuleEnforcer();
