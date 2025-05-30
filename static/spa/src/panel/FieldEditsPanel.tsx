import React, { useEffect } from 'react';
import Toggle from '@atlaskit/toggle';
import { Label } from '@atlaskit/form';
import jiraDataModel from 'src/model/jiraDataModel';
import { Issue } from 'src/types/Issue';
import { IssueBulkEditField } from 'src/types/IssueBulkEditFieldApiResponse';
import { FieldEditor } from 'src/widget/FieldEditor';
import { ObjectMapping } from 'src/types/ObjectMapping';

const fieldInfoDebugEnabled = false;
const fieldValuesDebugEnabled = true;

export type FieldEditsPanelProps = {
  selectedIssues: Issue[];
}

export const FieldEditsPanel = (props: FieldEditsPanelProps) => {

  const [fields, setFields] = React.useState<IssueBulkEditField[]>([]);
  const [fieldIdsToValues, setFieldIdsToValues] = React.useState<ObjectMapping<any>>({});

  const sortFields = (fields: IssueBulkEditField[]) => {
    // Put the required firelds first since they are the most important.
    return fields.sort((a, b) => {
      const requirementComparison = a.isRequired === b.isRequired ? 0 : (a.isRequired ? -1 : 1);
      if (requirementComparison === 0) {
        const idComparison = a.id.localeCompare(b.id);
        const nameComparison = a.name.localeCompare(b.name);
        if (nameComparison === 0) {
          return idComparison;
        } else {
          return nameComparison;
        }
      } else {
        return requirementComparison;
      }
    });
  }

  const loadFields = async (issues: Issue[]) => {
    console.log(`FieldEditsPanel.loadFields: Loading fields for ${issues.length} issues.`);
    const fields = await jiraDataModel.getAllIssueBulkEditFields(issues);
    console.log(`FieldEditsPanel.loadFields: Loaded ${fields.length} fields.`);
    const sortedFields = sortFields(fields);
    setFields(sortedFields);
  }

  useEffect(() => {
    loadFields(props.selectedIssues);
  }, [props.selectedIssues]);

  const onFieldChange = (field: IssueBulkEditField, value: any) => {
    setFieldIdsToValues((prev) => ({
      ...prev,
      [field.id]: value,
    }));
  }

  const renderFields = () => {
    if (fields.length === 0) {
      return <div>No fields available.</div>;
    }
    const renderedTableHead = (
      <thead>
        <tr>
          <th><Label htmlFor=''>Edit</Label></th>
          <th><Label htmlFor=''>Field name</Label></th>
          <th><Label htmlFor=''>Field value</Label></th>
        </tr>
      </thead>
    );
    const renderedTableRows = (
      fields.map((field, index) => {
        const isChecked = true;
        return (
          <tr key={`field-${field.id}`}>
            <td>
              <Toggle
                id={`toggle-field-${field.id}`}
                defaultChecked={isChecked}
                onChange={(event: any) => {
                  // onRetainFieldValueSelection(targetIssueType, fieldId, fieldMetadata, event.currentTarget.checked);
                }}
              />
            </td>
            <td>{field.name}</td>
            <td>
              <FieldEditor
                field={field}
                value={fieldIdsToValues[field.id]}
                onChange={(value: any) => {
                  onFieldChange(field, value)
                }}
              />
            </td>
          </tr>
        )
      })
    )
    return (
      <div>
        <table>
          {renderedTableHead}
          <tbody>
            {renderedTableRows}
          </tbody>
        </table>
      </div>
    );
  }

  const renderFieldValuesDebug = () => {
    if (fieldValuesDebugEnabled) {
      return (
        <div>
          <h3>Field Values Debug</h3>
          <pre>{JSON.stringify(fieldIdsToValues, null, 2)}</pre>
        </div>
      );
    } else {
      return null;
    }
  }

  const renderFieldInfoDebug = () => {
    if (fieldInfoDebugEnabled) {
      return (
        <div>
          <pre>{JSON.stringify(fields, null, 2)}</pre>
        </div>
      );
    } else {
      return null;
    }
  }

  return (
    <div style={{marginTop:  '20px'}}>
      {renderFields()}
      {renderFieldValuesDebug()}
      {renderFieldInfoDebug()}
    </div>
  );

}
