import React from 'react';
import { 
  IssueBulkEditField,
  IssueTypeField,
  NumberField,
  SelectField
} from "../types/IssueBulkEditFieldApiResponse";
import { Option } from '../types/Option'
import Select from '@atlaskit/select';
import Textfield from '@atlaskit/textfield';
import UsersSelect from './UserSelect';
import { User } from 'src/types/User';

export interface FieldEditorProps {
  field: IssueBulkEditField;
  enabled: boolean;
  value: any;
  onChange: (value: any) => void;
}

export const FieldEditor = (props: FieldEditorProps) => {

  const { field } = props;

  const renderDebugFieldInfo = () => {
    return <pre>{JSON.stringify(field, null, 2)}</pre>;
  }

  const renderIssueTypeFieldEditor = () => {
    const issueTypeField: IssueTypeField = field as IssueTypeField;
    const options: Option[] = [];
    for (const fieldOption of issueTypeField.fieldOptions) {
      const option: Option = {
        value: fieldOption.id,
        label: fieldOption.issueType,
      };
      options.push(option);

    }
    return (
      <Select
        inputId="checkbox-select-example"
        testId="projects-select"
        isMulti={false}
        isRequired={true}
        options={options}
        cacheOptions
        isDisabled={!props.enabled}
        onChange={(selectedOption: Option) => {
          props.onChange(selectedOption.value);
        }}
      />
    );
  }

  const renderNumberFieldEditor = () => {
    const numberField: NumberField = field as NumberField;
    let defaultValue: number = NaN;
    try {
      if (typeof props.value === 'number') {
        defaultValue = props.value;
      }
      defaultValue = parseFloat(props.value);
    } catch (error) {
      console.warn(`Error parsing number field value for field ID ${numberField.id}:`, error);
      defaultValue = NaN;
    }
    return (
      <Textfield
        id={`number-for-${numberField.id}`}
        name={numberField.id}
        isDisabled={!props.enabled}
        defaultValue={isNaN(defaultValue) ? '' : defaultValue.toString()}
        type="number"
        onChange={(event) => {
          let fieldValue: number | undefined = undefined;
          try {
            const fieldText = event.currentTarget.value.trim();
            if (fieldText === '' || fieldText === 'null') {
              fieldValue = undefined;
            } else {
              fieldValue = parseInt(event.currentTarget.value.trim());
            }
          } catch (error) {
            console.error(`Error parsing number field value for field ID ${numberField.id}:`, error);
          }
          props.onChange(fieldValue);
        }}
      />
    );
  }

  const renderTextFieldEditor = () => {
    return <input type="text" defaultValue={'Foo'} />;
  }

  const renderSelectFieldEditor = () => {
    const selectField: SelectField = field as SelectField;
    const options: Option[] = [];
    for (const fieldOption of selectField.fieldOptions) {
      const option: Option = {
        value: fieldOption.optionId,
        label: fieldOption.value,
      };
      options.push(option);

    }
    // return renderDebugFieldInfo();
    return (
      <Select
        inputId="checkbox-select-example"
        testId="projects-select"
        isMulti={false}
        isRequired={true}
        options={options}
        cacheOptions
        isDisabled={!props.enabled}
        onChange={(selectedOption: Option) => {
          props.onChange(selectedOption.value);
        }}
      />
    );
  }

  const renderSingleUserSelectFieldEditor = () => {
    // return renderDebugFieldInfo();
    return (
      <UsersSelect
        label=""
        isDisabled={!props.enabled}
        isMulti={false}
        isClearable={true}
        includeAppUsers={false}
        selectedUsers={[]}
        onUsersSelect={async (selectedUsers: User[]) => {
          if (selectedUsers.length === 0) {
            props.onChange(undefined);
          } else {
            props.onChange(selectedUsers[0].accountId);
          }
        }}
      />
    );
    // return <div>Reporter field editor not implemented yet.</div>;
  }

  const renderUnsupportedFieldEditor = () => {
    return <div>Unsupported field type: {field.type}</div>;
  }

  const renderFieldEditor = () => {
    const fieldType = field.type;
    switch (fieldType) {
      case 'issuetype':
        return renderIssueTypeFieldEditor();
      case 'com.atlassian.jira.plugin.system.customfieldtypes:float':
        return renderNumberFieldEditor();
      case 'com.atlassian.jira.plugin.system.customfieldtypes:select':
        return renderSelectFieldEditor();
      case 'reporter':
      case 'assignee':
        return renderSingleUserSelectFieldEditor();
      case 'text':
        return renderTextFieldEditor();
      default:
        return renderUnsupportedFieldEditor();
    }
  }

  return (
    <div>
      {renderFieldEditor()}
    </div>
  );

}
