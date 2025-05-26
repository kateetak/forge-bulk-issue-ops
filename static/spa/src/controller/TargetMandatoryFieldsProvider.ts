import { Issue } from "../types/Issue";
import { CustomFieldOption } from "../types/CustomFieldOption";
import { IssueType } from "../types/IssueType";
import { IssueTypeFieldOptionMappings, ProjectFieldOptionMappings } from "../types/ProjectFieldOptionMappings";
import { TargetMandatoryFields, FieldValue } from "../types/TargetMandatoryField";

export class TargetMandatoryFieldsProvider {

  private projectFieldOptionMappings: undefined | ProjectFieldOptionMappings;
  private issueTypeIdsToFieldIdsToDefaultFieldOptions = new Map<string, Map<string, CustomFieldOption>>();
  private selectedIssueTypeIdsToTypes = new Map<string, IssueType>();
  private selectedIssueTypes: IssueType[] = [];

  // setSelectedIssueTypes = (issueTypes: IssueType[]): void => {
  //   this.selectedIssueTypeIdsToTypes.clear();
  //   issueTypes.forEach(issueType => {
  //     this.selectedIssueTypeIdsToTypes.set(issueType.id, issueType);
  //   });
  // }

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

  setProjectFieldOptionMappings = (projectFieldOptionMappings: ProjectFieldOptionMappings): void => {
    this.projectFieldOptionMappings = projectFieldOptionMappings;
  }

  getSelectedDefaultFieldOption = (issueTypeId: string, fieldId: string): CustomFieldOption | undefined => {
    const fieldIdsToDefaultFieldOptions = this.issueTypeIdsToFieldIdsToDefaultFieldOptions.get(issueTypeId);
    return fieldIdsToDefaultFieldOptions?.get(fieldId);
  }

  isIssueTypeSelected = (issueTypeId: string): boolean => {
    return this.selectedIssueTypeIdsToTypes.has(issueTypeId);
  }

  areAllFieldValuesSet = (): boolean => {
    if (!this.projectFieldOptionMappings) {
      return false; // If projectFieldOptionMappings is not set, return false
    }
    
    // const issueTypeIds = Array.from(this.projectFieldOptionMappings.issueTypesToMappings.keys());
    // for (const issueTypeId of issueTypeIds) {
    //   if (this.isIssueTypeSelected(issueTypeId)) {
    //     const fieldIdsToDefaultFieldOptions = this.issueTypeIdsToFieldIdsToDefaultFieldOptions.get(issueTypeId);
    //     // if (!fieldIdsToDefaultFieldOptions) {
    //     //   return false; // If any issue type does not have default field options, return false
    //     // }

    //     if (fieldIdsToDefaultFieldOptions) {
    //       const issueTypeFieldOptionMappings: IssueTypeFieldOptionMappings = this.projectFieldOptionMappings.issueTypesToMappings.get(issueTypeId);
    //       const fieldIds = Array.from(issueTypeFieldOptionMappings.fieldIdsToOptions.keys());
    //       for (const fieldId of fieldIds) {
    //         const defaultOption = this.getSelectedDefaultFieldOption(issueTypeId, fieldId);
    //         if (!defaultOption) {
    //           return false; // If any field ID does not have a default option, return false
    //         }
    //       }
    //     } else {
    //       // Whilst the issue type may be selected, there are no mandatory fields matching it so continue on.
    //     }
    //   }
    // }

    for (const selectedIssueType of this.selectedIssueTypes) {
      const issueTypeFieldOptionMappings = this.projectFieldOptionMappings.issueTypesToMappings.get(selectedIssueType.id);
      if (issueTypeFieldOptionMappings) {
        const fieldIds = Array.from(issueTypeFieldOptionMappings.fieldIdsToOptions.keys());
        for (const fieldId of fieldIds) {
          const defaultOption = this.getSelectedDefaultFieldOption(selectedIssueType.id, fieldId);
          if (!defaultOption) {
            return false; // If any selected issue type does not have a default option, return false
          }
        }
      } else {
        return false;
      }
    }

    return true;
  }

  onSelectDefaultValue = (issueType: IssueType, fieldId: string, fieldOption: CustomFieldOption): void => {
    let fieldIdsToDefaultFieldOptions = this.issueTypeIdsToFieldIdsToDefaultFieldOptions.get(issueType.id);
    if (!fieldIdsToDefaultFieldOptions) {
      fieldIdsToDefaultFieldOptions = new Map<string, CustomFieldOption>();
      this.issueTypeIdsToFieldIdsToDefaultFieldOptions.set(issueType.id, fieldIdsToDefaultFieldOptions);
    }
    fieldIdsToDefaultFieldOptions.set(fieldId, fieldOption);
  }

  buildIssueTypeIdsToTargetMandatoryFields = (): Map<string, TargetMandatoryFields> => {
    if (!this.areAllFieldValuesSet()) {
      throw new Error("Bad request: not all default field options have been provided.");
    }
    if (!this.projectFieldOptionMappings) {
      throw new Error("Bad request: projectFieldOptionMappings has not been set.");
    }

    const issueTypeIdsToTargetMandatoryFields = new Map<string, TargetMandatoryFields>();
    this.projectFieldOptionMappings.issueTypesToMappings.forEach((issueTypeFieldOptionMappings, issueTypeId) => {
      const fields: { [key: string]: FieldValue } = {};
      issueTypeFieldOptionMappings.fieldIdsToOptions.forEach((options, fieldId) => {
        const defaultOption = this.getSelectedDefaultFieldOption(issueTypeId, fieldId);
        if (defaultOption) {
          fields[fieldId] = {
            retain: false,
            type: "raw",
            value: [defaultOption.id] // Assuming we want to set the ID of the default option
          };
        }
      });
      issueTypeIdsToTargetMandatoryFields.set(issueTypeId, { fields });
    });
    return issueTypeIdsToTargetMandatoryFields;
  }

}
