import React, { useEffect, useState } from 'react';
import { Label } from '@atlaskit/form';
import { Option } from '../types/Option'
import Select from '@atlaskit/select';

/*
  This widget renders a dropdown select where the options are a discrete set of strings.
*/

export type FixedOptionsSelectProps = {
  label?: string;
  placeholder?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  allowMultiple: boolean;
  allOptionTexts: string[];
  selectedOptionTexts: string[],
  onSelect: (selectedOptionTexts: string[]) => Promise<void>;
}

const FixedOptionsSelect = (props: FixedOptionsSelectProps) => {

  const optionTextToOption = (optionText: string): Option => {
    return {
      value: optionText,
      label: optionText,
    };
  }

  const optionTextsToOptions = (optionTexts: string[]): Option[] => {
    return optionTexts.map(optionText => optionTextToOption(optionText));
  }

  const optionToOptionText = (option: Option): string => {
    return option.label;
  }

  const optionsToOptionTexts = (options: Option[]): string[] => {
    return options.map(option => optionToOptionText(option));
  }

  const determineDefaultOptions = (): undefined | Option | Option[] => {
    if (!props.selectedOptionTexts || props.selectedOptionTexts.length === 0) {
      return undefined;
    } else {
      const options = optionTextsToOptions(props.selectedOptionTexts);
      if (props.allowMultiple) {
        return options;
      } else {
        return options.length > 0 ? options[0] : undefined;
      }
    }
  }

  const onSingleSelectChange = async (selectedOption: undefined | Option): Promise<void> => {
    // console.log(`FixedOptionsSelect.onChange: `, selectedOption);
    if (selectedOption) {
      await props.onSelect([optionToOptionText(selectedOption)]);
    } else {
      await props.onSelect([]);
    }
  }

  const onMultiSelectChange = async (selectedOptions: Option[]) => {
    const optionTexts = optionsToOptionTexts(selectedOptions);
    props.onSelect(optionTexts);
  }

  const renderSelect = () => {
    return (
      <Select
        inputId="checkbox-select-example"
        testId="select"
        label={props.label}
        isMulti={props.allowMultiple}
        isDisabled={props.isDisabled}
        isInvalid={props.isInvalid}
        options={optionTextsToOptions(props.allOptionTexts)}
        value={determineDefaultOptions()}
        placeholder={props.placeholder}
        menuPortalTarget={document.body}
        onChange={props.allowMultiple ? onMultiSelectChange : onSingleSelectChange}
      />
    )
  }

  return (
    <>
      {props.label ? <Label htmlFor="fixed-options-select">{props.label}</Label> : null}
      {renderSelect()}
    </>
  );
}

export default FixedOptionsSelect;
