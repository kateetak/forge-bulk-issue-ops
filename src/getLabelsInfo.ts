import api, { route } from "@forge/api";

// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-labels/#api-rest-api-3-label-get


export const getLabelsInfo = async () => {
  const response = await api.asUser().requestJira(route`/rest/api/3/label`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  
  // console.log(`Response: ${response.status} ${response.statusText}`);
  const labels = await response.json();
  // console.log(`Labels: ${JSON.stringify(labels, null, 2)}`);
  return labels;
}