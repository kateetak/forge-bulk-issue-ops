import React, { useEffect, useState } from "react";
import Button from '@atlaskit/button/new';
import { FormSection } from "@atlaskit/form";
import { LoadingState } from "../types/LoadingState";
import { LinearProgress } from '@mui/material';
import Lozenge from "@atlaskit/lozenge";
import Toggle from "@atlaskit/toggle";
import { IssueSearchInfo } from "../types/IssueSearchInfo";
import { Issue } from "../types/Issue";
import placeholderImage from './issue-filter-placeholder.png';
import jiraUtil from "src/controller/jiraUtil";
import { IssueLink } from "./IssueLink";

export type IssueSelectionPanelProps = {
  loadingState: LoadingState;
  issueSearchInfo: IssueSearchInfo;
  selectedIssues: Issue[];
  allowBulkMovesFromMultipleProjects: boolean;
  onIssuesSelectionChange: (selectedIssues: Issue[]) => Promise<void>;
}

export const IssueSelectionPanel = (props: IssueSelectionPanelProps) => {

  const [multipleProjectsDetected, setMultipleProjectsDetected] = useState<boolean>(
    jiraUtil.countProjectsByIssues(props.issueSearchInfo.issues) > 1);

  useEffect(() => {
    setMultipleProjectsDetected(jiraUtil.countProjectsByIssues(props.issueSearchInfo.issues) > 1);
  }, [props.issueSearchInfo.issues]);


  const onToggleIssueSelection = (issueToToggle: Issue) => {
    const newSelectedIssues: Issue[] = [];
    for (const issue of props.issueSearchInfo.issues) {
      const existingSelectedIssueKey = props.selectedIssues.find((selectedIssue: Issue) => {
        return selectedIssue.key === issue.key;
      });
      const issueIsSelected = !!existingSelectedIssueKey;
      if (issue.key === issueToToggle.key) {
        if (issueIsSelected) {
          // don't add
        } else {
          newSelectedIssues.push(issue);
        }
      } else if (issueIsSelected){
        newSelectedIssues.push(issue);
      }
    }
    console.log(` * IssueSelectionPanel: Computed new issue selection: ${newSelectedIssues.map(issue => issue.key).join(', ')}`);
    props.onIssuesSelectionChange(newSelectedIssues);
  }

  const onSelectAllIssues = () => {
    const newSelectedIssues: Issue[] = [];
    let changeDetected = false;
    for (const issue of props.issueSearchInfo.issues) {
      const currentlySelected = props.selectedIssues.find(selectedIssue => selectedIssue.key === issue.key);
      changeDetected = changeDetected || !currentlySelected;
      newSelectedIssues.push(issue);
    }
    props.onIssuesSelectionChange(newSelectedIssues);
  }

  const onDeselectAllIssues = () => {
    let changeDetected = false;
    for (const issue of props.issueSearchInfo.issues) {
      const currentlySelected = props.selectedIssues.find(selectedIssue => selectedIssue.key === issue.key);
      changeDetected = changeDetected || !!currentlySelected;
    }
    props.onIssuesSelectionChange([]);
  }

  const renderIssueLoading = () => {
    return (
      <div style={{margin: '12px 0px 12px 0px'}}>
        {props.loadingState === 'busy' ? <LinearProgress color="secondary" /> : <div style={{height: '4px'}}></div>} 
      </div>
    );
  }

  const renderGlobalSelectionControls = () => {
    return (
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '12px'}}>
        <Button
          appearance="default"
          onClick={() => {
            onSelectAllIssues();
          }}
        >
          All
        </Button>
        <div style={{marginLeft: '6px'}}>
          <Button
            appearance="default"
            onClick={() => {
              onDeselectAllIssues();
            }}
          >
            None
          </Button>
        </div>
      </div>
    );
  }

  const renderIssueSelectionWidget = (issue: Issue) => {
    return (
      <div>
        <Toggle
          key={`issue-select-${issue.key}`}
          id={`toggle-${issue.key}`}
          isChecked={!!props.selectedIssues.find(selectedIssue => selectedIssue.key === issue.key)}
          // isDisabled={multipleProjectsDetected || globalSelectionMode !== 'Some'}
          onChange={(event: any) => {
            onToggleIssueSelection(issue);
          }}
        />
      </div>
    )
  }

  const renderMultipleProjectsError = () => {
    return (
      <div className="inline-error-message">
        <p>The issues are in multiple projects but this is not supported. Please select issues from a single project or enable bulk moves from multiple projects in the app settings.</p>
      </div>
    );
  }

  const renderIssueRow = (issue: Issue) => {
    return (
      <tr key={`issue-roe-${issue.key}`}>
        <td>
          {renderIssueSelectionWidget(issue)}
        </td>
        <td className={`issue-summary-panel ${issue.fields.issuetype.id ? '' : 'disabled-text'}`}>
          <Lozenge appearance="inprogress">{issue.fields.issuetype.name}</Lozenge>
        </td>
        <td className={`issue-summary-panel clip-text-300 ${issue.fields.issuetype.id ? '' : 'disabled-text'}`}>
          <IssueLink
            issueKey={issue.key}
            issueSummary={issue.fields.summary}
          />
        </td>
      </tr>
    );
  }

  const renderIssuesPanel = () => {
    const hasIssues = props.issueSearchInfo.issues.length > 0;
    const renderedIssueRows = hasIssues ? props.issueSearchInfo.issues.map(renderIssueRow) : null;
    const renderedIssuesTable = hasIssues ? (
      <table className="issue-selection-table">
        <tbody>
          {renderedIssueRows}
        </tbody>
      </table>
    ) : null;
    return (
      <>
        <div style={{marginTop: '20px', marginBottom: '-20px'}}>
          {multipleProjectsDetected ? renderMultipleProjectsError() : null}
        </div>
        {renderIssueLoading()}
        <FormSection>
          {renderGlobalSelectionControls()}
          {renderedIssuesTable}
        </FormSection>
      </>
    );
  }

  const renderPlaceholder = () => {
    return (
      <div style={{ margin: '20px 0px' }}>
        <div style={{ opacity: 0.5 }}>
          <img src={placeholderImage} width="220px" alt="placeholder" />
        </div>
      </div>
    );
  }

  return (
    <>
      {props.issueSearchInfo.issues.length === 0 ? renderPlaceholder() : renderIssuesPanel()}
    </>
  );

}