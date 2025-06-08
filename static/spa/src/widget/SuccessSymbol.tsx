import React from 'react';
import SuccessIcon from '@atlaskit/icon/core/success';

export type SuccessSymbolProps = {
  label?: string;
}

const SuccessSymbol = (props: SuccessSymbolProps) => {

  return <span style={{ color: '#006644' }}><SuccessIcon spacing="none" label={props.label ?? ''} /></span>
}

export default SuccessSymbol;
