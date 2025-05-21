import api, { route } from "@forge/api";
import { IssueSearchInfo } from "./types/IssueSearchInfo";
import { IssueSearchParameters } from "./types/IssueSearchParameters";

// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/#api-rest-api-3-search-jql-get


export const getIssueSearchInfo = async (issueSearchParameters: IssueSearchParameters): Promise<IssueSearchInfo> => {
  let jql = '';
  if (issueSearchParameters.projects.length) {
    const projectIdsCsv = issueSearchParameters.projects.map(project => project.id).join(',');
    jql += `project in (${projectIdsCsv})`;
  }
  if (issueSearchParameters.issueTypes.length) {
    const issueTypeIdsCsv = issueSearchParameters.projects.map(issueType => issueType.id).join(',');
    jql += ` and issuetype in (${issueTypeIdsCsv})`;
  }

  if (issueSearchParameters.labels.length) {
    const labelsCsv = issueSearchParameters.labels.join(',');
    jql += ` and labels in (${labelsCsv})`;
  }

  // TODO: Make the query bounded
  // jql += ` and updated > -10000d`;

  console.log(` * built JQL: ${jql}`);
  return await getIssueSearchInfoByJql(jql);
}

export const getIssueSearchInfoByJql = async (jql: string): Promise<IssueSearchInfo> => {
  const maxResults = 100;
  const fields = 'summary,description,issuetype';
  // const fields = '*all';
  const expand = 'renderedFields';
  console.log(` * jql=${jql}`);
  const paramsString = `jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=${fields}&expand=${expand}`;
  console.log(` * paramsString = ${paramsString}`);


  const queryParams = new URLSearchParams(paramsString);


  // route`/rest/api/3/issue/${issueKey}?${queryParams}`;

  const response = await api.asUser().requestJira(route`/rest/api/3/search/jql?${queryParams}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  
  // console.log(`Response: ${response.status} ${response.statusText}`);
  const issuesSearchInfo = await response.json();
  // console.log(`issuesSearchInfo: ${JSON.stringify(issuesSearchInfo, null, 2)}`);
  return issuesSearchInfo;
}