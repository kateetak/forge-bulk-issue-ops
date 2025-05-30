import React, { Fragment, useEffect, useState } from "react";
import { router, NavigationTarget, view } from '@forge/bridge';
import { Router, Route, Routes, useNavigate } from "react-router";
import BulkOperationPanel from "./panel/BulkOperationPanel";
import BulkEditPanel from "./panel/BulkEditPanel";
import BulkImportPanel from "./panel/BulkImportPanel";

export type HomeProps = {
  history: any;
}

// https://developer.atlassian.com/platform/forge/add-routing-to-a-full-page-app/
// https://developer.atlassian.com/platform/forge/apis-reference/ui-api-bridge/view/#createhistory
const Home = (props: HomeProps) => {

  const renderMainPanel = (path: string, title: string, description: string) => {
    return (
      <div className="padding-panel" onClick={() => {
        props.history.push(`/${path}`);
      }}>
        <div className="content-panel">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="bulk-move-main-panel clickable">
        {renderMainPanel('move', 'Bulk Move Issues', `Use this functionality to move a large number of issues from one or more projects to another project.`)}
        {renderMainPanel('edit', 'Bulk Edit Issues', `Use this functionality to edit a large number of issues in a similar way to each other.`)}
        {renderMainPanel('import', 'Bulk Import Issues', `Using this functionality to import a large number of issues.`)}
      </div>
    </Fragment>
  );
}

const Main = () => {

  const [history, setHistory] = useState(null);

  useEffect(() => {
    // When the app mounts, we use the view API to create a history "log"
    view.createHistory().then((newHistory) => {
      setHistory(newHistory);
    });
  }, []);

  const [historyState, setHistoryState] = useState(null);

  useEffect(() => {
    if (!historyState && history) {
      // The initial values of action and location will be the app URL
      setHistoryState({
        action: history.action,
        location: history.location,
      });
    }
  }, [history, historyState]);

  useEffect(() => {
    if (history) {
      // Starts listening for location changes and calls the given callback when changed
      history.listen((location, action) => {
        setHistoryState({
          action,
          location,
        });
      });
    }
  }, [history]);

  return (
    <div>
      {history && historyState ? (
        <Router
          navigator={history}
          navigationType={historyState.action}
          location={historyState.location}
        >
          <Routes>
            <Route path="/" element={<Home history={history} />}></Route>
            <Route path="/move" element={<BulkOperationPanel key="Move" bulkOperationMode="Move" />}></Route>
            <Route path="/edit" element={<BulkOperationPanel key="Edit" bulkOperationMode="Edit" />}></Route>
            <Route path="/import" element={<BulkImportPanel />}></Route>
          </Routes>
        </Router>
      ) : (
        "Loading..."
      )}
    </div>
  );
}

export default Main;
