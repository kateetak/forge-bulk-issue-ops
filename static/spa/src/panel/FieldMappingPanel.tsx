import React, { useEffect, useState } from 'react';
import { CustomFieldOption } from "../types/CustomFieldOption";
import { IssueTypeFieldOptionMappings, ProjectFieldOptionMappings } from "../types/ProjectFieldOptionMappings";
import { Issue } from "../types/Issue";
import { IssueType } from '../types/IssueType';
import { Field } from 'src/types/Field';
import jiraDataModel from 'src/model/jiraDataModel';
import FieldValuesSelect from 'src/widget/FieldValuesSelect';
import { TargetMandatoryFieldsProvider } from 'src/controller/TargetMandatoryFieldsProvider';
import SuccessIcon from '@atlaskit/icon/core/success';

export type FieldMappingsState = {
  dataRetrieved: boolean;
  projectFieldOptionMappings: ProjectFieldOptionMappings;
}
export const nilFieldMappingsState: FieldMappingsState = {
  dataRetrieved: false,
  projectFieldOptionMappings: {
    issueTypesToMappings: new Map<string, IssueTypeFieldOptionMappings>()
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

  const onSelectDefaultFieldValue = (issueType: IssueType, fieldId: string, fieldOption: CustomFieldOption): void => {
    props.targetMandatoryFieldsProvider.onSelectDefaultValue(issueType, fieldId, fieldOption);
    const allDefaultValuesProvided = props.targetMandatoryFieldsProvider.areAllFieldValuesSet();
    console.log(`onSelectDefaultFieldValue: ${issueType.name} - ${fieldId} - ${fieldOption.name} - All Defaults Provided: ${allDefaultValuesProvided}`);
    setAllDefaultsProvided(allDefaultValuesProvided);
    props.onAllDefaultValuesProvided(allDefaultValuesProvided);
  }

  const renderFieldMappingsState = () => {
    let fieldCount = 0;
    const renderedTable = (
      <table>
        <thead>
          <tr>
            <th>Issue Type</th>
            <th>Field</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(props.fieldMappingsState.projectFieldOptionMappings.issueTypesToMappings.entries()).map(([issueTypeId, fieldOptionMappings]) => {
            const issueType = issueTypeIdsToTypesBeingMapped.get(issueTypeId);
            if (issueType) {
              return Array.from(fieldOptionMappings.fieldIdsToOptions.entries()).map(([fieldId, options]) => {
                fieldCount++;
                return (
                  <tr key={`mapping-${issueTypeId}-${fieldId}`}>
                    <td>{issueType.name} ({issueTypeId})</td>
                    <td>{fieldIdsToFields.get(fieldId)?.name || fieldId}</td>
                    <td>
                      <FieldValuesSelect
                        label={undefined}
                        selectableCustomFieldOptions={options}
                        onSelect={async (selectedCustomFieldOption: CustomFieldOption): Promise<void> => {
                          onSelectDefaultFieldValue(issueType, fieldId, selectedCustomFieldOption);
                        }}
                      />
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
