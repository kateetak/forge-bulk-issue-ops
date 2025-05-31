import React, { useEffect } from 'react';
import Toggle from '@atlaskit/toggle';
import { Label } from '@atlaskit/form';
import { Issue } from 'src/types/Issue';
import { IssueBulkEditField } from 'src/types/IssueBulkEditFieldApiResponse';
import { FieldEditor } from 'src/widget/FieldEditor';
import { ObjectMapping } from 'src/types/ObjectMapping';
import editedFieldsModel from 'src/model/editedFieldsModel';

const fieldInfoDebugEnabled = false;
const fieldValuesDebugEnabled = true;

export type FieldEditsPanelProps = {
  selectedIssues: Issue[];
  selectedIssuesTime: number;
}

export const FieldEditsPanel = (props: FieldEditsPanelProps) => {

  const [fieldIdsToValues, setFieldIdsToValues] = React.useState<ObjectMapping<any>>({});
  const [fields, setFields] = React.useState<IssueBulkEditField[]>(editedFieldsModel.getFields());

  const initialiseStateFromIssues = async (issues: Issue[]): Promise<void> => {
    await editedFieldsModel.setIssues(issues);
    setFields(editedFieldsModel.getFields());
  }

  useEffect(() => {
    initialiseStateFromIssues(props.selectedIssues);
  }, []);

  useEffect(() => {
    initialiseStateFromIssues(props.selectedIssues);
  }, [props.selectedIssues]);

  const onFieldChange = (field: IssueBulkEditField, value: any) => {
    const newState = editedFieldsModel.setFieldValue(field, value);
    setFieldIdsToValues(newState);
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
