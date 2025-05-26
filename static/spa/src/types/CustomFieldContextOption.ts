
// See also https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-custom-field-options/#api-rest-api-3-field-fieldid-context-contextid-option-get

export type CustomFieldContextOption = {
  id: string;
  optionId?: string;
  value: string;
  disabled: boolean;
}