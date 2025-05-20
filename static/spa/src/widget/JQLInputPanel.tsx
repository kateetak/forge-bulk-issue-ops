import React, { useEffect, useState } from 'react';
import Button from '@atlaskit/button/new';
import { FormSection, Label } from '@atlaskit/form';
import Textfield from '@atlaskit/textfield';

export type JQLInputPanelProps = {
  label: string;
  placeholder: string;
  onJQLChange: (jql: string) => Promise<void>;
  onExecute: (jql: string) => Promise<void>;
}

const JQLInputPanel = (props: JQLInputPanelProps) => {

  const [editedJql, setEditedJql] = useState<string>('');

  const onChange = async (event: any): Promise<void> => {
    // console.log(`JQLInputPanel.onChange: `, selectedOption);
    const newJql = event.target.value;
    setEditedJql(newJql);
    // await props.onJQLChange(newJql);
  }

  const onExecuteJql = async (): Promise<void> => {
    await props.onExecute(editedJql);
  }

  const buttonEnabled = editedJql.length > 0;

  return (
    <>
      <FormSection>
        <Label htmlFor="jql-textfield">{props.label}</Label>
        <Textfield
          id="jql-textfield"
          name="jql"
          placeholder={props.placeholder}
          onChange={onChange}
        />
      </FormSection>
      <FormSection>
        <Button
          appearance={buttonEnabled ? 'primary' : 'default'}
          isDisabled={!buttonEnabled}
          onClick={onExecuteJql}
        >
          Execute
        </Button>
      </FormSection>
    </>
  );
}

export default JQLInputPanel;
