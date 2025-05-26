import React, { useEffect, useState } from 'react';
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

export type FieldMappingsState = {
  dataRetrieved: boolean;
  project: undefined | Project;
  projectFieldMappings: ProjectFieldMappings;
}
export const nilFieldMappingsState: FieldMappingsState = {
  dataRetrieved: false,
  project: undefined,
  projectFieldMappings: {
    issueTypesToMappings: new Map<string, IssueTypeFieldMappings>()
  }
}

export type FieldMappingPanelProps = {
  issues: Issue[];
  fieldMappingsState: FieldMappingsState;
  targetMandatoryFieldsProvider: TargetMandatoryFieldsProvider;
  showDebug?: boolean;
  onAllDefaultValuesProvided: (allDefaultsProvided: boolean) => void;
}

const FieldMappingPanel = (props: FieldMappingPanelProps) => {

  const determineIssueTypesBeingMapped = (issues: Issue[]): Set<IssueType> => {
    const issueTypes = new Set<IssueType>();
    issues.forEach(issue => {
      issueTypes.add(issue.fields.issuetype);
    });
    return issueTypes;
  }

  const determineTypeIdsToTypesBeingMapped = (issues: Issue[]): Map<string, IssueType> => {
    const issueTypeIdsToTypes = new Map<string, IssueType>();
    issues.forEach(issue => {
      issueTypeIdsToTypes.set(issue.fields.issuetype.id, issue.fields.issuetype);
    });
    return issueTypeIdsToTypes;
  }

  const [issueTypesBeingMapped, setIssueTypesBeingMapped] = useState<Set<IssueType>>(determineIssueTypesBeingMapped(props.issues));
  const [issueTypeIdsToTypesBeingMapped, setIssueTypeIdsToTypesBeingMapped] = useState<Map<string, IssueType>>(determineTypeIdsToTypesBeingMapped(props.issues));
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

  const onSelectDefaultFieldValue = (issueType: IssueType, fieldId: string, fieldMetadata: FieldMetadata, defaultValue: DefaultFieldValue): void => {
    props.targetMandatoryFieldsProvider.onSelectDefaultValue(issueType, fieldId, fieldMetadata, defaultValue);
    const allDefaultValuesProvided = props.targetMandatoryFieldsProvider.areAllFieldValuesSet();
    setAllDefaultsProvided(allDefaultValuesProvided);
    props.onAllDefaultValuesProvided(allDefaultValuesProvided);
  }

  const renderFieldValuesSelect = (fieldId: string, issueType: IssueType, fieldMetadata: FieldMetadata): JSX.Element => {
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
          onSelectDefaultFieldValue(issueType, fieldId, fieldMetadata, defaultValue);
        }}
      />
    );
  }

  const renderNumberFieldEntryWidget = (fieldId: string, issueType: IssueType, fieldMetadata: FieldMetadata): JSX.Element => {
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
          onSelectDefaultFieldValue(issueType, fieldId, fieldMetadata, defaultValue);
        }}
      />
    );
  }

  const renderFieldValuesEntryWidget = (fieldId: string, issueType: IssueType, fieldMetadata: FieldMetadata): JSX.Element => {
    if (fieldMetadata.schema.type === 'option' || fieldMetadata.schema.type === 'options') {
      if (fieldMetadata.allowedValues) {
        return renderFieldValuesSelect(fieldId, issueType, fieldMetadata);
      } else {
        <div>
          <p><span style={{color:'#ff0000'}}>No options available for this field (type = {fieldMetadata.schema.type}).</span></p>
        </div>
      }
    } else if (fieldMetadata.schema.type === 'number') {
      return renderNumberFieldEntryWidget(fieldId, issueType, fieldMetadata);
    } else {
      return (
        <div>
          <p><span style={{color:'#ff0000'}}>Unexpected field type: {fieldMetadata.schema.type}.</span></p>
        </div>
      );
    }
  }

  const renderFieldMappingsState = () => {
    let fieldCount = 0;
    const renderedTable = (
      <div>
        <table >
          <thead>
            <tr>
              <th>Issue Type</th>
              <th>Field</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(props.fieldMappingsState.projectFieldMappings.issueTypesToMappings.entries()).map(([issueTypeId, fieldOptionMappings]) => {
              const issueType = issueTypeIdsToTypesBeingMapped.get(issueTypeId);
              if (issueType) {
                return Array.from(fieldOptionMappings.fieldIdsToFieldMetadata.entries()).map(([fieldId, options]) => {
                  fieldCount++;
                  return (
                    <tr key={`mapping-${issueTypeId}-${fieldId}`}>
                      <td>{issueType.name}</td>
                      <td>{fieldIdsToFields.get(fieldId)?.name || fieldId}</td>
                      <td>
                        {renderFieldValuesEntryWidget(fieldId, issueType, options)}
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

  return (
    <div style={{margin: '20px 0px'}}>
      {props.fieldMappingsState.dataRetrieved ? renderFieldMappingsState() : renderDataNotRetrievedYet()}
      <div>
        {props.showDebug && (
          <div>
            <h3>Debug Information</h3>
            <pre>{JSON.stringify(props.fieldMappingsState, null, 2)}</pre>
            <p>All Defaults Provided: {allDefaultsProvided ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  )

}
export default FieldMappingPanel;
