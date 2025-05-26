
import { FieldConfigurationScheme } from "./FieldConfigurationScheme";

// This is the type returned from https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-custom-field-contexts/#api-rest-api-3-field-fieldid-context-projectmapping-get

// PageResponse<ProjectCustomFieldContextMappings>
export type ProjectsFieldConfigurationSchemeMappings = {
  isLast: boolean; // e.g. true,
  maxResults: number; // e.g. 50,
  startAt: number // e.g. 0,
  total: number; // e.g. 5,
  values: ProjectCustomFieldContextMappings[]
}

export type ProjectCustomFieldContextMappings = {
  contextId: string;
  projectId?: string;
  isGlobalContext?: boolean;
}

// Example:
// {
//   "isLast": true,
//   "maxResults": 100,
//   "startAt": 0,
//   "total": 2,
//   "values": [
//     {
//       "contextId": "10025",
//       "projectId": "10001"
//     },
//     {
//       "contextId": "10026",
//       "isGlobalContext": true
//     }
//   ]
// }