import { FieldEditValue, MultiSelectFieldEditOption } from "src/types/FieldEditValue";
import FixedOptionsSelect from "./FixedOptionsSelect";
import { MultiSelectOption } from "../types/IssueBulkEditFieldApiResponse";
import { Option } from "../types/Option";

export type EditOptionSelectProps = {
  multiSelectFieldOptions: MultiSelectOption[];
  selectedMultiSelectFieldOption?: MultiSelectFieldEditOption;
  isDisabled: boolean;
  isInvalid: boolean;
  onChange: (value: MultiSelectOption) => void;
}

export const EditOptionSelect = (props: EditOptionSelectProps) => {
  // KNOWN-2: Filter out the 'REPLACE' option if it exists, as it is not supported in the UI.
  const supportedMultiSelectFieldOptions: MultiSelectFieldEditOption[] = props.multiSelectFieldOptions.filter(option => option !== 'REPLACE');
  const selectedMultiSelectFieldOption = props.selectedMultiSelectFieldOption || 'ADD';
  const selectedLabelOptions: Option[] = [];
  const value = props.selectedMultiSelectFieldOption;
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
  // const selectedLabels = props.selectedMultiSelectFieldOption;
  return (
    <div className='edit-options'>
      <FixedOptionsSelect
        label="Edit type"
        allowMultiple={false}
        isDisabled={props.isDisabled}
        isInvalid={props.isInvalid}
        allOptionTexts={supportedMultiSelectFieldOptions}
        selectedOptionTexts={[selectedMultiSelectFieldOption]}
        onSelect={async (selectedOptionTexts: string[]): Promise<void> => {
          const multiSelectFieldOption = selectedOptionTexts.length > 0 ? selectedOptionTexts[0] as MultiSelectFieldEditOption : undefined;
          props.onChange(multiSelectFieldOption);
        }}
      />
    </div>
  );

}