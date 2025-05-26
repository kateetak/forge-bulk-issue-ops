import React, { useEffect, useState } from 'react';
import Button from '@atlaskit/button/new';
import { FormSection, Label } from '@atlaskit/form';
// import Textfield from '@atlaskit/textfield';
import TextArea from '@atlaskit/textarea';

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
  }

  const onExecuteJql = async (): Promise<void> => {
    await props.onExecute(editedJql);
  }

  const buttonEnabled = editedJql.length > 0;

  return (
    <>
      <FormSection>
        <Label htmlFor="jql-textfield">{props.label}</Label>
        <TextArea
          id="jql-textfield"
          name="jql"
          resize="vertical"
          minimumRows={3}
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
