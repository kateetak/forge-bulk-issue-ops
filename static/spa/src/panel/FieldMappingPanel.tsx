import React, { useEffect, useState } from 'react';
import Toggle from '@atlaskit/toggle';
import { CustomFieldOption } from "../types/CustomFieldOption";
import { IssueTypeFieldMappings, ProjectFieldMappings } from "../types/ProjectFieldMappings";
import { Issue } from "../types/Issue";
import { IssueType } from '../types/IssueType';
import { Field } from 'src/types/Field';
import jiraDataModel from 'src/model/jiraDataModel';
import FieldValuesSelect from 'src/widget/FieldValuesSelect';
import { TargetMandatoryFieldsProvider } from 'src/controller/TargetMandatoryFieldsProvider';
import SuccessIcon from '@atlaskit/icon/core/success';
import { FieldMetadata } from 'src/types/FieldMetadata';
import { Project } from 'src/types/Project';
import Textfield from '@atlaskit/textfield';
import { DefaultFieldValue } from 'src/types/DefaultFieldValue';
import { FieldMappingInfo } from 'src/types/FieldMappingInfo';
import { BulkOpsMode } from 'src/types/BulkOpsMode';
import bulkIssueTypeMapping from 'src/model/bulkIssueTypeMapping';

const showDebug = true;

export type FieldMappingsState = {
  dataRetrieved: boolean;
  project: undefined | Project;
  projectFieldMappings: ProjectFieldMappings;
}
export const nilFieldMappingsState: FieldMappingsState = {
  dataRetrieved: false,
  project: undefined,
  projectFieldMappings: {
    targetIssueTypesToMappings: new Map<string, IssueTypeFieldMappings>()
  }
}

export type FieldMappingPanelProps = {
  bulkOpsMode: BulkOpsMode;
  issues: Issue[];
  fieldMappingsState: FieldMappingsState;
  targetMandatoryFieldsProvider: TargetMandatoryFieldsProvider;
  showDebug?: boolean;
  onAllDefaultValuesProvided: (allDefaultsProvided: boolean) => void;
}

