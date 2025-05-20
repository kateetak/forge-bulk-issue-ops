import React from 'react';
import ReactDOM from 'react-dom';
import BulkMovePanel from './BulkMovePanel';
import '@atlaskit/css-reset';
import './BulkMove.css';
import { mockBackend } from './model/frontendConfig';

setTimeout(async () => {
  const invoke = mockBackend ? 
    ((await import('./mock/mockInvoke')).mockInvoke) :
    (await import('@forge/bridge')).invoke;
  ReactDOM.render(
    <React.StrictMode>
      <BulkMovePanel invoke={invoke}/>
    </React.StrictMode>,
    document.getElementById('root')
  );
}, 0)