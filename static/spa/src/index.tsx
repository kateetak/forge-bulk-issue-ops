import React from 'react';
import ReactDOM from 'react-dom';
import '@atlaskit/css-reset';
import './Main.css';
import Main from './Main';

setTimeout(async () => {
  ReactDOM.render(
    <React.StrictMode>
      <Main />
    </React.StrictMode>,
    document.getElementById('root')
  );
}, 0)