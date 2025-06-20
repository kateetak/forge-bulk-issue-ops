import React, { useEffect, useState } from 'react';
import { Label } from '@atlaskit/form';
import { CheckboxSelect } from '@atlaskit/select';
import { Option } from '../types/Option'
import { IssueType } from '../types/IssueType';
import { formatIssueType } from 'src/controller/formatters';
import { BulkOperationMode } from 'src/types/BulkOperationMode';
import bulkOperationRuleEnforcer from 'src/extension/bulkOperationRuleEnforcer';

/*
  Select docs: https://atlassian.design/components/select/examples
*/

export type IssueTypesSelectProps = {
  label: string;
  selectedIssueTypeIds: string[];
  possiblySelectableIssueTypes: IssueType[];
  menuPortalTarget?: HTMLElement;
  bulkOperationMode: BulkOperationMode;
  filterAllowedIssueTypes: (issueTypes: IssueType[], bulkOperationMode: BulkOperationMode) => Promise<IssueType[]>;
  onIssueTypesSelect: (selectedIssueTypes: IssueType[]) => Promise<void>;
}

const IssueTypesSelect = (props: IssueTypesSelectProps) => {

  const [issueTypeInfoRetrievalTime, setIssueTypeInfoRetrievalTime] = useState<number>(0);
  const [selectableIssueTypes, setSelectableIssueTypes] = useState<IssueType[]>([]);

  const updateSelecatbleIssueTypes = async (
    issueTypes: IssueType[],
    bulkOperationMode: BulkOperationMode
  ): Promise<void> => {
      const selectableIssueTypes: IssueType[] = await bulkOperationRuleEnforcer.filterSourceProjectIssueTypes(issueTypes, bulkOperationMode);
      setSelectableIssueTypes(selectableIssueTypes);
  }

  useEffect(() => {
    updateSelecatbleIssueTypes(props.possiblySelectableIssueTypes, props.bulkOperationMode)
  }, []);

  useEffect(() => {
    updateSelecatbleIssueTypes(props.possiblySelectableIssueTypes, props.bulkOperationMode)
  }, [props.possiblySelectableIssueTypes]);

  const onChange = async (selectedOptions: Option[]): Promise<void> => {
    // console.log(`IssueTypesSelect.onChange: `, selectedOptions);
    const issueTypes: IssueType[] = selectableIssueTypes;
    // const 
    const selectedIssueTypes: IssueType[] = [];
    for (const selectedOption of selectedOptions) {
      const issueType = issueTypes.find(issueType => issueType.id === selectedOption.value);
      if (issueType) {
        selectedIssueTypes.push(issueType);
      }
    }
    await props.onIssueTypesSelect(selectedIssueTypes);
  }

  const renderCheckboxSelect = () => {
    const issueTypes: IssueType[] = selectableIssueTypes;;
    // console.log(`Rendering issue types select. project ID = ${projectId}, issueTypes.length = ${issueTypes.length}`);
    const options: Option[] = issueTypes.map((issueType: any) => ({
      label: formatIssueType(issueType),
      value: issueType.id,
    }));
    const initiallySelectedOptions: Option[] = [];
    for (const option of options) {
      const selected = props.selectedIssueTypeIds.find(selectedIssueTypeId => selectedIssueTypeId === option.value);
      // console.log(`Checking option ${option.label} / ${option.value} against ${JSON.stringify(props.selectedIssueTypeIds)}. selected = ${selected}`);
      if (selected) {
        initiallySelectedOptions.push(option);
      }
    }
    return (
      <CheckboxSelect
        key={`multi-issue-types-select-${issueTypeInfoRetrievalTime}`}
        inputId="checkbox-select-example"
        testId="issue-types-select"
        defaultValue={initiallySelectedOptions}
        options={options}
        placeholder={props.label}
        menuPortalTarget={props.menuPortalTarget}
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

export default IssueTypesSelect;
