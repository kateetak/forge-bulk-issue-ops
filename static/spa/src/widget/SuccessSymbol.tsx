import React from 'react';
import { token } from '@atlaskit/tokens';
import SuccessIcon from '@atlaskit/icon/core/success';

export type SuccessSymbolProps = {
  label?: string;
}

const SuccessSymbol = (props: SuccessSymbolProps) => {
  return (
    <span style={{ color: token("color.icon.success") }}>
      <SuccessIcon spacing="none" label={props.label ?? ''} />
    </span>
  )
}

export default SuccessSymbol;
