import { IssueBulkEditField } from "src/types/IssueBulkEditFieldApiResponse";
import { allowTheTargetProjectToMatchAnyIssueSourceProject } from "../model/config";
import { Issue } from "../types/Issue";
import { Project } from "../types/Project";
import { OperationOutcome } from "src/types/OperationOutcome";
import { ObjectMapping } from "src/types/ObjectMapping";
import { buildErrorOutcome, buildSuccessOutcome } from "../controller/OperationOutcomeBuilder";
import { FieldEditValue } from "src/types/FieldEditValue";

class BulkOperationRuleEnforcer {

  private excludedProjectKeys = new Set<string>()
    // Just examples, you can add more project keys to exclude.
    .add('FIXED')
    .add('DUMMY');

  /**
   * This function validates the value of a field against its validation rules.
   * @param field The field to validate.
   * @param value The proposed value of the field. This is the value to validate.
   * @param fieldIdsToFields An object that maps field IDs to their corresponding IssueBulkEditField objects.
   * @param otherEditedFieldIdsToValues An object that maps field IDs to their values that are being bulk
   * edited. This is useful when there is a need to validate a field against the values of other fields such as
   * when a field is required only if another field has a certain value or if a field value must relate to
   * another field value (e.g. start date < end date).
   * @returns An OperationOutcome indicating the result of the validation.
   */
  public validateFieldValue = async (
      field: IssueBulkEditField,
      value: FieldEditValue,
      fieldIdsToFields: ObjectMapping<IssueBulkEditField>,
      otherEditedFieldIdsToValues: ObjectMapping<FieldEditValue>
  ): Promise<OperationOutcome> => {
    
    // See exampleValidateEndDateFieldValue at the bottom of this class for an example of how to validate
    // a field in relation to other fields.

    // To return a failed validation, start with the following code;
    // return buildErrorOutcome(`Demo erroroneous field validation for field "${field.name}" with value ${value}`);

    return buildSuccessOutcome();
  }

  /**
   * This function is invoked when the user selects a source project to move issues from. The users starts
   * typing the name or key of the source project which results in a Jira API call to retrieve a set of matching
   * projects which is then passed to this function for filtering.
   * @param selectedSourceProjects 
   * @returns 
   */
  public filterSourceProjects = async (
    selectedSourceProjects: Project[],
  ): Promise<Project[]> => {
    const filteredProjects = selectedSourceProjects.filter((project: Project) => {
      return !this.excludedProjectKeys.has(project.key);
    });
    return filteredProjects;
  }

  /**
   * This function is invoked when the user selects a target project to moving issues to. The users starts
   * typing the name or key of the target project which results in a Jira API call to retrieve a set of matching
   * projects which is then passed to this function for filtering.
   * @param selectedIssuesToMove 
   * @param candidateProjects 
   * @returns 
   */
  public filterTargetProjects = async (
    selectedIssuesToMove: Issue[],
    candidateProjects: Project[]
  ): Promise<Project[]> => {
    const filteredProjects = allowTheTargetProjectToMatchAnyIssueSourceProject ?
      candidateProjects :
      this.filterIssuesToMoveProjectsFromTargetProjects(selectedIssuesToMove, candidateProjects);
    return filteredProjects;
  }

  /**
   * Filters the fields that are allowed to be edited in the bulk edit operation.
   * @param fields The fields to filter.
   * @returns the filtered fields that are allowed to be edited in the bulk edit operation.
   */
  public filterEditFields = async (fields: IssueBulkEditField[]): Promise<IssueBulkEditField[]> => {
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

  private exampleValidateEndDateFieldValue = async (
      field: IssueBulkEditField,
      value: FieldEditValue,
      fieldIdsToFields: ObjectMapping<IssueBulkEditField>,
      otherEditedFieldIdsToValues: ObjectMapping<FieldEditValue>
  ): Promise<OperationOutcome> => {
    if (field.name === 'Actual end') {
      const actualStart = this.findFieldValueByName('Actual start', fieldIdsToFields, otherEditedFieldIdsToValues);
      if (actualStart) {
        const actualEndDate = new Date(value.value);
        const actualStartDate = new Date(actualStart.value);
        if (actualEndDate < actualStartDate) {
          return buildErrorOutcome(`The field "${field.name} (${actualEndDate.toLocaleDateString()})" must be after the value of the field "Actual start (${actualStartDate.toLocaleDateString()})".`);
        } else {
          return buildSuccessOutcome();
        }
      } else {
        return buildErrorOutcome(`The field "Actual start" is required when the field "${field.name}" is set.`);
      }
    }
  }

  private findFieldValueByName = (name: string, fieldIdsToFields: ObjectMapping<any>, fieldIdsToValues: ObjectMapping<any>): any | undefined => {
    const fieldIds = Object.keys(fieldIdsToFields);
    for (const fieldId of fieldIds) {
      const field: IssueBulkEditField = fieldIdsToFields[fieldId];
      if (field.name === name) {
        return fieldIdsToValues[fieldId];
      }
    }
    return undefined;
  }

}

export default new BulkOperationRuleEnforcer();
