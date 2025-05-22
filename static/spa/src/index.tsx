import React from 'react';
import ReactDOM from 'react-dom';
import '@atlaskit/css-reset';
import './Main.css';
import { view } from '@forge/bridge';
import Main from './Main';

setTimeout(async () => {
  const history = await view.createHistory();
  const context = await view.getContext();
  const moduleKey = context.moduleKey;
  console.log(`context = ${JSON.stringify(context, null, 2)}`);
  ReactDOM.render(
    <React.StrictMode>
      <Main />
    </React.StrictMode>,
    document.getElementById('root')
  );
}, 0)