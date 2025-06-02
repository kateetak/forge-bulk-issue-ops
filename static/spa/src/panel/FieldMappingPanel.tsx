import React, { useEffect, useState } from 'react';
import Toggle from '@atlaskit/toggle';
import { CustomFieldOption } from "../types/CustomFieldOption";
import { IssueTypeFieldMappings, ProjectFieldMappings } from "../types/ProjectFieldMappings";
import { Issue } from "../types/Issue";
import { IssueType } from '../types/IssueType';
import { Field } from 'src/types/Field';
import jiraDataModel from 'src/model/jiraDataModel';
import FieldValuesSelect from 'src/widget/FieldValuesSelect';
import targetProjectFieldsModel from 'src/controller/TargetProjectFieldsModel';
import { FieldMetadata } from 'src/types/FieldMetadata';
import { Project } from 'src/types/Project';
import Textfield from '@atlaskit/textfield';
import { DefaultFieldValue } from 'src/types/DefaultFieldValue';
import { FieldMappingInfo } from 'src/types/FieldMappingInfo';
import { BulkOperationMode } from 'src/types/BulkOperationMode';
import bulkIssueTypeMappingModel from 'src/model/bulkIssueTypeMappingModel';
import { ObjectMapping } from 'src/types/ObjectMapping';
import { mapToObjectMap } from 'src/model/util';
import { formatIssueType } from 'src/controller/formatters';
import { renderPanelMessage } from 'src/widget/renderPanelMessage';

const showDebug = false;

export type FieldMappingsState = {
  dataRetrieved: boolean;
  project: undefined | Project;
  projectFieldMappings: ProjectFieldMappings;
}
export const nilFieldMappingsState: FieldMappingsState = {
  dataRetrieved: false,
  project: undefined,
  projectFieldMappings: {
    targetIssueTypeIdsToMappings: new Map<string, IssueTypeFieldMappings>()
  }
}

export type FieldMappingPanelProps = {
  bulkOperationMode: BulkOperationMode;
  allIssueTypes: IssueType[];
  issues: Issue[];
  fieldMappingsState: FieldMappingsState;
  showDebug?: boolean;
  onAllDefaultValuesProvided: (allDefaultsProvided: boolean) => void;
}

