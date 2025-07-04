import React from 'react';
import ReactDOM from 'react-dom';
import '@atlaskit/css-reset';
// import './Main.css';
import Main from './Main';
import { view } from "@forge/bridge";


const renderApp = async (): Promise<void> => {
  await view.theme.enable();

  const theme = await view.theme;
  console.log('Theme:')
  console.log(theme)

  ReactDOM.render(
    <React.StrictMode>
      <Main />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

renderApp();
