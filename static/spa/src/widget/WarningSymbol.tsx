import React from 'react';
import WarningIcon from '@atlaskit/icon/core/warning';

export type WarningSymbolProps = {
  label?: string;
}

const WarningSymbol = (props: WarningSymbolProps) => {

  return <span style={{ color: '#FFAB00' }}><WarningIcon spacing="none" label={props.label ?? ''} /></span>
}

export default WarningSymbol;
