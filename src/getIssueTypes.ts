import api, { route } from "@forge/api";

// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-types/#api-rest-api-3-issuetype-get


export const getIssueTypes = async () => {
  const response = await api.asUser().requestJira(route`/rest/api/3/issuetype`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  
  const issueTypes = await response.json();
  console.log(`Issue Types: ${JSON.stringify(issueTypes, null, 2)}`);
  return issueTypes;
}