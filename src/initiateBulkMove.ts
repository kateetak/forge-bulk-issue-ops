import api, { APIResponse, route } from  '@forge/api'
import { InvocationResult } from './types/InvocationResult';
import { IssueMoveRequestOutcome } from './types/IssueMoveRequestOutcome';
import { getBasicAuthHeader, getBulkOpsAppGroupId, getSiteDomain } from './userManagementConfig';

// This is set to false since the app user can't be authorized to add/remove users to/from groups.
const manageUserGroupsUsingAppUserAccount = false

export const initiateBulkMove = async (accountId: string, bulkIssueMoveRequestData: any): Promise<InvocationResult<IssueMoveRequestOutcome>> => {
  const bulkOpsAppGroupId = getBulkOpsAppGroupId();
  let result: InvocationResult<IssueMoveRequestOutcome>;
  await addUserToGroup(accountId, bulkOpsAppGroupId);
  try {
    result = await doBulkMove(bulkIssueMoveRequestData);
  } finally {
    await removeUserFromGroup(accountId, bulkOpsAppGroupId);
  }
  return result;
}

const doBulkMove = async (bulkIssueMoveRequestData: any): Promise<InvocationResult<IssueMoveRequestOutcome>> => {
  console.log(`Initiating bulk move with request data: ${JSON.stringify(bulkIssueMoveRequestData, null, 2)}`);
  const response = await api.asUser().requestJira(route`/rest/api/3/bulk/issues/move`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bulkIssueMoveRequestData)
  });
  console.log(` * Response status: ${response.status}`);
  const invocationResult = await readResponse<IssueMoveRequestOutcome>(response);
  console.log(`Bulk issue move invocation result: ${JSON.stringify(invocationResult, null, 2)}`);
  return invocationResult;
}

const addUserToGroup = async (accountId: string, groupId: string): Promise<any> => {
  console.log(`Adding user with accountId: ${accountId} to group with groupId: ${groupId}`);
  const requestData = {
    accountId: accountId
  }
  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-groups/#api-rest-api-3-group-user-post
  let response: APIResponse;
  if (manageUserGroupsUsingAppUserAccount) {
    response = await api.asApp().requestJira(route`/rest/api/3/group/user?groupId=${groupId}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
  } else {
    response = await fetch(`https://${getSiteDomain()}/rest/api/3/group/user?groupId=${groupId}`, {
      method: 'POST',
      headers: {
        'Authorization': `${getBasicAuthHeader()}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
  }
  console.log(` * Response status: ${response.status}`);
  const result = await readResponse<any>(response);
  return result;
}

const removeUserFromGroup = async (accountId: string, groupId: string): Promise<number> => {
  console.log(`Removing user with accountId: ${accountId} from group with groupId: ${groupId}`);
  // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-groups/#api-rest-api-3-group-user-delete
  let response: APIResponse;
  if (manageUserGroupsUsingAppUserAccount) {
    response = await api.asApp().requestJira(route`/rest/api/3/group/user?groupId=${groupId}&accountId=${accountId}`, {
      method: 'DELETE'
    });
  } else {
    response = await fetch(`https://${getSiteDomain()}/rest/api/3/group/user?groupId=${groupId}&accountId=${accountId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `${getBasicAuthHeader()}`,
      }
    });
  }
  console.log(` * Response status: ${response.status}`);
  return response.status;
}

const readResponse = async <T>(response: any): Promise<InvocationResult<T>> => {
  const invocationResult: InvocationResult<T> = {
    ok: response.ok,
    status: response.status
  }
  if (response.ok) {
    const data = await response.json();
    invocationResult.data = data as T;
  } else {
    const errorMessage = await response.text();
    console.error(` * Error response: ${errorMessage}`);
    invocationResult.errorMessage = errorMessage;
  }
  return invocationResult;
}