const FieldMappingPanel = (props: FieldMappingPanelProps) => {

  // const determineIssueTypesBeingMapped = (issues: Issue[]): Set<IssueType> => {
  //   const issueTypes = new Set<IssueType>();
  //   issues.forEach(issue => {
  //     issueTypes.add(issue.fields.issuetype);
  //   });
  //   return issueTypes;
  // }

  const determineTargetIssueTypeIdsToTypesBeingMapped = (issues: Issue[]): Map<string, IssueType> => {
    const targetIssueTypeIdsToTypes = new Map<string, IssueType>();
    issues.forEach(issue => {
      const sourceProjectId = issue.fields.project.id;
      const sourceIddueTypeId = issue.fields.issuetype.id;
      const targetIssuetypeId = bulkIssueTypeMapping.getTargetIssueTypeId(sourceProjectId, sourceIddueTypeId);
      targetIssueTypeIdsToTypes.set(targetIssuetypeId, issue.fields.issuetype);
    });
    return targetIssueTypeIdsToTypes;
  }

  // const [issueTypesBeingMapped, setIssueTypesBeingMapped] = useState<Set<IssueType>>(determineIssueTypesBeingMapped(props.issues));
  // const [sourceIssueTypeIdsToTypesBeingMapped, setSourceIssueTypeIdsToTypesBeingMapped] = useState<Map<string, IssueType>>(determineTypeIdsToTypesBeingMapped(props.issues));
  const [targetIssueTypeIdsToTypesBeingMapped, setTargetIssueTypeIdsToTypesBeingMapped] = useState<Map<string, IssueType>>(determineTargetIssueTypeIdsToTypesBeingMapped(props.issues));
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
    props.targetMandatoryFieldsProvider.onSelectDefaultValue(targetIssueType, fieldId, fieldMetadata, defaultValue);
    const allDefaultValuesProvided = props.targetMandatoryFieldsProvider.areAllFieldValuesSet();
    setAllDefaultsProvided(allDefaultValuesProvided);
    props.onAllDefaultValuesProvided(allDefaultValuesProvided);
  }

  const onRetainFieldValueSelection = (targetIssueType: IssueType, fieldId: string, fieldMetadata: FieldMetadata, retainFieldValue: boolean): void => {
    props.targetMandatoryFieldsProvider.onSelectRetainFieldValue(targetIssueType, fieldId, fieldMetadata, retainFieldValue);
  }

  const renderFieldValuesSelect = (fieldId: string, targetIssueType: IssueType, fieldMetadata: FieldMetadata): JSX.Element => {
    const selectableCustomFieldOptions: CustomFieldOption[] = [];
      for (const allowedValue of fieldMetadata.allowedValues) {
        if (allowedValue.value) {
          const customFieldOption: CustomFieldOption = {
            id: allowedValue.id,
            name: allowedValue.value,
          };
          selectableCustomFieldOptions.push(customFieldOption);
        } else {
          console.log(`getFieldOptionsForProject: Skipping allowed value without a value: ${JSON.stringify(allowedValue)}`);
        }
      }
    return (
      <FieldValuesSelect
        label={undefined}
        selectableCustomFieldOptions={selectableCustomFieldOptions}
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
    return (
      <Textfield
        id={`number--for-${fieldId}`}
        name={fieldId}
        type="number"
        onChange={(event) => {
          const fieldValue = parseInt(event.currentTarget.value);
          const defaultValue: DefaultFieldValue = {
            retain: false,
            type: "raw",
            value: [fieldValue]
          };
          onSelectDefaultFieldValue(targetIssueType, fieldId, fieldMetadata, defaultValue);
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
    const isChecked = props.targetMandatoryFieldsProvider.getRetainFieldValue(targetIssueType.id, fieldId);
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
              <th className="no-break">Issue Type</th>
              <th className="no-break">Field</th>
              <th className="no-break">Options</th>
              <th className="no-break">Retain</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(props.fieldMappingsState.projectFieldMappings.targetIssueTypesToMappings.entries()).map(([targetIssueTypeId, fieldOptionMappings]) => {



              // const issueType = sourceIssueTypeIdsToTypesBeingMapped.get(targetIssueTypeId);
              const targetIssueType = targetIssueTypeIdsToTypesBeingMapped.get(targetIssueTypeId);



              if (targetIssueType) {
                return Array.from(fieldOptionMappings.fieldIdsToFieldMappingInfos.entries()).map(([fieldId, fieldMappingInfo]) => {
                  fieldCount++;
                  return (
                    <tr key={`mapping-${targetIssueTypeId}-${fieldId}`}>
                      <td>{targetIssueType.name}</td>
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
      return (
        <div>
          <p><span style={{color:'#006644'}}><SuccessIcon label="" color="currentColor" /></span> There are no fields that need default values to be set.</p>
        </div>
      )
    }
  }

  const renderDataNotRetrievedYet = () => {
    return (
      <div>
        <p>Waiting for previous steps to be completed.</p>
      </div>
    );
  }

  const renderDebug = () => {
    const clonedFieldMappingsState = JSON.parse(JSON.stringify(props.fieldMappingsState));
    const targetIssueTypesToMappings = props.fieldMappingsState.projectFieldMappings.targetIssueTypesToMappings;
    let targetIssueTypeInfo;
    if (targetIssueTypesToMappings) {
      const targetIssueTypeIds = Array.from(targetIssueTypesToMappings.keys());
      targetIssueTypeInfo = targetIssueTypeIds.map(issueTypeId => {
        const issueType = targetIssueTypesToMappings.get(issueTypeId);
        return {
          id: issueTypeId,
          name: issueType ? issueType.fieldIdsToFieldMappingInfos.size + ' fields' : 'No fields',
        };
      });
    } else {
      targetIssueTypeInfo = '????';
      clonedFieldMappingsState.targetIssueTypesToMappings = targetIssueTypeInfo;
    }

    return (
      <div>
        <h3>Debug Information</h3>
        <pre>{JSON.stringify(clonedFieldMappingsState, null, 2)}</pre>
        <p>All Defaults Provided: {allDefaultsProvided ? 'Yes' : 'No'}</p>
      </div>
    );
  }

  return (
    <div style={{margin: '20px 0px'}}>
      {props.fieldMappingsState.dataRetrieved ? renderFieldMappingsState() : renderDataNotRetrievedYet()}
      <div>
        {showDebug || props.showDebug ? renderDebug() : null}
      </div>
    </div>
  )

}
export default FieldMappingPanel;
