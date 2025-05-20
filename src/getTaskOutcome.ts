import api, { route } from "@forge/api";

// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-tasks/#api-rest-api-3-task-taskid-get

export const getTaskOutcome = async (taskId: string): Promise<any> => {
  const response = await api.asUser().requestJira(route`/rest/api/3/task/${taskId}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
 
  // console.log(`Response: ${response.status} ${response.statusText}`);
  const outcome = await response.json();
  console.log(`Task outcome: ${JSON.stringify(outcome, null, 2)}`);
  return outcome;
}
