import React, { useEffect, useState } from "react";
import Button, { IconButton } from '@atlaskit/button/new';
import Textfield from '@atlaskit/textfield';
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
import CrossCircleIcon from '@atlaskit/icon/core/cross-circle';
import { PanelMessage, renderPanelMessage } from "./PanelMessage";
import { BulkOperationMode } from "src/types/BulkOperationMode";

export type IssueSelectionValidity = "valid" | "invalid-no-issues-selected" | "multiple-projects" | "multiple-issue-types";

export type IssueSelectionState = {
  selectedIssues: Issue[];
  selectionValidity: IssueSelectionValidity;
}

export type IssueSelectionPanelProps = {
  loadingState: LoadingState;
  issueSearchInfo: IssueSearchInfo;
  selectedIssues: Issue[];
  bulkOperationMode: BulkOperationMode;
  computeSelectionValidity: (selectedIssues: Issue[]) => IssueSelectionValidity;
  onIssuesSelectionChange: (issueSelectionState: IssueSelectionState) => Promise<void>;
}

export const IssueSelectionPanel = (props: IssueSelectionPanelProps) => {

  const initialMultipleProjectsDetected = jiraUtil.countProjectsByIssues(props.issueSearchInfo.issues) > 1;
  const initialMultipleIssueTypesDetected = jiraUtil.countIssueTypesByIssues(props.issueSearchInfo.issues) > 1;
  const [issueKeyOrSummaryFilter, setIssueKeyOrSummaryFilter] = useState<string>('');
  const [selectionValidity, setStateValidity] = useState<IssueSelectionValidity>(props.computeSelectionValidity(props.issueSearchInfo.issues));

  useEffect(() => {
    const selectionValidity = props.computeSelectionValidity(props.issueSearchInfo.issues);
    setStateValidity(selectionValidity);
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
    // console.log(` * IssueSelectionPanel: Computed new issue selection: ${newSelectedIssues.map(issue => issue.key).join(', ')}`);

    const selectionValidity = props.computeSelectionValidity(newSelectedIssues);
    setStateValidity(selectionValidity);
    const issueSelectionState: IssueSelectionState = {
      selectedIssues: newSelectedIssues,
      selectionValidity: selectionValidity
    }
    props.onIssuesSelectionChange(issueSelectionState);
  }

  const onSelectAllIssues = () => {
    const newSelectedIssues: Issue[] = [];
    let changeDetected = false;
    for (const issue of props.issueSearchInfo.issues) {
      const currentlySelected = props.selectedIssues.find(selectedIssue => selectedIssue.key === issue.key);
      changeDetected = changeDetected || !currentlySelected;
      newSelectedIssues.push(issue);
    }

    const selectionValidity = props.computeSelectionValidity(newSelectedIssues);
    setStateValidity(selectionValidity);
    const issueSelectionState: IssueSelectionState = {
      selectedIssues: newSelectedIssues,
      selectionValidity: selectionValidity
    }
    props.onIssuesSelectionChange(issueSelectionState);
  }

  const onDeselectAllIssues = () => {
    let changeDetected = false;
    for (const issue of props.issueSearchInfo.issues) {
      const currentlySelected = props.selectedIssues.find(selectedIssue => selectedIssue.key === issue.key);
      changeDetected = changeDetected || !!currentlySelected;
    }
    const selectionValidity = props.computeSelectionValidity([]);
    setStateValidity(selectionValidity);
    const issueSelectionState: IssueSelectionState = {
      selectedIssues: [],
      selectionValidity: selectionValidity
    }
    props.onIssuesSelectionChange(issueSelectionState);
  }

  const renderIssueLoading = () => {
    return (
      <div>
        {props.loadingState === 'busy' ? <LinearProgress color="secondary" /> : <div style={{height: '4px'}}></div>} 
      </div>
    );
  }

  const renderInfoPanel = () => {
    return (
      <PanelMessage
          message={`Moving or Editing issues in one of the following statuses is not supported 'DONE', 'ON HOLD', 'CANCELLED'`}
          className="info-banner"
        />
    );
  };

  const renderClearFilterControl = () => {
    return (
      <IconButton
        label="Clear"
        appearance="subtle"
        value={issueKeyOrSummaryFilter}
        icon={CrossCircleIcon}
        onClick={() => {
          setIssueKeyOrSummaryFilter('');
        }}
      />
    );
  }

  const renderFieldNameFilterControl = () => {
    return (
      <Textfield
        name='issueKeyOrSummaryFilter'
        placeholder='Filter issues...'
        value={issueKeyOrSummaryFilter}
        isCompact={true}
        elemAfterInput={renderClearFilterControl()}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const filterValue = event.currentTarget.value;
          setIssueKeyOrSummaryFilter(filterValue);
        }}
      />
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
        <div style={{marginLeft: '8px'}}>
          <Button
            appearance="default"
            onClick={() => {
              onDeselectAllIssues();
            }}
          >
            None
          </Button>
        </div>
        <div style={{marginLeft: '8px', flexGrow: 100}}>
          {renderFieldNameFilterControl()}
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

  const renderStateValidityMessage = () => {
    if (selectionValidity === 'invalid-no-issues-selected') {
      return (
        <PanelMessage
          message={`No work items selected. Please select at least one work item.`}
          className="warning-banner"
        />
      );
    } else if (selectionValidity === 'multiple-projects') {
      return (
        <PanelMessage
          message={`The selected work items are from multiple projects, but this is not supported. Please select work items from a single project.`}
          className="warning-banner"
        />
      );
    } else if (selectionValidity === 'multiple-issue-types') {
      return (
        <PanelMessage
          message={`The selected work items are of multiple work item types, but this is not supported. Please select work items of a single work item type.`}
          className="warning-banner"
        />
      );
    } else {
      return null;
    }
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
    const issueKeyOrSummaryFilterUpper = issueKeyOrSummaryFilter.toUpperCase();
    const filterIssues = issueKeyOrSummaryFilter.length > 0 ? props.issueSearchInfo.issues.filter(issue => {
      const issueKey = issue.key.toUpperCase();
      const issueSummary = issue.fields.summary.toUpperCase();
      return issueKey.includes(issueKeyOrSummaryFilterUpper) || issueSummary.includes(issueKeyOrSummaryFilterUpper);
    }) : props.issueSearchInfo.issues;
    const renderedIssueRows = hasIssues ? filterIssues.map(renderIssueRow) : null;
    const renderedIssuesTable = hasIssues ? (
      <table className="issue-selection-table data-table">
        <tbody>
          {renderedIssueRows}
        </tbody>
      </table>
    ) : null;

    let renderedQuantityMessage: JSX.Element | null = null;
    if (props.issueSearchInfo.issues.length) {
      const containerStyle: any = {margin: '20px 0px'};
      if (!props.issueSearchInfo.isLast) {
        renderedQuantityMessage = (
          <PanelMessage
            containerStyle={containerStyle}
            message={`Note: only ${props.issueSearchInfo.issues.length} work items can be ${props.bulkOperationMode === 'Edit' ? 'edited' : 'moved'} at a time, but more works items match the search criteria.`}
          />
        );
      } else {
        renderedQuantityMessage = (
          <PanelMessage
            containerStyle={containerStyle}
            message={`Found ${props.issueSearchInfo.issues.length} work items.`}
          />
        );
      }
    }

    return (
      <>
        {renderIssueLoading()}
        <FormSection>
          {renderInfoPanel()}
          {renderStateValidityMessage()}
          {renderedQuantityMessage}
          <div  className="data-table-container">
            {renderGlobalSelectionControls()}
            {renderedIssuesTable}
          </div>
        </FormSection>
      </>
    );
  }

  const renderNoResults = () => {
    return renderPanelMessage(
      `No work items found matching the search criteria.`, { margin: '20px 0px' }
    );
  }

  const renderPlaceholder = () => {
    return (
      <div style={{ margin: '20px 0px' }}>
        <div style={{ opacity: 0.2 }}>
          <img src={placeholderImage} width="220px" alt="placeholder" />
        </div>
      </div>
    );
  }

  const nilSearch =
    props.issueSearchInfo.issues.length === 0 &&
    props.issueSearchInfo.total === 0 &&
    props.issueSearchInfo.maxResults === 0;
  return (
    <>

      {nilSearch ? renderPlaceholder() : props.issueSearchInfo.issues.length === 0 ? renderNoResults() : renderIssuesPanel()}
    </>
  );

}