const FieldMappingPanel = (props: FieldMappingPanelProps) => {

  const determineTargetIssueTypeIdsToTargetIssueTypesBeingMapped = (
    issues: Issue[],
    allIssueTypes: IssueType[]
  ): Map<string, IssueType> => {
    const targetIssueTypeIdsToTargetIssueTypes = new Map<string, IssueType>();
    issues.forEach(issue => {
      const sourceProjectId = issue.fields.project.id;
      const sourceIssueTypeId = issue.fields.issuetype.id;
      const targetIssuetypeId = bulkIssueTypeMappingModel.getTargetIssueTypeId(sourceProjectId, sourceIssueTypeId);
      const targetIssueType = allIssueTypes.find(issueType => issueType.id === targetIssuetypeId);
      // console.log(` * FieldMappingPanel: ${sourceProjectId},${sourceIssueTypeId} maps to ${targetIssuetypeId}`);
      targetIssueTypeIdsToTargetIssueTypes.set(targetIssuetypeId, targetIssueType);
    });
    return targetIssueTypeIdsToTargetIssueTypes;
  }

  const [targetIssueTypeIdsToTargetIssueTypesBeingMapped, setTargetIssueTypeIdsToTargetIssueTypesBeingMapped] =
    useState<Map<string, IssueType>>(determineTargetIssueTypeIdsToTargetIssueTypesBeingMapped(props.issues, props.allIssueTypes));
  const [fieldIdsToFields, setFieldIdsToFields] = useState< Map<string, Field>>(new Map<string, Field>());
  const [allDefaultsProvided, setAllDefaultsProvided] = useState<boolean>(false);

  const loadFieldInfo = async (): Promise<void> => {
    const allFields = await jiraDataModel.getAllFields();
    const fieldIdsToFields = new Map<string, Field>();
    allFields.forEach(field => {
      fieldIdsToFields.set(field.id, field);
    });
    setFieldIdsToFields(fieldIdsToFields);
  }

  useEffect(() => {
    loadFieldInfo();
  }, []);

  const onSelectDefaultFieldValue = (targetIssueType: IssueType, fieldId: string, fieldMetadata: FieldMetadata, defaultValue: DefaultFieldValue): void => {
    targetProjectFieldsModel.onSelectDefaultValue(targetIssueType, fieldId, fieldMetadata, defaultValue);
    const allDefaultValuesProvided = targetProjectFieldsModel.areAllFieldValuesSet();
    setAllDefaultsProvided(allDefaultValuesProvided);
    props.onAllDefaultValuesProvided(allDefaultValuesProvided);
  }

  const onDeselectDefaultFieldValue = (targetIssueType: IssueType, fieldId: string, fieldMetadata: FieldMetadata): void => {
    targetProjectFieldsModel.onDeselectDefaultValue(targetIssueType, fieldId, fieldMetadata);
    const allDefaultValuesProvided = targetProjectFieldsModel.areAllFieldValuesSet();
    setAllDefaultsProvided(allDefaultValuesProvided);
    props.onAllDefaultValuesProvided(allDefaultValuesProvided);
  }

  const onRetainFieldValueSelection = (targetIssueType: IssueType, fieldId: string, fieldMetadata: FieldMetadata, retainFieldValue: boolean): void => {
    targetProjectFieldsModel.onSelectRetainFieldValue(targetIssueType, fieldId, fieldMetadata, retainFieldValue);
  }

  const renderFieldValuesSelect = (fieldId: string, targetIssueType: IssueType, fieldMetadata: FieldMetadata): JSX.Element => {
    const selectedDefaultFieldValue = targetProjectFieldsModel.getSelectedDefaultFieldValue(targetIssueType.id, fieldId);
    // console.log(`renderFieldValuesSelect: selectedDefaultFieldValue = ${JSON.stringify(selectedDefaultFieldValue)}`);
    const selectableCustomFieldOptions: CustomFieldOption[] = [];
    let selectedCustomFieldOption: CustomFieldOption | undefined = undefined;
    for (const allowedValue of fieldMetadata.allowedValues) {
      if (allowedValue.value) {
        const customFieldOption: CustomFieldOption = {
          id: allowedValue.id,
          name: allowedValue.value,
        };
        selectableCustomFieldOptions.push(customFieldOption);
        // console.log(`renderFieldValuesSelect: allowedValue = ${JSON.stringify(allowedValue)}`);
        if (selectedDefaultFieldValue && selectedDefaultFieldValue.value.length && allowedValue.value && allowedValue.id === selectedDefaultFieldValue.value[0]) {
          selectedCustomFieldOption = customFieldOption;
        }
      } else {
        // console.log(`renderFieldValuesSelect: Skipping allowed value without a value: ${JSON.stringify(allowedValue)}`);
      }
    }
    // const currentOption = targetProjectFieldsModel.getDefaultFieldValue(targetIssueType.id, fieldId);
    return (
      <FieldValuesSelect
        label={undefined}
        selectableCustomFieldOptions={selectableCustomFieldOptions}
        selectedCustomFieldOption={selectedCustomFieldOption}
        onSelect={async (selectedCustomFieldOption: CustomFieldOption): Promise<void> => {
          const defaultValue: DefaultFieldValue = {
            retain: false,
            type: "raw",
            value: [selectedCustomFieldOption.id]
          };
          onSelectDefaultFieldValue(targetIssueType, fieldId, fieldMetadata, defaultValue);
        }}
      />
    );
  }

  const renderNumberFieldEntryWidget = (fieldId: string, targetIssueType: IssueType, fieldMetadata: FieldMetadata): JSX.Element => {
    const selectedDefaultFieldValue = targetProjectFieldsModel.getSelectedDefaultFieldValue(targetIssueType.id, fieldId);
    // console.log(`renderNumberFieldEntryWidget: selectedDefaultFieldValue = ${JSON.stringify(selectedDefaultFieldValue)}`);
    return (
      <Textfield
        id={`number--for-${fieldId}`}
        name={fieldId}
        defaultValue={selectedDefaultFieldValue && selectedDefaultFieldValue.value.length > 0 ? selectedDefaultFieldValue.value[0] : ''}
        type="number"
        onChange={(event) => {
          let fieldValue: number | undefined = undefined;
          try {
            fieldValue = parseInt(event.currentTarget.value.trim());
          } catch (error) {
            console.error(`Error parsing number field value for field ID ${fieldId}:`, error);
          }
          if (fieldValue === undefined || isNaN(fieldValue)) {
            console.warn(`Invalid number field value for field ID ${fieldId}:`, event.currentTarget.value);
            onDeselectDefaultFieldValue(targetIssueType, fieldId, fieldMetadata);
            return;
          } else {
            console.log(`Setting default value for field ID ${fieldId} to ${fieldValue}`);
            const defaultValue: DefaultFieldValue = {
              retain: false,
              type: "raw",
              value: [fieldValue]
            };
            onSelectDefaultFieldValue(targetIssueType, fieldId, fieldMetadata, defaultValue);
          }
        }}
      />
    );
  }

  const renderFieldValuesEntryWidget = (fieldId: string, targetIssueType: IssueType, fieldMappingInfo: FieldMappingInfo): JSX.Element => {
    const fieldMetadata: FieldMetadata = fieldMappingInfo.fieldMetadata;
    if (fieldMetadata.schema.type === 'option' || fieldMetadata.schema.type === 'options') {
      if (fieldMetadata.allowedValues) {
        return renderFieldValuesSelect(fieldId, targetIssueType, fieldMetadata);
      } else {
        <div>
          <p><span style={{color:'#ff0000'}}>No options available for this field (type = {fieldMetadata.schema.type}).</span></p>
        </div>
      }
    } else if (fieldMetadata.schema.type === 'number') {
      return renderNumberFieldEntryWidget(fieldId, targetIssueType, fieldMetadata);
    } else {
      return (
        <div>
          <p><span style={{color:'#ff0000'}}>Unexpected field type: {fieldMetadata.schema.type}.</span></p>
        </div>
      );
    }
  }

  const renderRetainFieldValueWidget = (
    fieldId: string,
    targetIssueType: IssueType,
    fieldMappingInfo: FieldMappingInfo
  ): JSX.Element => {
    const fieldMetadata: FieldMetadata = fieldMappingInfo.fieldMetadata;
    const isChecked = targetProjectFieldsModel.getRetainFieldValue(targetIssueType.id, fieldId);
    return (
      <Toggle
        id={`toggle-filter-mode-advanced`}
        defaultChecked={isChecked}
        onChange={(event: any) => {
          onRetainFieldValueSelection(targetIssueType, fieldId, fieldMetadata, event.currentTarget.checked);
        }}
      />
    )
  }

  const renderFieldMappingsState = () => {
    let fieldCount = 0;
    const renderedTable = (
      <div>
        <table >
          <thead>
            <tr>
              <th className="no-break">Work item Type</th>
              <th className="no-break">Field</th>
              <th className="no-break">Options</th>
              <th className="no-break">Retain</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(props.fieldMappingsState.projectFieldMappings.targetIssueTypeIdsToMappings.entries()).map(([targetIssueTypeId, fieldOptionMappings]) => {
              const targetIssueType = targetIssueTypeIdsToTargetIssueTypesBeingMapped.get(targetIssueTypeId);
              if (targetIssueType) {
                return Array.from(fieldOptionMappings.fieldIdsToFieldMappingInfos.entries()).map(([fieldId, fieldMappingInfo]) => {
                  fieldCount++;
                  return (
                    <tr key={`mapping-${targetIssueTypeId}-${fieldId}`}>
                      <td>{formatIssueType(targetIssueType)}</td>
                      <td>{fieldIdsToFields.get(fieldId)?.name || fieldId}</td>
                      <td>
                        {renderFieldValuesEntryWidget(fieldId, targetIssueType, fieldMappingInfo)}
                      </td>
                      <td>
                        {renderRetainFieldValueWidget(fieldId, targetIssueType, fieldMappingInfo)}
                      </td>
                    </tr>
                  );
                });
              } else {
                return null;
              }
            })}
          </tbody>
        </table>
      </div>
    );
    if (fieldCount > 0) {
      return renderedTable;
    } else {
      return renderPanelMessage(`There are no fields that need default values to be set.`);      
    }
  }

  const renderDebug = () => {
    const targetIssueTypeIdsToFieldIdsToFieldSettings = targetProjectFieldsModel.getTargetIssueTypeIdsToFieldIdsToFieldSettings();
    const targetIssueTypeIdsToFieldIdsToFieldSettingsObject: any = mapToObjectMap(targetIssueTypeIdsToFieldIdsToFieldSettings);
    const targetIssueTypeIds = Object.keys(targetIssueTypeIdsToFieldIdsToFieldSettingsObject);
    for (const targetIssueTypeId of targetIssueTypeIds) {
      const fieldIdsToFieldSettings = targetIssueTypeIdsToFieldIdsToFieldSettings.get(targetIssueTypeId);
      if (fieldIdsToFieldSettings) {
        const fieldIdsToFieldSettingsObject: ObjectMapping<any> =
          mapToObjectMap<any>(fieldIdsToFieldSettings);
        targetIssueTypeIdsToFieldIdsToFieldSettingsObject[targetIssueTypeId] = fieldIdsToFieldSettingsObject;
      } else {
        console.warn(`No field settings found for target issue type ID: ${targetIssueTypeId}`);
      }
    }

    // const clonedFieldMappingsState = props.fieldMappingsState;
    const clonedFieldMappingsState = JSON.parse(JSON.stringify(props.fieldMappingsState));
    const targetIssueTypeIdsToMappings = props.fieldMappingsState.projectFieldMappings.targetIssueTypeIdsToMappings;
    // Replace the Map with and object so JSON.stringify includes it...
    if (targetIssueTypeIdsToMappings) {
      const targetIssueTypeIdsToMappingsObject: ObjectMapping<IssueTypeFieldMappings> =
        mapToObjectMap<IssueTypeFieldMappings>(targetIssueTypeIdsToMappings);
      const targetIssueTypeIds = Object.keys(targetIssueTypeIdsToMappingsObject);
      for (const targetIssueTypeId of targetIssueTypeIds) {
        const issueTypeFieldMappings: IssueTypeFieldMappings | undefined =
          targetIssueTypeIdsToMappings.get(targetIssueTypeId);
        if (issueTypeFieldMappings) {
          const fieldIdsToFieldMappingInfos: Map<string, FieldMappingInfo> = issueTypeFieldMappings.fieldIdsToFieldMappingInfos;
          const fieldIdsToFieldMappingInfosObject: ObjectMapping<FieldMappingInfo> = mapToObjectMap<FieldMappingInfo>(fieldIdsToFieldMappingInfos);
          targetIssueTypeIdsToMappings[targetIssueTypeId] = fieldIdsToFieldMappingInfosObject;
        }
      }
      // clonedFieldMappingsState.projectFieldMappings.targetIssueTypeIdsToMappings = targetIssueTypeIdsToMappingsObject;
    } else {
      clonedFieldMappingsState.projectFieldMappings.targetIssueTypeIdsToMappings = '????';
    }

    return (
      <div>
        <h3>Debug Information</h3>
        <p>All Defaults Provided: {allDefaultsProvided ? 'Yes' : 'No'}</p>
        <p>targetIssueTypeIdsToFieldIdsToFieldSettings:</p>
        <pre>{JSON.stringify(targetIssueTypeIdsToFieldIdsToFieldSettingsObject, null, 2)}</pre>
        {/* <p>fieldMappingsState:</p>
        <pre>{JSON.stringify(clonedFieldMappingsState, null, 2)}</pre> */}
      </div>
    );
  }

  return (
    <div style={{margin: '20px 0px'}}>
      {props.fieldMappingsState.dataRetrieved ? renderFieldMappingsState() : null}
      <div>
        {showDebug || props.showDebug ? renderDebug() : null}
      </div>
    </div>
  )

}
export default FieldMappingPanel;
