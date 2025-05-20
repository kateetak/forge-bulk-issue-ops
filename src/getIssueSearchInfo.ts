import api, { route } from "@forge/api";
import { IssueSearchInfo } from "./types/IssueSearchInfo";
import { IssueSearchParameters } from "./types/IssueSearchParameters";

// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/#api-rest-api-3-search-jql-get


export const getIssueSearchInfo = async (issueSearchParameters: IssueSearchParameters): Promise<IssueSearchInfo> => {
  let jql = `project=${issueSearchParameters.projectId}`;
  if (issueSearchParameters.issueTypeIds.length) {
    const issueTypeIdsCsv = issueSearchParameters.issueTypeIds.join(',');
    jql += ` and issuetype in (${issueTypeIdsCsv})`;
  }
  if (issueSearchParameters.labels.length) {
    const labelsCsv = issueSearchParameters.labels.join(',');
    jql += ` and labels in (${labelsCsv})`;
  }
  return await getIssueSearchInfoByJql(jql);
}

export const getIssueSearchInfoByJql = async (jql: string): Promise<IssueSearchInfo> => {
  const maxResults = 100;
  const fields = 'summary,description';
  const expand = '';
  console.log(` * jql=${jql}`);
  const response = await api.asUser().requestJira(route`/rest/api/3/search/jql?jql=${jql}&maxResults=${maxResults}&fields=${fields}&expand=${expand}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  
  // console.log(`Response: ${response.status} ${response.statusText}`);
  const issuesSearchInfo = await response.json();
  console.log(`issuesSearchInfo: ${JSON.stringify(issuesSearchInfo, null, 2)}`);
  return issuesSearchInfo;
}