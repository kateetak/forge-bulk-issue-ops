import React from 'react';
import { Option } from '../types/Option'
import { ObjectMapping } from '../types/ObjectMapping';
import { CascadingSelectField, IssueBulkEditField } from '../types/IssueBulkEditFieldApiResponse';
import Select from '@atlaskit/select';
import { FieldEditValue } from 'src/types/FieldEditValue';

export type CascadingSelectValue = {
  value: string;
  id: string;
  child: {
    value: string;
    id: string;
  }
}

export type CascadingSelectProps = {
  value?: CascadingSelectValue;
  field: IssueBulkEditField;
  isDisabled?: boolean;
  isInvalid?: boolean;
  onChange: (value: CascadingSelectValue) => void;
}

type OptionContext = {
  parentOptions: Option[];
  parentOptionValuesToChildOptions: ObjectMapping<Option[]>;
}

export const CascadingSelect = (props: CascadingSelectProps) => {

  const buildOptionContext = (): OptionContext => {
    // console.log(`CascadingSelect.buildOptionContext: building option context from ${JSON.stringify(props.field, null, 2)}`);
    const parentOptions: Option[] = [];
    const parentOptionValuesToChildOptions: ObjectMapping<Option[]> = {};
    const cascadingSelectField = props.field as CascadingSelectField;
    if (cascadingSelectField.fieldOptions && cascadingSelectField.fieldOptions.length > 0) {
      const fieldOptions = cascadingSelectField.fieldOptions;
      for (const cascadingFieldOption of fieldOptions) {
        const parentOption: Option = {
          value: cascadingFieldOption.parentOption.optionId.toString(),
          label: cascadingFieldOption.parentOption.value,
        };
        parentOptions.push(parentOption);
        const childOptions: Option[] = [];
        for (const childOption of cascadingFieldOption.childOptions) {
          const childOptionValue: Option = {
            value: childOption.optionId.toString(),
            label: childOption.value,
          };
          childOptions.push(childOptionValue);
        }
        parentOptionValuesToChildOptions[parentOption.value] = childOptions;
      }
    }
    const optionContext: OptionContext = {
      parentOptions: parentOptions,
      parentOptionValuesToChildOptions: parentOptionValuesToChildOptions,
    }
    // console.log(`CascadingSelect.buildOptionContext: built option context ${JSON.stringify(optionContext, null, 2)}`);
    return optionContext;
  }

  const [optionContext, setOptionContext] = React.useState<OptionContext>(buildOptionContext());
  const [fieldValue, setFieldValue] = React.useState<CascadingSelectValue | undefined>(props.value);

  const notifyChange = (newValue: CascadingSelectValue) => {
    if (newValue && newValue.id && newValue.child && newValue.child.id) {
      // console.log(`CascadingSelect.maybeNotifyChange: newValue ${JSON.stringify(newValue, null, 2)}`);
      props.onChange(newValue);
    } else {
      props.onChange(undefined);
    }
  }

  const onParentOptionSelect = (selectedOption: Option) => {
    if (selectedOption === null || selectedOption === undefined) {
      setFieldValue(undefined);
      notifyChange(undefined);
    } else {
      if (selectedOption.value === fieldValue?.value) {
        // No change, do nothing
        return;
      }
      const childOptions = parentOptionValuesToChildOptions[selectedOption.value];
      const firstChildOption = childOptions && childOptions.length > 0 ? childOptions[0] : undefined;

      const newValue: CascadingSelectValue = {
        value: selectedOption.value,
        id: selectedOption.value, // Assuming the value is the same as the id
        child: {
          value: firstChildOption ? firstChildOption.label : '',
          id: firstChildOption ? firstChildOption.value : '',
        }
      };
      setFieldValue(newValue);
      notifyChange(newValue);
    }
  }

  const onChildOptionSelect = (selectedOption: Option) => {
    // console.log(`CascadingSelect.onChildOptionSelect: selectedOption ${JSON.stringify(selectedOption, null, 2)}`);
    const parentOptionId = fieldValue?.id;
    if (parentOptionId) {
      const parentOption = optionContext.parentOptions.find(option => option.value === parentOptionId);
      if (parentOption) {
        // console.log(`CascadingSelect.onChildOptionSelect: parentOption ${JSON.stringify(parentOption, null, 2)}`);
        const childOptions = optionContext.parentOptionValuesToChildOptions[parentOption.value];
        const selectedChildOption = childOptions.find(option => option.value === selectedOption.value);
        if (selectedChildOption) {
          const newValue: CascadingSelectValue = {
            value: parentOption.label,
            id: parentOption.value,
            child: {
              value: selectedChildOption.label,
              id: selectedChildOption.value,
            }
          };
          setFieldValue(newValue);
          notifyChange(newValue);
        } else {
          console.warn(`CascadingSelect: Selected child option ${selectedOption.value} not found in parent option ${parentOption.value}`);
        }
      } else {

      }
    } else {
      console.warn(`CascadingSelect: No parent option selected, cannot select child option.`);
    }
  }

  // console.log(`CascadingSelect: ${JSON.stringify(props.field, null, 2)}`);
  const parentOptionValuesToChildOptions: ObjectMapping<Option[]> = {};
  const cascadingSelectField = props.field as CascadingSelectField;
  if (cascadingSelectField.fieldOptions && cascadingSelectField.fieldOptions.length > 0) {
    const childOptions = fieldValue ? optionContext.parentOptionValuesToChildOptions[fieldValue?.id] : [];
    // console.log(`CascadingSelect: childOptions ${JSON.stringify(childOptions, null, 2)}`);
    return (
      <div>
        <Select
          id={`cascading-select-parent-${props.field.id}`}
          name={`cascading-select-parent-${props.field.id}`}
          isDisabled={props.isDisabled}
          isInvalid={props.isInvalid}
          defaultOptions={optionContext.parentOptions}
          onChange={onParentOptionSelect}
        />
        <Select
          key={`cascading-select-child-${fieldValue?.id}`}
          id={`cascading-select-child-${props.field.id}`}
          name={`cascading-select-chilet-${props.field.id}`}
          isDisabled={props.isDisabled}
          isInvalid={props.isInvalid}
          defaultOptions={childOptions}
          onChange={onChildOptionSelect}
        />
      </div>
    )
  } else {
    return (
      <div>
        <p className="inline-error-message">
          No options available for cascading select field "{props.field.name}"". Please check the field configuration.
        </p>
      </div>
    );
  }

}
