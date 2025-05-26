import { Issue } from "../types/Issue";
import { CustomFieldOption } from "../types/CustomFieldOption";
import { IssueType } from "../types/IssueType";
import { IssueTypeFieldMappings, ProjectFieldMappings } from "../types/ProjectFieldMappings";
import { TargetMandatoryFields, FieldValue } from "../types/TargetMandatoryField";
import { FieldMetadata } from "src/types/FieldMetadata";
import { DefaultFieldValue } from "src/types/DefaultFieldValue";

export class TargetMandatoryFieldsProvider {

  private projectFieldMappings: undefined | ProjectFieldMappings;
  private issueTypeIdsToFieldIdsToDefaultFieldOptions = new Map<string, Map<string, DefaultFieldValue>>();
  private selectedIssueTypeIdsToTypes = new Map<string, IssueType>();
  private selectedIssueTypes: IssueType[] = [];

  setSelectedIssues = (issues: Issue[]): void => {
   this.selectedIssueTypeIdsToTypes.clear();
    issues.forEach(issue => {
      const issueType = issue.fields.issuetype;
      if (issueType) {
        this.selectedIssueTypeIdsToTypes.set(issueType.id, issueType);
      }
    });
    this.selectedIssueTypes = Array.from(this.selectedIssueTypeIdsToTypes.values());
  }

  setProjectFieldMappings = (projectFieldMappings: ProjectFieldMappings): void => {
    this.projectFieldMappings = projectFieldMappings;
  }

  getSelectedDefaultFieldValue = (issueTypeId: string, fieldId: string): DefaultFieldValue | undefined => {
    const fieldIdsToDefaultFieldValues = this.issueTypeIdsToFieldIdsToDefaultFieldOptions.get(issueTypeId);
    return fieldIdsToDefaultFieldValues?.get(fieldId);
  }

  isIssueTypeSelected = (issueTypeId: string): boolean => {
    return this.selectedIssueTypeIdsToTypes.has(issueTypeId);
  }

  areAllFieldValuesSet = (): boolean => {
    if (!this.projectFieldMappings) {
      return false; // If projectFieldMappings is not set, return false
    }
    
    for (const selectedIssueType of this.selectedIssueTypes) {
      const issueTypeFieldMappings = this.projectFieldMappings.issueTypesToMappings.get(selectedIssueType.id);
      if (issueTypeFieldMappings) {
        const fieldIds = Array.from(issueTypeFieldMappings.fieldIdsToFieldMetadata.keys());
        for (const fieldId of fieldIds) {
          const defaultValue = this.getSelectedDefaultFieldValue(selectedIssueType.id, fieldId);
          if (!defaultValue) {
            return false; // If any selected issue type does not have a default option, return false
          }
        }
      } else {
        return false;
      }
    }

    return true;
  }

  onSelectDefaultValue = (issueType: IssueType, fieldId: string, fieldMetadata: FieldMetadata, defaultValue: DefaultFieldValue): void => {
    let fieldIdsToDefaultFieldValues = this.issueTypeIdsToFieldIdsToDefaultFieldOptions.get(issueType.id);
    if (!fieldIdsToDefaultFieldValues) {
      fieldIdsToDefaultFieldValues = new Map<string, DefaultFieldValue>();
      this.issueTypeIdsToFieldIdsToDefaultFieldOptions.set(issueType.id, fieldIdsToDefaultFieldValues);
    }
    fieldIdsToDefaultFieldValues.set(fieldId, defaultValue);
  }

  buildIssueTypeIdsToTargetMandatoryFields = (): Map<string, TargetMandatoryFields> => {
    if (!this.areAllFieldValuesSet()) {
      throw new Error("Bad request: not all default field options have been provided.");
    }
    if (!this.projectFieldMappings) {
      throw new Error("Bad request: projectFieldMappings has not been set.");
    }
    const issueTypeIdsToTargetMandatoryFields = new Map<string, TargetMandatoryFields>();
    this.projectFieldMappings.issueTypesToMappings.forEach((issueTypeFieldMappings, issueTypeId) => {
      const fields: { [key: string]: FieldValue } = {};
      issueTypeFieldMappings.fieldIdsToFieldMetadata.forEach((fieldMetadata, fieldId) => {
        const defaultValue = this.getSelectedDefaultFieldValue(issueTypeId, fieldId);
        if (defaultValue) {
          fields[fieldId] = defaultValue;
        }
      });
      issueTypeIdsToTargetMandatoryFields.set(issueTypeId, { fields });
    });
    return issueTypeIdsToTargetMandatoryFields;
  }

}
