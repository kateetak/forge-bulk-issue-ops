import { Issue } from "../types/Issue";
import { CustomFieldOption } from "../types/CustomFieldOption";
import { IssueType } from "../types/IssueType";
import { IssueTypeFieldMappings, ProjectFieldMappings } from "../types/ProjectFieldMappings";
import { TargetMandatoryFields, FieldValue } from "../types/TargetMandatoryField";
import { FieldMetadata } from "src/types/FieldMetadata";
import { DefaultFieldValue } from "src/types/DefaultFieldValue";
import bulkIssueTypeMapping from "src/model/bulkIssueTypeMapping";

type FieldSettings = {
  defaultFieldValue?: DefaultFieldValue;
  retainFieldValue: boolean;
}

const defaultRetainValueSetting = true;

export class TargetMandatoryFieldsProvider {

  private projectFieldMappings: undefined | ProjectFieldMappings;
  private targetIssueTypeIdsToFieldIdsToFieldSettings = new Map<string, Map<string, FieldSettings>>();
  private selectedTargetIssueTypeIdsToTypes = new Map<string, IssueType>();
  private selectedIssueTypes: IssueType[] = [];

  setSelectedIssues = (issues: Issue[], allIssueTypes: IssueType[]): void => {
    this.selectedTargetIssueTypeIdsToTypes.clear();
    issues.forEach(issue => {
      const sourceProjectId = issue.fields.project.id;
      const sourceIssueTypeId = issue.fields.issuetype.id;
      const targetIssueTypeId = bulkIssueTypeMapping.getTargetIssueTypeId(sourceProjectId, sourceIssueTypeId);
      // this.selectedTargetIssueTypeIdsToTypes.set(targetIssueTypeId, issue.fields.issuetype);
      const targetIssueType = allIssueTypes.find(issueType => issueType.id === targetIssueTypeId);
      if (targetIssueType) {
        this.selectedTargetIssueTypeIdsToTypes.set(targetIssueTypeId, targetIssueType);
      } else {
        console.warn(`TargetMandatoryFieldsProvider.setSelectedIssues: No target issue type found for source project ${sourceProjectId} and source issue type ${sourceIssueTypeId}`);
      }
    });
    this.selectedIssueTypes = Array.from(this.selectedTargetIssueTypeIdsToTypes.values());
    console.log(`TargetMandatoryFieldsProvider.setSelectedIssues: selectedIssueTypes: ${JSON.stringify(this.selectedIssueTypes, null, 2)}`);
  }

  setProjectFieldMappings = (projectFieldMappings: ProjectFieldMappings): void => {
    this.projectFieldMappings = projectFieldMappings;
  }

  getFieldSettings = (targetIssueTypeId: string, fieldId: string): FieldSettings | undefined => {
    const fieldIdsToDefaultFieldSettings = this.targetIssueTypeIdsToFieldIdsToFieldSettings.get(targetIssueTypeId);
    return fieldIdsToDefaultFieldSettings?.get(fieldId);
  }

  getSelectedDefaultFieldValue = (targetIssueTypeId: string, fieldId: string): DefaultFieldValue | undefined => {
    const fieldSettings = this.getFieldSettings(targetIssueTypeId, fieldId);
    return fieldSettings?.defaultFieldValue;
  }

  getRetainFieldValue = (targetIssueTypeId: string, fieldId: string): boolean => {
    const fieldSettings = this.getFieldSettings(targetIssueTypeId, fieldId);
    return fieldSettings ? fieldSettings.retainFieldValue : defaultRetainValueSetting;
  }

  isIssueTypeSelected = (targetIssueTypeId: string): boolean => {
    return this.selectedTargetIssueTypeIdsToTypes.has(targetIssueTypeId);
  }

  areAllFieldValuesSet = (): boolean => {
    if (!this.projectFieldMappings) {
      return false; // If projectFieldMappings is not set, return false
    }
    
    for (const selectedIssueType of this.selectedIssueTypes) {
      const issueTypeFieldMappings = this.projectFieldMappings.targetIssueTypesToMappings.get(selectedIssueType.id);
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

  onSelectDefaultValue = (targetIssueType: IssueType, fieldId: string, fieldMetadata: FieldMetadata, defaultValue: DefaultFieldValue): void => {
    let fieldIdsToDefaultFieldSettings = this.targetIssueTypeIdsToFieldIdsToFieldSettings.get(targetIssueType.id);
    if (!fieldIdsToDefaultFieldSettings) {
      fieldIdsToDefaultFieldSettings = new Map<string, FieldSettings>();
      this.targetIssueTypeIdsToFieldIdsToFieldSettings.set(targetIssueType.id, fieldIdsToDefaultFieldSettings);
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

  onSelectRetainFieldValue = (targetIssueType: IssueType, fieldId: string, fieldMetadata: FieldMetadata, retainFieldValue: boolean): void => {
    let fieldIdsToDefaultFieldSettings = this.targetIssueTypeIdsToFieldIdsToFieldSettings.get(targetIssueType.id);
    if (!fieldIdsToDefaultFieldSettings) {
      fieldIdsToDefaultFieldSettings = new Map<string, FieldSettings>();
      this.targetIssueTypeIdsToFieldIdsToFieldSettings.set(targetIssueType.id, fieldIdsToDefaultFieldSettings);
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
    // const issueTypeIdsToTargetMandatoryFields = new Map<string, TargetMandatoryFields>();
    // this.projectFieldMappings.issueTypesToMappings.forEach((issueTypeFieldMappings, issueTypeId) => {
    //   const fields: { [key: string]: FieldValue } = {};
    //   issueTypeFieldMappings.fieldIdsToFieldMappingInfos.forEach((fieldMappingInfo, fieldId) => {
    //     const retainValue = this.getRetainFieldValue(issueTypeId, fieldId);
    //     const defaultValue = this.getSelectedDefaultFieldValue(issueTypeId, fieldId);
    //     if (defaultValue) {
    //       // Clone to avoid tampering within the original option...
    //       const clonedDefaultValue: FieldValue = Object.assign({}, defaultValue);
    //       clonedDefaultValue.retain = retainValue;
    //       fields[fieldId] = clonedDefaultValue;
    //     }
    //   });
    //   issueTypeIdsToTargetMandatoryFields.set(issueTypeId, { fields });
    // });
    const targetIssueTypeIdsToTargetMandatoryFields = new Map<string, TargetMandatoryFields>();
    this.projectFieldMappings.targetIssueTypesToMappings.forEach((targetIssueTypeFieldMappings, targetIssueTypeId) => {
      const fields: { [key: string]: FieldValue } = {};
      targetIssueTypeFieldMappings.fieldIdsToFieldMappingInfos.forEach((fieldMappingInfo, fieldId) => {
        const retainValue = this.getRetainFieldValue(targetIssueTypeId, fieldId);
        const defaultValue = this.getSelectedDefaultFieldValue(targetIssueTypeId, fieldId);
        if (defaultValue) {
          // Clone to avoid tampering within the original option...
          const clonedDefaultValue: FieldValue = Object.assign({}, defaultValue);
          clonedDefaultValue.retain = retainValue;
          fields[fieldId] = clonedDefaultValue;
        }
      });
      targetIssueTypeIdsToTargetMandatoryFields.set(targetIssueTypeId, { fields });
    });
    return targetIssueTypeIdsToTargetMandatoryFields;
  }

}
