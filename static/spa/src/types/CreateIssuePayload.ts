
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-post

import { ObjectMapping } from "./ObjectMapping";

export type CreateIssuePayloadField = any;

export type CreateIssuePayload = {
  fields: ObjectMapping<CreateIssuePayloadField>;
  historyMetadata?: any;
  properties?: any[];
  transition?: any;
  update?: any;
}
