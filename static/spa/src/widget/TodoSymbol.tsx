import React from 'react';
import { token } from '@atlaskit/tokens';
import ShowMoreHorizontalIcon from '@atlaskit/icon/core/show-more-horizontal';

export type TodoSymbolProps = {
  label?: string;
}

const TodoSymbol = (props: TodoSymbolProps) => {
  return (
    <span style={{ color: token("color.icon.subtle") }}>
      <ShowMoreHorizontalIcon spacing="none" label={props.label ?? ''} />
    </span>
  )
}

export default TodoSymbol;
