import React from 'react';
import { CompletionState } from 'src/types/CompletionState';
import SuccessIcon from '@atlaskit/icon/core/success';

export type PanelHeaderProps = {
  stepNumber: number;
  label: string;
  completionState: CompletionState;
}

const PanelHeader = (props: PanelHeaderProps) => {

  return (
    <div>
      <div className='panel-header'>
        <div><h3>Step {props.stepNumber}</h3></div>
        <div style={{color: '#006644'}}>{props.completionState === 'complete' ? <SuccessIcon label="Step complete" /> : null}</div>
      </div>
      <div><h4>{props.label}</h4></div>
    </div>
  );
}

export default PanelHeader;
