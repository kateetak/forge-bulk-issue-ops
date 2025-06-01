import React, { useEffect, useState } from 'react';
import Toggle from '@atlaskit/toggle';
import Textfield from '@atlaskit/textfield';
import { IconButton } from '@atlaskit/button/new';
import { Label } from '@atlaskit/form';
import { Issue } from 'src/types/Issue';
import { IssueBulkEditField } from 'src/types/IssueBulkEditFieldApiResponse';
import { FieldEditor, isFieldTypeEditingSupported, renderUnsupportedFieldTypesDebug } from 'src/widget/FieldEditor';
import { ObjectMapping } from 'src/types/ObjectMapping';
import editedFieldsModel, { EditState } from 'src/model/editedFieldsModel';
import { FieldEditValue } from 'src/types/FieldEditValue';
import CrossCircleIcon from '@atlaskit/icon/core/cross-circle';

const currentIssuesDebugEnabled = false;
const editedFieldsDebugEnabled = false;
const fieldValuesDebugEnabled = false;
const fieldInfoDebugEnabled = false;

const toggleColumnWidth = '10px';

export type FieldEditsPanelProps = {
  selectedIssues: Issue[];
  selectedIssuesTime: number;
  onEditsValidityChange: (editsValid: boolean) => void;
}

export const FieldEditsPanel = (props: FieldEditsPanelProps) => {

  const [fieldNameFilter, setFieldNameFilter] = useState<string>('');
  const [fieldIdsToEditStates, setFieldIdsToEditStates] = useState<ObjectMapping<EditState>>({});
  const [fieldIdsToValues, setFieldIdsToValues] = useState<ObjectMapping<FieldEditValue>>({});
  const [fields, setFields] = useState<IssueBulkEditField[]>(editedFieldsModel.getFields());

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

  const isSelectedForChange = (fieldId: string): boolean => {
    const editState = fieldIdsToEditStates[fieldId];
    return editState === 'change';
  }

  const onToggleEditState = (fieldId: string, isChecked: boolean) => {
    const newState = {...fieldIdsToEditStates};
    if (isChecked) {
      newState[fieldId] = 'change';
    } else {
      newState[fieldId] = 'no-change';
    }
    editedFieldsModel.setFieldEditState(fieldId, newState[fieldId]);
    setFieldIdsToEditStates(newState);
    const valid = editedFieldsModel.getEditCount() > 0;
    props.onEditsValidityChange(valid);
  }

  const onFieldChange = (field: IssueBulkEditField, value: any) => {
    const newState = editedFieldsModel.setFieldValue(field, value);
    setFieldIdsToValues(newState);
    const valid = editedFieldsModel.getEditCount() > 0;
    props.onEditsValidityChange(valid);
  }

  const renderClearFilterControl = () => {
    return (
      <IconButton
        label="Clear"
        appearance="subtle"
        value={fieldNameFilter}
        isDisabled={fieldNameFilter === ''}
        icon={CrossCircleIcon}
        onClick={() => {
          setFieldNameFilter('');
        }}
      />
    );
  }

  const renderFieldNameFilterControl = () => {
    return (
      <div style={{marginBottom: '10px'}}>
        <Textfield
          name='fieldNameFilter'
          placeholder='Filter by field name...'
          value={fieldNameFilter}
          isCompact={true}
          elemAfterInput={renderClearFilterControl()}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const filterValue = event.currentTarget.value.toLowerCase();
            setFieldNameFilter(filterValue);
          }}
        />
      </div>
    );
  }

  const renderFields = () => {
    if (fields.length === 0 || editedFieldsModel.getIssues().length === 0) {
      return <div>No fields available.</div>;
    }
    const filteredFields = fields.filter(field => {
      return field.name.toLowerCase().includes(fieldNameFilter);
    });
    const renderedTableHead = (
      <thead>
        <tr>
          <th style={{ width: toggleColumnWidth }}></th>
          <th><><Label htmlFor=''>Field name</Label><div>{renderFieldNameFilterControl()}</div></></th>
          <th><Label htmlFor=''>Field value</Label></th>
        </tr>
      </thead>
    );
    const renderedTableRows: any[] = [];
    editedFieldsModel.iterateAllFields((field: IssueBulkEditField, value: FieldEditValue) => {
      const showRow = (renderUnsupportedFieldTypesDebug || isFieldTypeEditingSupported(field.type)) && field.name.toLowerCase().includes(fieldNameFilter);
      if (showRow) {
        const selectedForChange = isSelectedForChange(field.id);
        const renderedTableRow = (
          <tr key={`field-${field.id}`}>
            <td style={{width: toggleColumnWidth}}>
              <Toggle
                id={`toggle-field-${field.id}`}
                isChecked={selectedForChange}
                onChange={(event: any) => {
                  onToggleEditState(field.id, event.currentTarget.checked);
                }}
              />
            </td>
            <td>{field.name}</td>
            <td>
              <FieldEditor
                field={field}
                enabled={selectedForChange}
                maybeEditValue={fieldIdsToValues[field.id]}
                onChange={(value: FieldEditValue) => {
                  onFieldChange(field, value)
                }}
              />
            </td>
          </tr>
        );
        renderedTableRows.push(renderedTableRow);
      }
    });
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

  const renderDataDebug = (label: string, data: any) => {
    if (fieldValuesDebugEnabled) {
      return (
        <div>
          <h3>{label}</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
    } else {
      return null;
    }
  }

  const renderCurrentIssuesDebug = () => {
    const currentIssues = editedFieldsModel.getCurrentIssues();
    return renderDataDebug('Current Issues Debug', currentIssues);
  }

  const renderEditedFieldsDebug = () => {
    const editedFields = editedFieldsModel.getEditedFields();
    return renderDataDebug('Edited Fields Debug', editedFields);
  }

  const renderFieldValuesDebug = () => {
    return renderDataDebug('Field Values Debug', fieldIdsToValues);
  }

  const renderFieldInfoDebug = () => {
    return renderDataDebug('Fields Debug', fields);
  }

  return (
    <div style={{marginTop:  '20px'}}>
      {renderFields()}
      {currentIssuesDebugEnabled ? renderCurrentIssuesDebug() : null}
      {editedFieldsDebugEnabled ? renderEditedFieldsDebug() : null}
      {fieldValuesDebugEnabled ? renderFieldValuesDebug() : null}
      {fieldInfoDebugEnabled ? renderFieldInfoDebug() : null}
    </div>
  );

}
