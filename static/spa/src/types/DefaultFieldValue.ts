

// See the targetMandatoryFields section of https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-bulk-operations/#api-rest-api-3-bulk-issues-move-post

export type DefaultFieldValue = {
  retain: boolean;
  type: 'raw' | 'adf';
  value: any[];
}
