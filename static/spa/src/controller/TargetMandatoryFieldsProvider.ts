import { Issue } from "../types/Issue";
import { IssueType } from "../types/IssueType";
import { ProjectFieldMappings } from "../types/ProjectFieldMappings";
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

  private projectFieldMappings: undefined | ProjectFieldMappings = undefined;
  /* private */ targetIssueTypeIdsToFieldIdsToFieldSettings = new Map<string, Map<string, FieldSettings>>();
  private selectedTargetIssueTypeIdsToTypes = new Map<string, IssueType>();
  private selectedIssueTypes: IssueType[] = [];

  setSelectedIssues = (issues: Issue[], allIssueTypes: IssueType[]): void => {
    // console.log(`TargetMandatoryFieldsProvider.setSelectedIssues: Setting selected issue types from selected issues (allIssueTypes.length = ${allIssueTypes.length})...`);
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

    const newlySelectedIssueTypes = Array.from(this.selectedTargetIssueTypeIdsToTypes.values());

    // if (newlySelectedIssueTypes.length === 0 && this.selectedIssueTypes.length > 0) {
    //   throw new Error("Bad request: no issue types selected. Please select at least one issue type.");
    // }

    this.selectedIssueTypes = newlySelectedIssueTypes;
    // console.log(`TargetMandatoryFieldsProvider.setSelectedIssues: selectedIssueTypes: ${this.selectedIssueTypes.map(issue => `${issue.name} (${issue.id})`).join(', ')}`);
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
    // console.log(`TargetMandatoryFieldsProvider.areAllFieldValuesSet: checking if all field values are set...`);
    if (!this.projectFieldMappings) {
      // console.log(`TargetMandatoryFieldsProvider.areAllFieldValuesSet: projectFieldMappings is not set.`);
      return false;
    }
    if (this.selectedIssueTypes.length === 0) {
      // console.log(`TargetMandatoryFieldsProvider.areAllFieldValuesSet: no issue types are selected.`);
      return false; // If no issue types are selected, return false
    }
    for (const selectedIssueType of this.selectedIssueTypes) {
      const issueTypeFieldMappings = this.projectFieldMappings.targetIssueTypeIdsToMappings.get(selectedIssueType.id);
      if (issueTypeFieldMappings) {
        const fieldIds = Array.from(issueTypeFieldMappings.fieldIdsToFieldMappingInfos.keys());
        for (const fieldId of fieldIds) {
          const defaultValue = this.getSelectedDefaultFieldValue(selectedIssueType.id, fieldId);
          if (!defaultValue) {
            // console.log(`TargetMandatoryFieldsProvider.areAllFieldValuesSet: no default value found for issue type ${selectedIssueType.id} and field ${fieldId}.`);
            return false;
          }
        }
      } else {
        // console.log(`TargetMandatoryFieldsProvider.areAllFieldValuesSet: no field mappings found for issue type ${selectedIssueType.id}. Maybe the issue type is not yest mapped in the previous step.`);
        return false;
      }
    }
    // console.log(`TargetMandatoryFieldsProvider.areAllFieldValuesSet: all field values are set.`);
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

  onDeselectDefaultValue = (targetIssueType: IssueType, fieldId: string, fieldMetadata: FieldMetadata): void => {
    let fieldIdsToDefaultFieldSettings = this.targetIssueTypeIdsToFieldIdsToFieldSettings.get(targetIssueType.id);
    if (fieldIdsToDefaultFieldSettings) {
      fieldIdsToDefaultFieldSettings.delete(fieldId);
    }

    if (!fieldIdsToDefaultFieldSettings) {
      fieldIdsToDefaultFieldSettings = new Map<string, FieldSettings>();
      this.targetIssueTypeIdsToFieldIdsToFieldSettings.set(targetIssueType.id, fieldIdsToDefaultFieldSettings);
    }
    let fieldSettings = fieldIdsToDefaultFieldSettings.get(fieldId);
    if (fieldSettings) {
      fieldSettings.defaultFieldValue = undefined;
      fieldIdsToDefaultFieldSettings.delete(fieldId);
    }
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
    const targetIssueTypeIdsToTargetMandatoryFields = new Map<string, TargetMandatoryFields>();
    this.projectFieldMappings.targetIssueTypeIdsToMappings.forEach((targetIssueTypeFieldMappings, targetIssueTypeId) => {
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
