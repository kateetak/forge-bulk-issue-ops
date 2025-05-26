import React, { useEffect, useState } from 'react';
import { Label } from '@atlaskit/form';
import { Option } from '../types/Option'
import { RadioSelect, CheckboxSelect } from '@atlaskit/select';
import jiraDataModel from 'src/model/jiraDataModel';

/*
  Select docs: https://atlassian.design/components/select/examples
*/

export type LabelSelectProps = {
  label: string;
  allowMultiple: boolean;
  selectedLabel?: string;
  selectedLabels?: string[],
  onLabelsSelect: (selectedLabels: string[]) => Promise<void>;
}

const LabelSelect = (props: LabelSelectProps) => {

  const [labelInfo, setLabelInfo] = useState<any>({
    values: []
  });
  const [labelInfoRetrievalTime, setLabelInfoRetrievalTime] = useState<number>(0);

  const refreshLabelInfo = async () => {
    const labelInfo = await jiraDataModel.getLabelsInfo();
    setLabelInfo(labelInfo);
    setLabelInfoRetrievalTime(Date.now());
  }

  useEffect(() => {
    refreshLabelInfo();
  }, []);

  const options = labelInfo.values.map((label: string) => ({
    label: label,
    value: label,
  }));

  // console.log(`Label options = ${JSON.stringify(options, null, 2)}`);

  const onSingleSelectChange = async (selectedOption: undefined | Option): Promise<void> => {
    // console.log(`LabelSelect.onChange: `, selectedOption);
    if (selectedOption) {
      await props.onLabelsSelect([selectedOption.value]);
    } else {
      await props.onLabelsSelect([]);
    }
  }

  const onMultiSelectChange = async (selectedOptions: Option[]) => {
    const labels = selectedOptions.map((option: Option) => option.value);
    props.onLabelsSelect(labels);
  }

  const determineDefaultMultipleOptions = (initiallySelectedLabels: string[]): Option[] => {
    const initialOptions: Option[] = options.map(option => {
      const foundLabel = initiallySelectedLabels.find((initiallySelectedOption) => {
        return option.value === initiallySelectedOption;
      });
      return foundLabel ? option : null;
    });
    return initialOptions;
  }

  const determineDefaultSingleOption = (initiallySelectedLabel: string): Option => {
    const option = options.find((option: Option) => option.value === initiallySelectedLabel);
    return option;
  }

  const defaultValue = props.allowMultiple && props.selectedLabels ? 
    determineDefaultMultipleOptions(props.selectedLabels) :
    !props.allowMultiple && props.selectedLabel ?
    determineDefaultSingleOption(props.selectedLabel) : undefined;

  const renderSingleSelect = () => {
    return (
      <RadioSelect
        key={`single-label-select-${labelInfoRetrievalTime}`}
        inputId="radio-select-example"
        testId="react-select"
        defaultValue={defaultValue}
        options={options}
        placeholder={props.label}
        onChange={onSingleSelectChange}
      />
    );
  }

  const renderMultiSelect = () => {
    return (
      <CheckboxSelect
        key={`multi-label-select-${labelInfoRetrievalTime}`}
        inputId="checkbox-select-example"
        testId="select"
        defaultValue={defaultValue}
        options={options}
        placeholder={props.label}
        onChange={onMultiSelectChange}
      />
    )
  }

  return (
    <>
      <Label htmlFor="async-select-example">{props.label}</Label>
      {props.allowMultiple ? renderMultiSelect() : renderSingleSelect()}
    </>
  );
}

export default LabelSelect;
