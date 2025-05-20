import api, { route } from "@forge/api";

// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-projects/#api-rest-api-3-project-search-get


export const getProjectSearchInfo = async () => {
  const response = await api.asUser().requestJira(route`/rest/api/3/project/search`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  
  // console.log(`Response: ${response.status} ${response.statusText}`);
  const projects = await response.json();
  console.log(`Projects: ${JSON.stringify(projects, null, 2)}`);
  return projects;
}