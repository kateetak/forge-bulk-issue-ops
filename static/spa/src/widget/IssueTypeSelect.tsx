import React, { useEffect, useState } from 'react';
import { Label } from '@atlaskit/form';
import Select from '@atlaskit/select';
import { Option } from '../types/Option'
import { IssueType } from '../types/IssueType';
import { formatIssueType } from 'src/controller/formatters';

/*
  Select docs: https://atlassian.design/components/select/examples
*/

export type IssueTypeSelectProps = {
  label: string;
  isDisabled?: boolean;
  isClearable?: boolean;
  selectedIssueType: IssueType | undefined;
  selectableIssueTypes: IssueType[];
  onIssueTypeSelect: (selectedIssueType: undefined | IssueType) => Promise<void>;
}

const IssueTypeSelect = (props: IssueTypeSelectProps) => {

  const [issueTypeInfoRetrievalTime, setIssueTypeInfoRetrievalTime] = useState<number>(0);
 
  const onChange = async (selectedOption: undefined | Option): Promise<void> => {
    // console.log(`IssueTypeSelect.onChange: `, selectedOptions);
    const issueTypes: IssueType[] = props.selectableIssueTypes;;
    const selectedIssueTypes: IssueType[] = [];
    const issueType = selectedOption ? issueTypes.find(issueType => issueType.id === selectedOption.value) : undefined;
    await props.onIssueTypeSelect(issueType);
  }

  const renderCheckboxSelect = () => {
    const issueTypes: IssueType[] = props.selectableIssueTypes;;
    // console.log(`Rendering issue types select. project ID = ${projectId}, issueTypes.length = ${issueTypes.length}`);
    const options: Option[] = issueTypes.map((issueType: any) => ({
      label: formatIssueType(issueType),
      value: issueType.id,
    }));
    let initiallySelectedOption: undefined | Option = undefined;
    for (const option of options) {
      const selected = props.selectedIssueType ? props.selectedIssueType.id === option.value : false;
      // console.log(`Checking option ${option.label} / ${option.value} against ${JSON.stringify(props.selectedIssueTypeIds)}. selected = ${selected}`);
      if (selected) {
        initiallySelectedOption = option;
      }
    }
    return (
      <Select
        key={`multi-issue-types-select-${issueTypeInfoRetrievalTime}`}
        inputId="checkbox-select-example"
        testId="issue-types-select"
        isMulti={false}
        isDisabled={props.isDisabled}
        isClearable={props.isClearable}
        defaultValue={initiallySelectedOption}
        options={options}
        placeholder={props.label}
        onChange={onChange}
      />
    );
  }

  return (
    <>
      <Label htmlFor="async-select-example">{props.label}</Label>
      {renderCheckboxSelect()}
    </>
  );
}

export default IssueTypeSelect;
