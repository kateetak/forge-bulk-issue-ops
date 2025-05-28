import { Issue } from "../types/Issue";
import { CustomFieldOption } from "../types/CustomFieldOption";
import { IssueType } from "../types/IssueType";
import { IssueTypeFieldMappings, ProjectFieldMappings } from "../types/ProjectFieldMappings";
import { TargetMandatoryFields, FieldValue } from "../types/TargetMandatoryField";
import { FieldMetadata } from "src/types/FieldMetadata";
import { DefaultFieldValue } from "src/types/DefaultFieldValue";

type FieldSettings = {
  defaultFieldValue?: DefaultFieldValue;
  retainFieldValue: boolean;
}

const defaultRetainValueSetting = true;

export class TargetMandatoryFieldsProvider {

  private projectFieldMappings: undefined | ProjectFieldMappings;
  private issueTypeIdsToFieldIdsToFieldSettings = new Map<string, Map<string, FieldSettings>>();
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

  getFieldSettings = (issueTypeId: string, fieldId: string): FieldSettings | undefined => {
    const fieldIdsToDefaultFieldSettings = this.issueTypeIdsToFieldIdsToFieldSettings.get(issueTypeId);
    return fieldIdsToDefaultFieldSettings?.get(fieldId);
  }

  getSelectedDefaultFieldValue = (issueTypeId: string, fieldId: string): DefaultFieldValue | undefined => {
    const fieldSettings = this.getFieldSettings(issueTypeId, fieldId);
    return fieldSettings?.defaultFieldValue;
  }

  getRetainFieldValue = (issueTypeId: string, fieldId: string): boolean => {
    const fieldSettings = this.getFieldSettings(issueTypeId, fieldId);
    return fieldSettings ? fieldSettings.retainFieldValue : defaultRetainValueSetting;
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
        const fieldIds = Array.from(issueTypeFieldMappings.fieldIdsToFieldMappingInfos.keys());
        for (const fieldId of fieldIds) {
          const defaultValue = this.getSelectedDefaultFieldValue(selectedIssueType.id, fieldId);
          if (!defaultValue) {
            return false; // If any selected issue type does not have a default option, return false
          }
        }
      } else {
        // ???
        // return false;
      }
    }

    return true;
  }

  onSelectDefaultValue = (issueType: IssueType, fieldId: string, fieldMetadata: FieldMetadata, defaultValue: DefaultFieldValue): void => {
    let fieldIdsToDefaultFieldSettings = this.issueTypeIdsToFieldIdsToFieldSettings.get(issueType.id);
    if (!fieldIdsToDefaultFieldSettings) {
      fieldIdsToDefaultFieldSettings = new Map<string, FieldSettings>();
      this.issueTypeIdsToFieldIdsToFieldSettings.set(issueType.id, fieldIdsToDefaultFieldSettings);
    }
    let fieldSettings = fieldIdsToDefaultFieldSettings.get(fieldId);
    if (!fieldSettings) {
      fieldSettings = {
        retainFieldValue: defaultRetainValueSetting,
      };
      fieldIdsToDefaultFieldSettings.set(fieldId, fieldSettings);
    }
    fieldSettings.defaultFieldValue = defaultValue;
  }

  onSelectRetainFieldValue = (issueType: IssueType, fieldId: string, fieldMetadata: FieldMetadata, retainFieldValue: boolean): void => {
    let fieldIdsToDefaultFieldSettings = this.issueTypeIdsToFieldIdsToFieldSettings.get(issueType.id);
    if (!fieldIdsToDefaultFieldSettings) {
      fieldIdsToDefaultFieldSettings = new Map<string, FieldSettings>();
      this.issueTypeIdsToFieldIdsToFieldSettings.set(issueType.id, fieldIdsToDefaultFieldSettings);
    }
    let fieldSettings = fieldIdsToDefaultFieldSettings.get(fieldId);
    if (!fieldSettings) {
      fieldSettings = {
        retainFieldValue: defaultRetainValueSetting,
      };
      fieldIdsToDefaultFieldSettings.set(fieldId, fieldSettings);
    }
    fieldSettings.retainFieldValue = retainFieldValue;
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
      issueTypeFieldMappings.fieldIdsToFieldMappingInfos.forEach((fieldMappingInfo, fieldId) => {
        const retainValue = this.getRetainFieldValue(issueTypeId, fieldId);
        const defaultValue = this.getSelectedDefaultFieldValue(issueTypeId, fieldId);
        if (defaultValue) {
          // Clone to avoid tampering within the original option...
          const clonedDefaultValue: FieldValue = Object.assign({}, defaultValue);
          clonedDefaultValue.retain = retainValue;
          fields[fieldId] = clonedDefaultValue;
        }
      });
      issueTypeIdsToTargetMandatoryFields.set(issueTypeId, { fields });
    });
    return issueTypeIdsToTargetMandatoryFields;
  }

}
