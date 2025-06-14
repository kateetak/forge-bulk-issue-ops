import React from 'react';
import { token } from '@atlaskit/tokens';
import WarningIcon from '@atlaskit/icon/core/warning';

export type WarningSymbolProps = {
  label?: string;
}

const WarningSymbol = (props: WarningSymbolProps) => {

  return (
    <span style={{ color: token('color.icon.warning') }}>
      <WarningIcon spacing="none" label={props.label ?? ''} />
    </span>
  )
}

export default WarningSymbol;
