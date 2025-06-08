import React from 'react';
import { CompletionState } from 'src/types/CompletionState';
import ShowMoreHorizontalIcon from '@atlaskit/icon/core/show-more-horizontal';
import SuccessSymbol from './SuccessSymbol';

export type PanelHeaderProps = {
  stepNumber: number;
  label: string;
  completionState: CompletionState;
}

const PanelHeader = (props: PanelHeaderProps) => {
  const iconColor = props.completionState === 'complete' ? '#006644' : '#0747A6';

  return (
    <div>
      <div className='panel-header'>
        <div><h3>Step {props.stepNumber}</h3></div>
        <div style={{color: iconColor}}>
          {
          props.completionState === 'complete' ? 
            <SuccessSymbol label="Step complete" /> : 
            <ShowMoreHorizontalIcon label="Step incomplete" />
          }
        </div>
      </div>
      <div><h4>{props.label}</h4></div>
    </div>
  );
}

export default PanelHeader;
