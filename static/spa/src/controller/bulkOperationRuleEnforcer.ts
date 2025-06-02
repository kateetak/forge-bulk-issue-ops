import { IssueBulkEditField } from "src/types/IssueBulkEditFieldApiResponse";
import { allowTheTargetProjectToMatchAnyIssueSourceProject } from "../model/config";
import { Issue } from "../types/Issue";
import { Project } from "../types/Project";
import { OperationOutcome } from "src/types/OperationOutcome";

class BulkOperationRuleEnforcer {

  private excludedProjectKeys = new Set<string>()
    // Just examples, you can add more project keys to exclude.
    .add('FIXED')
    .add('DUMMY');

  /**
   * This function validates the value of a field against its validation rules.
   * @param field The field to validate.
   * @param value The value to validate.
   * @returns An OperationOutcome indicating the result of the validation.
   */
  validateFieldValue = async (field: IssueBulkEditField, value: any): Promise<OperationOutcome> => {
    const operationOutcome: OperationOutcome = {
      success: true,
      errorMessage: undefined,
    }
    // const operationOutcome: OperationOutcome = {
    //   success: false,
    //   errorMessage: `Demo erroroneous field validation for field "${field.name}" with value ${value}`,
    // }
    return operationOutcome;
  }

  /**
   * This function is invoked when the user selects a source project to move issues from. The users starts
   * typing the name or key of the source project which results in a Jira API call to retrieve a set of matching
   * projects which is then passed to this function for filtering.
   * @param selectedSourceProjects 
   * @returns 
   */
  filterSourceProjects = async (
    selectedSourceProjects: Project[],
  ): Promise<Project[]> => {
    const filteredProjects = selectedSourceProjects.filter((project: Project) => {
      return !this.excludedProjectKeys.has(project.key);
    });
    return filteredProjects;
  }

  filterIssueTypeMapping = async () => {
  }

  /**
   * This function is invoked when the user selects a target project to moving issues to. The users starts
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

  filterEditFields = async (fields: IssueBulkEditField[]): Promise<IssueBulkEditField[]> => {
    const filteredFields = fields.filter(field => {
      if (field.id === 'reporter') {
        // It is assummed that the reporter field is not editable.
        return false;
      }
      return true;
    });
    return filteredFields;
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

export default new BulkOperationRuleEnforcer();
