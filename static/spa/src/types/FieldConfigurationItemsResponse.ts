
// This is returned from https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-field-configurations/#api-rest-api-3-fieldconfiguration-id-fields-get

import { FieldConfigurationItem } from "./FieldConfigurationItem";

export type FieldConfigurationItemsResponse = {
  isLast: boolean; // e.g. true,
  maxResults: number; // e.g. 50,
  startAt: number // e.g. 0,
  total: number; // e.g. 5,
  values: FieldConfigurationItem[]
}
