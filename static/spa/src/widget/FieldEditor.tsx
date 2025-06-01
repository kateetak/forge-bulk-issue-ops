import React from 'react';
import { 
  CommentField,
  IssueBulkEditField,
  IssueTypeField,
  LabelsField,
  NumberField,
  PriorityField,
  SelectField
} from "../types/IssueBulkEditFieldApiResponse";
import { Option } from '../types/Option'
import Select from '@atlaskit/select';
import TextArea from '@atlaskit/textarea';
import Textfield from '@atlaskit/textfield';
import UsersSelect from './UserSelect';
import { User } from 'src/types/User';
import LabelsSelect from './LabelsSelect';
import FixedOptionsSelect from './FixedOptionsSelect';
import { FieldEditValue, MultiSelectFieldEditOption } from 'src/types/FieldEditValue';
import { adfToText, textToAdf } from 'src/controller/textToAdf';
import { Label } from '@atlaskit/form';

export interface FieldEditorProps {
  field: IssueBulkEditField;
  enabled: boolean;
  maybeEditValue?: FieldEditValue;
  onChange: (value: FieldEditValue) => void;
}

export const FieldEditor = (props: FieldEditorProps) => {

  const { field } = props;

  const renderDebugFieldInfo = () => {
    return <pre>{JSON.stringify(field, null, 2)}</pre>;
  }

  const renderIssueTypeFieldEditor = () => {
    const issueTypeField = field as IssueTypeField;
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
          const newValue: FieldEditValue = {
            value: selectedOption.value,
          }
          props.onChange(newValue);
        }}
      />
    );
  }

  const renderPriorityFieldEditor = () => {
    const priorityField = field as PriorityField;
    const options: Option[] = [];
    for (const fieldOption of priorityField.fieldOptions) {
      const option: Option = {
        value: fieldOption.id,
        label: fieldOption.priority,
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
          const newValue: FieldEditValue = {
            value: selectedOption.value,
          }
          props.onChange(newValue);
        }}
      />
    );
  }

  const renderNumberFieldEditor = () => {
    const numberField: NumberField = field as NumberField;
    let defaultValue: number = NaN;
    try {
      const value = props.maybeEditValue?.value;
      if (typeof value === 'number') {
        defaultValue = value;
      }
      defaultValue = parseFloat(value);
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
          const newValue: FieldEditValue = {
            value: fieldValue,
          }
          props.onChange(newValue);
        }}
      />
    );
  }

  const renderLabelsFieldEditor = () => {
    const labelsField = field as LabelsField;
    const multiSelectFieldOptions = labelsField.multiSelectFieldOptions;
    // KNOWN-2: Filter out the 'REPLACE' option if it exists, as it is not supported in the UI.
    const supportedMultiSelectFieldOptions: MultiSelectFieldEditOption[] = multiSelectFieldOptions.filter(option => option !== 'REPLACE');
    const selectedMultiSelectFieldOption = props.maybeEditValue?.multiSelectFieldOption || 'ADD';
    const selectedLabelOptions: Option[] = [];
    const value = props.maybeEditValue?.value;
    if (value && Array.isArray(value)) {
      for (const label of value) {
        const option: Option = {
          value: label,
          label: label,
        };
        selectedLabelOptions.push(option);
      }
    } else if (typeof value === 'string') {
      const option: Option = {
        value: value,
        label: value,
      };
      selectedLabelOptions.push(option);
    }
    const selectedLabels = props.maybeEditValue?.value;
    // KNOWN-3: Labels can not be created within the bulk edit form. The LabelsSelect component needs to be enhanced to support 
    //          this (the underlying Select component supports this. See https://atlassian.design/components/select/code).
    return (
      <div className='edit-options-panel'>
        <div className='edit-options'>
          <FixedOptionsSelect
            label="Edit type"
            allowMultiple={false}
            isDisabled={!props.enabled}
            allOptionTexts={supportedMultiSelectFieldOptions}
            selectedOptionTexts={[selectedMultiSelectFieldOption]}
            onSelect={async (selectedOptionTexts: string[]): Promise<void> => {
              const multiSelectFieldOption = selectedOptionTexts.length > 0 ? selectedOptionTexts[0] : undefined;
              const newValue: FieldEditValue = {
                value: value,
                multiSelectFieldOption: multiSelectFieldOption as MultiSelectFieldEditOption,
              }
              props.onChange(newValue);
            }}
          />
        </div>
        <div className='edit-value'>
          <LabelsSelect
            label="Labels"
            allowMultiple={true}
            isDisabled={!props.enabled || selectedMultiSelectFieldOption === 'REMOVE_ALL'}
            selectedLabels={selectedLabels}
            onLabelsSelect={async (selectedLabels: string[]): Promise<void> => {
              const newValue: FieldEditValue = {
                value: selectedLabels,
                multiSelectFieldOption: props.maybeEditValue?.multiSelectFieldOption,
              }
              props.onChange(newValue);
            }}
          />
        </div>
      </div>
    );
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
          const newValue: FieldEditValue = {
            value: selectedOption.value,
          }
          props.onChange(newValue);
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
            const newValue: FieldEditValue = {
              value: selectedUsers[0].accountId,
            }
            props.onChange(newValue);
          }
        }}
      />
    );
    // return <div>Reporter field editor not implemented yet.</div>;
  }

  const renderTextFieldEditor = () => {
    return <input type="text" defaultValue={'Foo'} />;
  }

  const renderCommentFieldEditor = () => {
    const initialValue = props.maybeEditValue?.value || '';
    // KNOWN-4: Bulk comment editing only supports plain text where each new line is represented as a new paragraph.
    const initialText = adfToText(initialValue);
    return (
      <div>
        <Label htmlFor="bulk-edit-comment">Plain text comment</Label>
        <TextArea
          id="bulk-edit-comment"
          resize="auto"
          minimumRows={3}
          name="area"
          defaultValue={initialText}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
            // KNOWN-4: Bulk comment editing only supports plain text where each new line is represented as a new paragraph.
            const adf = textToAdf(event.target.value);
            const newValue: FieldEditValue = {
              value: adf
            }
            props.onChange(newValue);
          }}
        />
      </div>
    )
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
      case 'labels':
        return renderLabelsFieldEditor();
      case 'priority':
        return renderPriorityFieldEditor();
      case 'text':
        return renderTextFieldEditor();
      case 'comment':
        return renderCommentFieldEditor();
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
